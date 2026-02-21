import React, { useEffect, useMemo, useRef, useState } from "react";
import type { ApiError } from "../../api/http";
import { getVideoCategories, type VideoCategoryResponse } from "../../api/videoCategories";
import {
  createVideo,
  deleteVideo,
  getAllVideos,
  setVideoRelations,
  updateVideo,
  type StreamingVideoCreateRequest,
  type StreamingVideoResponse,
  type StreamingVideoUpdateRequest,
} from "../../api/streamingVideos";
import { getPurchasesByVideo } from "../../api/purchasesAdmin";
import { getCollaborators, type CollaboratorResponse } from "../../api/collaborators";
import { uploadImage } from "../../api/uploads";

function getErrorMessage(err: unknown): string {
  const maybe = err as Partial<ApiError> | null;
  if (maybe && typeof maybe === "object" && typeof maybe.message === "string") return maybe.message;
  if (err instanceof Error) return err.message;
  return "Não foi possível concluir. Tente novamente.";
}

type VideoRowStats = {
  purchaseCount?: number;
};

const AGE_RATINGS = ["L", "M3", "M6", "M12", "M14", "M16", "M18"] as const;
type AgeRatingValue = (typeof AGE_RATINGS)[number];

function isAgeRatingValue(v: string): v is AgeRatingValue {
  return (AGE_RATINGS as readonly string[]).includes(v);
}

function ageLabel(v: AgeRatingValue): string {
  switch (v) {
    case "L":
      return "L — Livre";
    case "M3":
      return "M/3 — +3";
    case "M6":
      return "M/6 — +6";
    case "M12":
      return "M/12 — +12";
    case "M14":
      return "M/14 — +14";
    case "M16":
      return "M/16 — +16";
    case "M18":
      return "M/18 — +18";
    default:
      return v;
  }
}

function normalizeAgeRating(v: unknown): AgeRatingValue {
  const s = String(v ?? "").trim().toUpperCase();
  if (isAgeRatingValue(s)) return s;

  const normalized = s.replace(/\s/g, "").replace("/", "");
  const maybe = AGE_RATINGS.find((x) => x.replace("/", "") === normalized);
  return maybe ?? "L";
}

function formatEUR(value: number): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

function toNumberOrNull(v: string): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function clampYear(y: number): number {
  const now = new Date().getFullYear();
  if (y < 1800) return 1800;
  if (y > now + 1) return now + 1;
  return y;
}

export default function AdminVideosTab() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [videos, setVideos] = useState<StreamingVideoResponse[]>([]);
  const [categories, setCategories] = useState<VideoCategoryResponse[]>([]);
  const [collaborators, setCollaborators] = useState<CollaboratorResponse[]>([]);

  const [q, setQ] = useState("");
  const [statsById, setStatsById] = useState<Record<number, VideoRowStats>>({});

  const [name, setName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");
  const [thumbImage, setThumbImage] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [ageRating, setAgeRating] = useState<AgeRatingValue>("L");
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [collaboratorIds, setCollaboratorIds] = useState<number[]>([]);

  const [priceStr, setPriceStr] = useState("");
  const [yearStr, setYearStr] = useState("");

  const thumbCreateInputRef = useRef<HTMLInputElement | null>(null);

  const load = async () => {
    setBusy(true);
    setError(null);
    try {
      const [v, c, col] = await Promise.all([getAllVideos(), getVideoCategories(), getCollaborators()]);
      setVideos(v);
      setCategories(c);
      setCollaborators(col);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return videos;
    return videos.filter((v) => v.name.toLowerCase().includes(s));
  }, [videos, q]);

  const parsedPrice = useMemo(() => toNumberOrNull(priceStr.trim()), [priceStr]);

  const parsedYear = useMemo(() => {
    const n = toNumberOrNull(yearStr.trim());
    if (n == null) return null;
    return clampYear(Math.trunc(n));
  }, [yearStr]);

  const canCreate = useMemo(() => {
    if (busy) return false;
    if (!name.trim() || name.trim().length > 200) return false;
    if (!videoUrl.trim() || videoUrl.trim().length > 500) return false;

    if (!thumbImage.trim() || thumbImage.trim().length > 500) return false;

    if (!trailerUrl.trim() || trailerUrl.trim().length > 500) return false;
    if (synopsis.trim().length > 2000) return false;

    if (parsedPrice == null || parsedPrice <= 0) return false;
    if (parsedYear == null || parsedYear < 1900) return false;

    return Boolean(ageRating);
  }, [busy, name, videoUrl, trailerUrl, thumbImage, synopsis, ageRating, parsedPrice, parsedYear]);

  const pickCreateThumb = () => {
    thumbCreateInputRef.current?.click();
  };

  const onCreateThumbSelected = async (file: File | null) => {
    if (!file) return;

    setBusy(true);
    setError(null);
    setOk(null);

    try {
      const { url } = await uploadImage(file);
      setThumbImage(url);
      setOk("Imagem enviada.");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const onCreate = async () => {
    if (!canCreate) return;

    setBusy(true);
    setError(null);
    setOk(null);

    try {
      const payload: StreamingVideoCreateRequest = {
        name: name.trim(),
        videoUrl: videoUrl.trim(),
        videoTrailerUrl: trailerUrl.trim() ? trailerUrl.trim() : null,
        synopsis: synopsis.trim() ? synopsis.trim() : null,
        thumbImage: thumbImage.trim(),
        ageRating,
        price: parsedPrice!,
        year: parsedYear!,
        categoryIds,
        collaboratorIds,
      };

      await createVideo(payload);

      setOk("Vídeo criado.");
      setName("");
      setVideoUrl("");
      setTrailerUrl("");
      setThumbImage("");
      setSynopsis("");
      setAgeRating("L");
      setCategoryIds([]);
      setCollaboratorIds([]);
      setPriceStr("");
      setYearStr("");

      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const loadPurchaseStats = async () => {
    setBusy(true);
    setError(null);
    setOk(null);

    try {
      const pairs = await Promise.all(
        videos.map(async (v) => {
          const purchases = await getPurchasesByVideo(v.streamingVideoId);
          return [v.streamingVideoId, purchases.length] as const;
        })
      );

      const next: Record<number, VideoRowStats> = {};
      for (const [id, count] of pairs) next[id] = { purchaseCount: count };
      setStatsById(next);

      setOk("Estatísticas carregadas.");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h2 className="dash__panelTitle" style={{ marginTop: 0 }}>
        Vídeos
      </h2>

      {error ? <div className="dashMsg dashMsg--error">{error}</div> : null}
      {ok ? <div className="dashMsg dashMsg--ok">{ok}</div> : null}

      <section className="dash__panel" style={{ marginTop: 12 }}>
        <h3 className="dash__panelTitle" style={{ marginTop: 0 }}>
          Criar vídeo
        </h3>

        <div className="dashForm">
          <div className="dashForm__grid2">
            <label className="dashField">
              <span className="dashField__label">Nome</span>
              <input className="dashField__input" value={name} onChange={(e) => setName(e.target.value)} maxLength={200} />
            </label>

            <label className="dashField">
              <span className="dashField__label">Classificação etária</span>
              <select
                className="dashField__select"
                value={ageRating}
                onChange={(e) => setAgeRating(normalizeAgeRating(e.target.value))}
              >
                {AGE_RATINGS.map((v) => (
                  <option key={v} value={v}>
                    {ageLabel(v)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="dashForm__grid2">
            <label className="dashField">
              <span className="dashField__label">Preço (EUR)</span>
              <input
                className="dashField__input"
                value={priceStr}
                onChange={(e) => setPriceStr(e.target.value)}
                inputMode="decimal"
                placeholder="ex.: 4.99"
              />
              {priceStr.trim() && (parsedPrice == null || parsedPrice < 0) ? (
                <div className="dashField__hint" style={{ color: "rgba(255,120,120,0.9)" }}>
                  Indica um preço válido.
                </div>
              ) : null}
            </label>

            <label className="dashField">
              <span className="dashField__label">Ano</span>
              <input
                className="dashField__input"
                value={yearStr}
                onChange={(e) => setYearStr(e.target.value)}
                inputMode="numeric"
                placeholder="ex.: 2024"
              />
              {yearStr.trim() && parsedYear == null ? (
                <div className="dashField__hint" style={{ color: "rgba(255,120,120,0.9)" }}>
                  Indica um ano válido.
                </div>
              ) : null}
            </label>
          </div>

          <label className="dashField">
            <span className="dashField__label">URL do vídeo</span>
            <input className="dashField__input" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} maxLength={500} />
          </label>

          <div className="dashForm__grid2">
            <label className="dashField">
              <span className="dashField__label">URL do trailer</span>
              <input
                className="dashField__input"
                value={trailerUrl}
                onChange={(e) => setTrailerUrl(e.target.value)}
                maxLength={500}
              />
            </label>

            <label className="dashField">
              <span className="dashField__label">Imagem de capa</span>
              <input
                className="dashField__input"
                value={thumbImage}
                readOnly
                placeholder="Clique para escolher uma imagem…"
                onClick={pickCreateThumb}
              />
              <input
                ref={thumbCreateInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => void onCreateThumbSelected(e.target.files?.[0] ?? null)}
              />
              {thumbImage ? (
                <img
                  src={thumbImage}
                  alt="Capa"
                  style={{ marginTop: 10, width: 180, height: 100, borderRadius: 14, objectFit: "cover" }}
                />
              ) : null}
            </label>
          </div>

          <label className="dashField">
            <span className="dashField__label">Sinopse (opcional)</span>
            <textarea className="dashField__textarea" value={synopsis} onChange={(e) => setSynopsis(e.target.value)} />
          </label>

          <div className="dashField">
            <span className="dashField__label">Categorias</span>
            <div className="dashChecks">
              {categories.map((c) => {
                const checked = categoryIds.includes(c.id);
                return (
                  <label key={c.id} className="dashCheck">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        setCategoryIds((prev) => (e.target.checked ? [...prev, c.id] : prev.filter((x) => x !== c.id)));
                      }}
                    />
                    <span>{c.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="dashField">
            <span className="dashField__label">Colaboradores</span>
            <div className="dashChecks">
              {collaborators.map((c) => {
                const checked = collaboratorIds.includes(c.collaboratorId);
                return (
                  <label key={c.collaboratorId} className="dashCheck">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        setCollaboratorIds((prev) =>
                          e.target.checked ? [...prev, c.collaboratorId] : prev.filter((x) => x !== c.collaboratorId)
                        );
                      }}
                    />
                    <span>
                      {c.name} <span style={{ opacity: 0.7 }}>· {c.role}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="dashActions">
            <button className="dashBtn" type="button" onClick={() => void onCreate()} disabled={!canCreate}>
              {busy ? "A criar..." : "Criar vídeo"}
            </button>
          </div>
        </div>
      </section>

      <div className="dashForm" style={{ marginTop: 14 }}>
        <div className="dashForm__grid2">
          <label className="dashField">
            <span className="dashField__label">Pesquisar</span>
            <input className="dashField__input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="nome…" />
          </label>

          <div className="dashActions" style={{ alignItems: "end", marginTop: 0 }}>
            <button className="dashBtn" type="button" onClick={() => void load()} disabled={busy}>
              Atualizar
            </button>
            <button className="dashBtn" type="button" onClick={() => void loadPurchaseStats()} disabled={busy}>
              Carregar stats (compras)
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
        {filtered.map((v) => (
          <VideoCard
            key={v.streamingVideoId}
            video={v}
            categories={categories}
            collaborators={collaborators}
            busy={busy}
            purchaseCount={statsById[v.streamingVideoId]?.purchaseCount}
            onSave={async (id, patch, catIds, collabIds) => {
              setBusy(true);
              setError(null);
              setOk(null);
              try {
                await updateVideo(id, patch);
                await setVideoRelations(id, { collaboratorIds: collabIds, categoryIds: catIds });
                setOk("Vídeo atualizado.");
                await load();
              } catch (e) {
                setError(getErrorMessage(e));
              } finally {
                setBusy(false);
              }
            }}
            onDelete={async (id) => {
              setBusy(true);
              setError(null);
              setOk(null);
              try {
                await deleteVideo(id);
                setOk("Vídeo removido.");
                await load();
              } catch (e) {
                setError(getErrorMessage(e));
              } finally {
                setBusy(false);
              }
            }}
          />
        ))}

        {!busy && filtered.length === 0 ? <div className="dashMsg">Sem vídeos.</div> : null}
      </div>
    </div>
  );
}

function VideoCard({
  video,
  categories,
  collaborators,
  busy,
  purchaseCount,
  onSave,
  onDelete,
}: {
  video: StreamingVideoResponse;
  categories: VideoCategoryResponse[];
  collaborators: CollaboratorResponse[];
  busy: boolean;
  purchaseCount?: number;
  onSave: (id: number, patch: StreamingVideoUpdateRequest, categoryIds: number[], collaboratorIds: number[]) => Promise<void> | void;
  onDelete: (id: number) => Promise<void> | void;
}) {
  const [name, setName] = useState(video.name);
  const [videoUrl, setVideoUrl] = useState(video.videoUrl);
  const [trailerUrl, setTrailerUrl] = useState(video.videoTrailerUrl ?? "");
  const [thumb, setThumb] = useState(video.thumbImage ?? "");
  const [synopsis, setSynopsis] = useState(video.synopsis ?? "");
  const [ageRating, setAgeRating] = useState<AgeRatingValue>(normalizeAgeRating(video.ageRating));
  const [catIds, setCatIds] = useState<number[]>(video.categoryIds ?? []);
  const [collabIds, setCollabIds] = useState<number[]>(video.collaboratorIds ?? []);

  const [priceStr, setPriceStr] = useState(String(video.price ?? 0));
  const [yearStr, setYearStr] = useState(String(video.year ?? new Date().getFullYear()));

  const thumbEditInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setName(video.name);
    setVideoUrl(video.videoUrl);
    setTrailerUrl(video.videoTrailerUrl ?? "");
    setThumb(video.thumbImage ?? "");
    setSynopsis(video.synopsis ?? "");
    setAgeRating(normalizeAgeRating(video.ageRating));
    setCatIds(video.categoryIds ?? []);
    setCollabIds(video.collaboratorIds ?? []);
    setPriceStr(String(video.price ?? 0));
    setYearStr(String(video.year ?? new Date().getFullYear()));
  }, [video]);

  const parsedPrice = useMemo(() => toNumberOrNull(priceStr.trim()), [priceStr]);

  const parsedYear = useMemo(() => {
    const n = toNumberOrNull(yearStr.trim());
    if (n == null) return null;
    return clampYear(Math.trunc(n));
  }, [yearStr]);

  const canSave =
    !busy &&
    name.trim().length > 0 &&
    name.trim().length <= 200 &&
    videoUrl.trim().length > 0 &&
    videoUrl.trim().length <= 500 &&
    trailerUrl.trim().length <= 500 &&
    thumb.trim().length > 0 &&
    thumb.trim().length <= 500 &&
    synopsis.trim().length <= 2000 &&
    parsedPrice != null &&
    parsedPrice >= 0 &&
    parsedYear != null;

  const patch: StreamingVideoUpdateRequest = {
    name: name.trim(),
    videoUrl: videoUrl.trim(),
    videoTrailerUrl: trailerUrl.trim() ? trailerUrl.trim() : null,
    thumbImage: thumb.trim(),
    synopsis: synopsis.trim() ? synopsis.trim() : null,
    ageRating,
    price: parsedPrice ?? undefined,
    year: parsedYear ?? undefined,
  };

  const categoryBadges = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c.name] as const));
    return catIds.map((id) => map.get(id) ?? `#${id}`);
  }, [catIds, categories]);

  const collaboratorBadges = useMemo(() => {
    const map = new Map(collaborators.map((c) => [c.collaboratorId, c] as const));
    return collabIds.map((id) => map.get(id)).filter(Boolean) as CollaboratorResponse[];
  }, [collabIds, collaborators]);

  const ageFromVideo = normalizeAgeRating(video.ageRating);

  const pickEditThumb = () => {
    thumbEditInputRef.current?.click();
  };

  const onEditThumbSelected = async (file: File | null) => {
    if (!file) return;
    try {
      const { url } = await uploadImage(file);
      setThumb(url);
    } catch {
      return;
    }
  };

  return (
    <article className="dash__panel">
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        {video.thumbImage ? (
          <img src={video.thumbImage} alt={video.name} style={{ width: 96, height: 96, borderRadius: 16, objectFit: "cover" }} />
        ) : (
          <div style={{ width: 96, height: 96, borderRadius: 16, background: "rgba(255,255,255,0.06)" }} />
        )}

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 18 }}>{video.name}</h3>

              <div style={{ opacity: 0.75, fontSize: 13, marginTop: 6 }}>
                likes: <strong>{video.likes}</strong> · classificação: <strong>{ageLabel(ageFromVideo)}</strong> · preço:{" "}
                <strong>{formatEUR(video.price ?? 0)}</strong> · ano: <strong>{video.year ?? "—"}</strong>
                {typeof purchaseCount === "number" ? (
                  <>
                    {" "}
                    · compras: <strong>{purchaseCount}</strong>
                  </>
                ) : null}
              </div>
            </div>

            <div className="dashActions" style={{ marginTop: 0 }}>
              <button className="dashBtn" type="button" onClick={() => onSave(video.streamingVideoId, patch, catIds, collabIds)} disabled={!canSave}>
                Guardar
              </button>
              <button className="dashBtn" type="button" onClick={() => onDelete(video.streamingVideoId)} disabled={busy}>
                Remover
              </button>
            </div>
          </div>

          {categoryBadges.length ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10, opacity: 0.9 }}>
              {categoryBadges.map((n) => (
                <span key={n} style={{ fontSize: 12, opacity: 0.85 }}>
                  {n}
                </span>
              ))}
            </div>
          ) : null}

          {collaboratorBadges.length ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8, opacity: 0.9 }}>
              {collaboratorBadges.map((c) => (
                <span key={c.collaboratorId} style={{ fontSize: 12, opacity: 0.85 }}>
                  {c.name} <span style={{ opacity: 0.7 }}>({c.role})</span>
                </span>
              ))}
            </div>
          ) : null}

          <div className="dashForm" style={{ marginTop: 12 }}>
            <div className="dashForm__grid2">
              <label className="dashField">
                <span className="dashField__label">Nome</span>
                <input className="dashField__input" value={name} onChange={(e) => setName(e.target.value)} maxLength={200} />
              </label>

              <label className="dashField">
                <span className="dashField__label">Classificação etária</span>
                <select className="dashField__select" value={ageRating} onChange={(e) => setAgeRating(normalizeAgeRating(e.target.value))}>
                  {AGE_RATINGS.map((v) => (
                    <option key={v} value={v}>
                      {ageLabel(v)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="dashForm__grid2">
              <label className="dashField">
                <span className="dashField__label">Preço (EUR)</span>
                <input className="dashField__input" value={priceStr} onChange={(e) => setPriceStr(e.target.value)} inputMode="decimal" placeholder="ex.: 4.99" />
              </label>

              <label className="dashField">
                <span className="dashField__label">Ano</span>
                <input className="dashField__input" value={yearStr} onChange={(e) => setYearStr(e.target.value)} inputMode="numeric" placeholder="ex.: 2024" />
              </label>
            </div>

            <label className="dashField">
              <span className="dashField__label">URL do vídeo</span>
              <input className="dashField__input" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} maxLength={500} />
            </label>

            <div className="dashForm__grid2">
              <label className="dashField">
                <span className="dashField__label">URL do trailer (opcional)</span>
                <input className="dashField__input" value={trailerUrl} onChange={(e) => setTrailerUrl(e.target.value)} maxLength={500} />
              </label>

              <label className="dashField">
                <span className="dashField__label">Imagem de capa (obrigatória)</span>
                <input className="dashField__input" value={thumb} readOnly placeholder="Clique para escolher uma imagem…" onClick={pickEditThumb} />
                <input
                  ref={thumbEditInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => void onEditThumbSelected(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            <label className="dashField">
              <span className="dashField__label">Sinopse (opcional)</span>
              <textarea className="dashField__textarea" value={synopsis} onChange={(e) => setSynopsis(e.target.value)} />
            </label>

            <div className="dashField">
              <span className="dashField__label">Categorias</span>
              <div className="dashChecks">
                {categories.map((c) => {
                  const checked = catIds.includes(c.id);
                  return (
                    <label key={c.id} className="dashCheck">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setCatIds((prev) => (e.target.checked ? [...prev, c.id] : prev.filter((x) => x !== c.id)));
                        }}
                      />
                      <span>{c.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="dashField">
              <span className="dashField__label">Colaboradores</span>
              <div className="dashChecks">
                {collaborators.map((c) => {
                  const checked = collabIds.includes(c.collaboratorId);
                  return (
                    <label key={c.collaboratorId} className="dashCheck">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setCollabIds((prev) => (e.target.checked ? [...prev, c.collaboratorId] : prev.filter((x) => x !== c.collaboratorId)));
                        }}
                      />
                      <span>
                        {c.name} <span style={{ opacity: 0.7 }}>· {c.role}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}