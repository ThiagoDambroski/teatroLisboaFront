import React, { useEffect, useMemo, useState } from "react";
import type { ApiError } from "../../api/http";
import { deletePurchase, getAllPurchases, type PurchaseResponse } from "../../api/purchasesAdmin";

function getErrorMessage(err: unknown): string {
  const maybe = err as Partial<ApiError> | null;
  if (maybe && typeof maybe === "object" && typeof maybe.message === "string") return maybe.message;
  if (err instanceof Error) return err.message;
  return "Não foi possível concluir. Tente novamente.";
}

type OrderBy = "recent" | "oldest" | "email" | "video";

function toDateValue(x?: string) {
  const t = x ? Date.parse(x) : NaN;
  return Number.isFinite(t) ? t : null;
}

// helpers com fallback
function getEmail(p: PurchaseResponse): string {
  // se o backend já manda email
  const anyP = p as any;
  const email = typeof anyP.userEmail === "string" ? anyP.userEmail.trim() : "";
  return email || `#${p.userId}`;
}

function getVideoName(p: PurchaseResponse): string {
  // se o backend já manda nome
  const anyP = p as any;
  const name = typeof anyP.videoName === "string" ? anyP.videoName.trim() : "";
  return name || `#${p.streamingVideoId}`;
}

export default function AdminPurchasesTab() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [purchases, setPurchases] = useState<PurchaseResponse[]>([]);

  // filtros
  const [q, setQ] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [videoNameFilter, setVideoNameFilter] = useState("");
  const [orderBy, setOrderBy] = useState<OrderBy>("recent");

  const load = async () => {
    setBusy(true);
    setError(null);
    setOk(null);

    try {
      const data = await getAllPurchases();
      setPurchases(data);
      setOk("Compras carregadas.");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const normalizedQ = q.trim().toLowerCase();
  const emailQ = emailFilter.trim().toLowerCase();
  const videoQ = videoNameFilter.trim().toLowerCase();

  const filtered = useMemo(() => {
    let list = purchases;

    // filtro por email (contém)
    if (emailQ) {
      list = list.filter((p) => getEmail(p).toLowerCase().includes(emailQ));
    }

    // filtro por nome do vídeo (contém)
    if (videoQ) {
      list = list.filter((p) => getVideoName(p).toLowerCase().includes(videoQ));
    }

    // pesquisa geral
    if (normalizedQ) {
      list = list.filter((p) => {
        const hay = [
          p.purchaseId,
          getEmail(p),
          getVideoName(p),
          p.createdAt ?? "",
          p.expiresAt ?? "",
          p.pricePaid ?? "",
          p.currency ?? "",
        ]
          .join(" ")
          .toLowerCase();

        return hay.includes(normalizedQ);
      });
    }

    const sorted = [...list].sort((a, b) => {
      if (orderBy === "email") return getEmail(a).localeCompare(getEmail(b), "pt", { sensitivity: "base" });
      if (orderBy === "video") return getVideoName(a).localeCompare(getVideoName(b), "pt", { sensitivity: "base" });

      const ta = toDateValue(a.createdAt);
      const tb = toDateValue(b.createdAt);

      if (ta != null && tb != null) return orderBy === "recent" ? tb - ta : ta - tb;

      // fallback: purchaseId
      return orderBy === "recent"
        ? (b.purchaseId ?? 0) - (a.purchaseId ?? 0)
        : (a.purchaseId ?? 0) - (b.purchaseId ?? 0);
    });

    return sorted;
  }, [purchases, normalizedQ, emailQ, videoQ, orderBy]);

  const canRefresh = !busy;

  const clearFilters = () => {
    setQ("");
    setEmailFilter("");
    setVideoNameFilter("");
    setOrderBy("recent");
  };

  const onDelete = async (id: number) => {
    if (busy) return;
    const okDel = window.confirm(`Remover compra #${id}?`);
    if (!okDel) return;

    setBusy(true);
    setError(null);
    setOk(null);

    try {
      await deletePurchase(id);
      setOk("Compra removida.");
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h2 className="dash__panelTitle" style={{ marginTop: 0 }}>
        Compras
      </h2>

      {error ? <div className="dashMsg dashMsg--error">{error}</div> : null}
      {ok ? <div className="dashMsg dashMsg--ok">{ok}</div> : null}

      <section className="dash__panel" style={{ marginTop: 12 }}>
        <h3 className="dash__panelTitle" style={{ marginTop: 0 }}>
          Filtros
        </h3>

        <div className="dashForm">
          <div className="dashForm__grid2">
            <label className="dashField">
              <span className="dashField__label">Pesquisar</span>
              <input
                className="dashField__input"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="compra, email, vídeo, datas…"
              />
            </label>

            <label className="dashField">
              <span className="dashField__label">Ordenar</span>
              <select className="dashField__select" value={orderBy} onChange={(e) => setOrderBy(e.target.value as OrderBy)}>
                <option value="recent">Mais recentes</option>
                <option value="oldest">Mais antigas</option>
                <option value="email">Email</option>
                <option value="video">Nome do vídeo</option>
              </select>
            </label>
          </div>

          <div className="dashForm__grid2">
            <label className="dashField">
              <span className="dashField__label">Filtrar por email (contém)</span>
              <input
                className="dashField__input"
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                placeholder="ex.: gmail.com"
              />
            </label>

            <label className="dashField">
              <span className="dashField__label">Filtrar por nome do vídeo (contém)</span>
              <input
                className="dashField__input"
                value={videoNameFilter}
                onChange={(e) => setVideoNameFilter(e.target.value)}
                placeholder="ex.: Hamlet"
              />
            </label>
          </div>

          <div className="dashActions">
            <button className="dashBtn" type="button" onClick={() => void load()} disabled={!canRefresh}>
              {busy ? "A carregar..." : "Atualizar"}
            </button>

            <button
              className="dashBtn"
              type="button"
              onClick={() => {
                clearFilters();
              }}
              disabled={busy}
            >
              Limpar
            </button>
          </div>
        </div>
      </section>

      <section className="dash__panel" style={{ marginTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
          <h3 className="dash__panelTitle" style={{ marginTop: 0 }}>
            Lista de compras
          </h3>
          <div style={{ opacity: 0.75, fontSize: 13 }}>
            Total: <strong>{filtered.length}</strong>
          </div>
        </div>

        <div style={{ marginTop: 10, overflowX: "auto" }}>
          <table className="dashTable" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left" }}>
                <th style={{ padding: "10px 10px", opacity: 0.8 }}>Compra</th>
                <th style={{ padding: "10px 10px", opacity: 0.8 }}>Email</th>
                <th style={{ padding: "10px 10px", opacity: 0.8 }}>Vídeo</th>
                <th style={{ padding: "10px 10px", opacity: 0.8 }}>Criada em</th>
                <th style={{ padding: "10px 10px", opacity: 0.8 }}>Expira</th>
                <th style={{ padding: "10px 10px", opacity: 0.8 }}>Valor</th>
                <th style={{ padding: "10px 10px", opacity: 0.8 }} />
              </tr>
            </thead>

            <tbody>
              {filtered.map((p) => (
                <tr key={p.purchaseId} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <td style={{ padding: "12px 10px" }}>
                    <div style={{ fontWeight: 800 }}>#{p.purchaseId}</div>
                  </td>

                  <td style={{ padding: "12px 10px" }}>{getEmail(p)}</td>
                  <td style={{ padding: "12px 10px" }}>{getVideoName(p)}</td>

                  <td style={{ padding: "12px 10px" }}>
                    {p.createdAt ? new Date(p.createdAt).toLocaleString("pt-PT") : "—"}
                  </td>
                  <td style={{ padding: "12px 10px" }}>
                    {p.expiresAt ? new Date(p.expiresAt).toLocaleString("pt-PT") : "—"}
                  </td>

                  <td style={{ padding: "12px 10px" }}>
                    {typeof p.pricePaid === "number" ? (
                      <>
                        {p.pricePaid} {p.currency ?? "EUR"}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td style={{ padding: "12px 10px" }}>
                    <div className="dashActions" style={{ marginTop: 0, justifyContent: "flex-end" }}>
                      <button className="dashBtn" type="button" onClick={() => void onDelete(p.purchaseId)} disabled={busy}>
                        Remover
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!busy && filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "14px 10px", opacity: 0.75 }}>
                    Sem compras.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
