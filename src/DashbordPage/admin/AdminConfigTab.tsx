import React, { useEffect, useMemo, useState } from "react";
import type { ApiError } from "../../api/http";
import { getAdminConfig, updateAdminConfig, type AdminConfigResponse } from "../../api/adminConfig";
import { getAllVideos, type StreamingVideoResponse } from "../../api/streamingVideos";

function getErrorMessage(err: unknown): string {
  const maybe = err as Partial<ApiError> | null;
  if (maybe && typeof maybe === "object" && typeof maybe.message === "string") return maybe.message;
  if (err instanceof Error) return err.message;
  return "Não foi possível concluir. Tente novamente.";
}

function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const next = [...arr];
  const [it] = next.splice(from, 1);
  next.splice(to, 0, it);
  return next;
}

export default function AdminConfigTab() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [videos, setVideos] = useState<StreamingVideoResponse[]>([]);
  const [cfg, setCfg] = useState<AdminConfigResponse | null>(null);

  // local editable state
  const [destaqueIds, setDestaqueIds] = useState<number[]>([]);
  const [trailerIds, setTrailerIds] = useState<number[]>([]);

  // dropdown selections
  const [pickDestaque, setPickDestaque] = useState("");
  const [pickTrailer, setPickTrailer] = useState("");

  const videoMap = useMemo(() => new Map(videos.map((v) => [v.streamingVideoId, v] as const)), [videos]);

  const load = async () => {
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const [all, c] = await Promise.all([getAllVideos(), getAdminConfig()]);
      setVideos(all);
      setCfg(c);

      setDestaqueIds(c.destaqueVideoIds ?? []);
      setTrailerIds(c.destaqueTrailerVideoIds ?? []);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const availableDestaque = useMemo(() => {
    const used = new Set(destaqueIds);
    return videos.filter((v) => !used.has(v.streamingVideoId));
  }, [videos, destaqueIds]);

  const availableTrailers = useMemo(() => {
    const used = new Set(trailerIds);
    return videos.filter((v) => !used.has(v.streamingVideoId));
  }, [videos, trailerIds]);

  const addTo = (target: "destaque" | "trailer") => {
    if (busy) return;

    const idStr = target === "destaque" ? pickDestaque : pickTrailer;
    const id = Number(idStr);
    if (!Number.isFinite(id) || id <= 0) return;

    if (target === "destaque") {
      if (destaqueIds.includes(id)) return;
      setDestaqueIds((prev) => [...prev, id]);
      setPickDestaque("");
    } else {
      if (trailerIds.includes(id)) return;
      setTrailerIds((prev) => [...prev, id]);
      setPickTrailer("");
    }
  };

  const removeFrom = (target: "destaque" | "trailer", id: number) => {
    if (busy) return;
    if (target === "destaque") setDestaqueIds((prev) => prev.filter((x) => x !== id));
    else setTrailerIds((prev) => prev.filter((x) => x !== id));
  };

  const move = (target: "destaque" | "trailer", index: number, dir: -1 | 1) => {
    if (busy) return;
    if (target === "destaque") {
      const to = index + dir;
      if (to < 0 || to >= destaqueIds.length) return;
      setDestaqueIds((prev) => moveItem(prev, index, to));
    } else {
      const to = index + dir;
      if (to < 0 || to >= trailerIds.length) return;
      setTrailerIds((prev) => moveItem(prev, index, to));
    }
  };

  const onSave = async () => {
    if (busy) return;

    setBusy(true);
    setError(null);
    setOk(null);

    try {
      const updated = await updateAdminConfig({
        destaqueVideoIds: destaqueIds,
        destaqueTrailerVideoIds: trailerIds,
      });
      setCfg(updated);
      setOk("Configuração guardada.");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const hasChanges =
    cfg != null &&
    (JSON.stringify(cfg.destaqueVideoIds ?? []) !== JSON.stringify(destaqueIds) ||
      JSON.stringify(cfg.destaqueTrailerVideoIds ?? []) !== JSON.stringify(trailerIds));

  return (
    <div>
      <h2 className="dash__panelTitle" style={{ marginTop: 0 }}>
        Admin Config
      </h2>

      {error ? <div className="dashMsg dashMsg--error">{error}</div> : null}
      {ok ? <div className="dashMsg dashMsg--ok">{ok}</div> : null}

      <section className="dash__panel" style={{ marginTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
          <h3 className="dash__panelTitle" style={{ marginTop: 0 }}>
            Destaques (vídeos)
          </h3>
          <div className="dashActions" style={{ marginTop: 0 }}>
            <button className="dashBtn" type="button" onClick={() => void load()} disabled={busy}>
              Atualizar
            </button>
            <button className="dashBtn" type="button" onClick={() => void onSave()} disabled={busy || !hasChanges}>
              Guardar
            </button>
          </div>
        </div>

        <div className="dashForm" style={{ marginTop: 10 }}>
          <div className="dashForm__grid2">
            <label className="dashField">
              <span className="dashField__label">Adicionar vídeo aos destaques</span>
              <select className="dashField__select" value={pickDestaque} onChange={(e) => setPickDestaque(e.target.value)}>
                <option value="">Selecionar…</option>
                {availableDestaque.map((v) => (
                  <option key={v.streamingVideoId} value={String(v.streamingVideoId)}>
                    {v.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="dashActions" style={{ alignItems: "end", marginTop: 0 }}>
              <button className="dashBtn" type="button" onClick={() => addTo("destaque")} disabled={busy || !pickDestaque}>
                Adicionar
              </button>
            </div>
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            {destaqueIds.map((id, idx) => {
              const v = videoMap.get(id);
              return (
                <div
                  key={id}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800 }}>{v?.name ?? `#${id}`}</div>
                    <div style={{ opacity: 0.7, fontSize: 12 }}>Posição: {idx + 1}</div>
                  </div>

                  <div className="dashActions" style={{ marginTop: 0, justifyContent: "flex-end" }}>
                    <button className="dashBtn" type="button" onClick={() => move("destaque", idx, -1)} disabled={busy || idx === 0}>
                      ↑
                    </button>
                    <button
                      className="dashBtn"
                      type="button"
                      onClick={() => move("destaque", idx, 1)}
                      disabled={busy || idx === destaqueIds.length - 1}
                    >
                      ↓
                    </button>
                    <button className="dashBtn" type="button" onClick={() => removeFrom("destaque", id)} disabled={busy}>
                      Remover
                    </button>
                  </div>
                </div>
              );
            })}

            {!busy && destaqueIds.length === 0 ? <div className="dashMsg">Sem destaques.</div> : null}
          </div>
        </div>
      </section>

      <section className="dash__panel" style={{ marginTop: 12 }}>
        <h3 className="dash__panelTitle" style={{ marginTop: 0 }}>
          Destaques (trailers)
        </h3>

        <div className="dashForm" style={{ marginTop: 10 }}>
          <div className="dashForm__grid2">
            <label className="dashField">
              <span className="dashField__label">Adicionar vídeo aos destaques de trailer</span>
              <select className="dashField__select" value={pickTrailer} onChange={(e) => setPickTrailer(e.target.value)}>
                <option value="">Selecionar…</option>
                {availableTrailers.map((v) => (
                  <option key={v.streamingVideoId} value={String(v.streamingVideoId)}>
                    {v.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="dashActions" style={{ alignItems: "end", marginTop: 0 }}>
              <button className="dashBtn" type="button" onClick={() => addTo("trailer")} disabled={busy || !pickTrailer}>
                Adicionar
              </button>
            </div>
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            {trailerIds.map((id, idx) => {
              const v = videoMap.get(id);
              return (
                <div
                  key={id}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800 }}>{v?.name ?? `#${id}`}</div>
                    <div style={{ opacity: 0.7, fontSize: 12 }}>Posição: {idx + 1}</div>
                  </div>

                  <div className="dashActions" style={{ marginTop: 0, justifyContent: "flex-end" }}>
                    <button className="dashBtn" type="button" onClick={() => move("trailer", idx, -1)} disabled={busy || idx === 0}>
                      ↑
                    </button>
                    <button
                      className="dashBtn"
                      type="button"
                      onClick={() => move("trailer", idx, 1)}
                      disabled={busy || idx === trailerIds.length - 1}
                    >
                      ↓
                    </button>
                    <button className="dashBtn" type="button" onClick={() => removeFrom("trailer", id)} disabled={busy}>
                      Remover
                    </button>
                  </div>
                </div>
              );
            })}

            {!busy && trailerIds.length === 0 ? <div className="dashMsg">Sem destaques de trailer.</div> : null}
          </div>
        </div>
      </section>
    </div>
  );
}