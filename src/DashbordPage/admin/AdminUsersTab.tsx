import React, { useEffect, useMemo, useRef, useState } from "react";
import type { ApiError } from "../../api/http";
import { adminListUsers, type AdminUserListItemResponse, type AdminUserSort } from "../../api/adminUsers";

function getErrorMessage(err: unknown): string {
  const maybe = err as Partial<ApiError> | null;
  if (maybe && typeof maybe === "object" && typeof maybe.message === "string") return maybe.message;
  if (err instanceof Error) return err.message;
  return "Não foi possível concluir. Tente novamente.";
}

function formatDt(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("pt-PT", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

export default function AdminUsersTab() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [role, setRole] = useState<"" | "ROLE_USER" | "ROLE_ADMIN">("");
  const [sort, setSort] = useState<AdminUserSort>("RECENT");

  const [rows, setRows] = useState<AdminUserListItemResponse[]>([]);

  // debounce para não chamar API a cada tecla
  const qDebounced = useDebouncedValue(q, 350);

  // evita race condition (respostas antigas sobrescrevendo novas)
  const lastReqId = useRef(0);

  const load = async (params: { q: string; role: "" | "ROLE_USER" | "ROLE_ADMIN"; sort: AdminUserSort }) => {
    const reqId = ++lastReqId.current;

    setBusy(true);
    setError(null);

    try {
      const data = await adminListUsers({
        q: params.q.trim() ? params.q.trim() : undefined,
        role: params.role ? params.role : undefined,
        sort: params.sort,
      });

      // se veio uma resposta antiga, ignora
      if (reqId !== lastReqId.current) return;

      setRows(data);
    } catch (e) {
      if (reqId !== lastReqId.current) return;
      setError(getErrorMessage(e));
    } finally {
      if (reqId === lastReqId.current) setBusy(false);
    }
  };

  // 🔥 auto-load sempre que filtros mudarem
  useEffect(() => {
    void load({ q: qDebounced, role, sort });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qDebounced, role, sort]);

  const header = useMemo(() => {
    return (
      <div className="dashForm" style={{ gap: 12 }}>
        <div className="dashForm__grid2">
          <label className="dashField">
            <span className="dashField__label">Pesquisar</span>
            <input
              className="dashField__input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="email…"
            />
          </label>

          <label className="dashField">
            <span className="dashField__label">Role</span>
            <select className="dashField__select" value={role} onChange={(e) => setRole(e.target.value as any)}>
              <option value="">Todos</option>
              <option value="ROLE_USER">User</option>
              <option value="ROLE_ADMIN">Admin</option>
            </select>
          </label>
        </div>

        <div className="dashForm__grid2">
          <label className="dashField">
            <span className="dashField__label">Ordenar</span>
            <select className="dashField__select" value={sort} onChange={(e) => setSort(e.target.value as AdminUserSort)}>
              <option value="RECENT">Recentemente adicionados (default)</option>
              <option value="MOST_PURCHASES">Quem comprou mais</option>
              <option value="LAST_PURCHASE">Compra mais recente</option>
            </select>
          </label>

          <div className="dashActions" style={{ alignItems: "end", marginTop: 0 }}>
            {/* botão continua útil como “force refresh”, mas não é obrigatório */}
            <button
              className="dashBtn"
              type="button"
              onClick={() => void load({ q: qDebounced, role, sort })}
              disabled={busy}
            >
              {busy ? "A carregar..." : "Atualizar"}
            </button>
          </div>
        </div>
      </div>
    );
  }, [q, qDebounced, role, sort, busy]);

  return (
    <div>
      <h2 className="dash__panelTitle" style={{ marginTop: 0 }}>
        Utilizadores
      </h2>

      {header}

      {error ? <div className="dashMsg dashMsg--error">{error}</div> : null}

      <div style={{ marginTop: 12, opacity: 0.8, fontSize: 13 }}>
        Total: <strong>{rows.length}</strong>
        {busy ? <span style={{ marginLeft: 10, opacity: 0.7 }}>· a atualizar…</span> : null}
      </div>

      <div style={{ overflowX: "auto", marginTop: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }} aria-label="Users table">
          <thead>
            <tr style={{ textAlign: "left", opacity: 0.85 }}>
              <th style={{ padding: "10px 8px" }}>Email</th>
              <th style={{ padding: "10px 8px" }}>Role</th>
              <th style={{ padding: "10px 8px" }}>Idade</th>
              <th style={{ padding: "10px 8px" }}>Localização</th>
              <th style={{ padding: "10px 8px" }}>Compras</th>
              <th style={{ padding: "10px 8px" }}>Última compra</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.userId} style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }}>
                <td style={{ padding: "12px 8px", maxWidth: 320, wordBreak: "break-word" }}>
                  <div style={{ fontWeight: 650 }}>{u.email}</div>
                  <div style={{ opacity: 0.7, fontSize: 12 }}>ID: {u.userId}</div>
                </td>

                <td style={{ padding: "12px 8px" }}>
                  <span style={{ opacity: 0.9 }}>{u.userRole === "ROLE_ADMIN" ? "ADMIN" : "USER"}</span>
                </td>

                <td style={{ padding: "12px 8px" }}>{u.age ?? "—"}</td>
                <td style={{ padding: "12px 8px" }}>{u.location ?? "—"}</td>
                <td style={{ padding: "12px 8px" }}>{u.purchaseCount}</td>
                <td style={{ padding: "12px 8px" }}>{formatDt(u.lastPurchaseAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!busy && rows.length === 0 ? (
        <div className="dashMsg" style={{ marginTop: 12 }}>
          Sem resultados.
        </div>
      ) : null}
    </div>
  );
}