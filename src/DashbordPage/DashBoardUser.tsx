import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import type { ApiError } from "../api/http";
import {
  getMyActivePurchases,
  getMyPurchases,
  type PurchaseResponse,
} from "../api/purchases";
import { getMe, updateMe, type UserResponse } from "../api/user";
import "../scss/Dashboard.css";

type TabKey = "active" | "purchases" | "account";

function formatDateTimePt(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function hoursLeft(purchasedAt: string): number {
  const t = new Date(purchasedAt).getTime();
  if (Number.isNaN(t)) return 0;
  const end = t + 24 * 60 * 60 * 1000;
  const diffMs = end - Date.now();
  return Math.max(0, Math.ceil(diffMs / (60 * 60 * 1000)));
}

function clampInt(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

function getErrorMessage(err: unknown): string {
  const maybe = err as Partial<ApiError> | null;
  if (maybe && typeof maybe === "object" && typeof maybe.message === "string") {
    return maybe.message;
  }
  if (err instanceof Error) return err.message;
  return "Não foi possível concluir. Tente novamente.";
}

function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export default function DashBoardUser() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [tab, setTab] = useState<TabKey>("active");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [purchases, setPurchases] = useState<PurchaseResponse[]>([]);
  const [activePurchases, setActivePurchases] = useState<PurchaseResponse[]>(
    []
  );

  const [me, setMe] = useState<UserResponse | null>(null);

  const [email, setEmail] = useState("");
  const [age, setAge] = useState<string>("");
  const [locationText, setLocationText] = useState("");
  const [newsletterEmailAccept, setNewsletterEmailAccept] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const hydrateAccountForm = (u: UserResponse) => {
    setEmail(u.email ?? "");
    setAge(u.age === null || u.age === undefined ? "" : String(u.age));
    setLocationText(u.location ?? "");
    setNewsletterEmailAccept(Boolean(u.newsletterEmailAccept));
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const loadAll = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    setToast(null);

    try {
      const [all, active, user] = await Promise.all([
        getMyPurchases(),
        getMyActivePurchases(),
        getMe(),
      ]);

      setPurchases(all);
      setActivePurchases(active);
      setMe(user);
      hydrateAccountForm(user);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const onLogout = (): void => {
    logout();
    navigate("/login", { replace: true });
  };

  const canSaveAccount = useMemo(() => {
    const e = email.trim();
    if (!isEmail(e)) return false;

    const locOk = locationText.trim().length <= 120;
    if (!locOk) return false;

    const aTrim = age.trim();
    if (aTrim.length === 0) return false;

    const a = Number(aTrim);
    if (!Number.isFinite(a)) return false;
    if (a < 0 || a > 150) return false;

    if (newPassword.trim().length > 0) {
      const p = newPassword.trim();
      const cp = confirmNewPassword.trim();
      if (p.length < 6 || p.length > 72) return false;
      if (cp !== p) return false;
    }

    return !busy;
  }, [email, age, locationText, newPassword, confirmNewPassword, busy]);

  const onSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSaveAccount) return;

    setBusy(true);
    setError(null);
    setToast(null);

    try {
      const a = clampInt(Number(age.trim()), 0, 150);

      const payload = {
        email: email.trim(),
        age: a,
        newsletterEmailAccept,
        location: locationText.trim() ? locationText.trim() : null,
        rawPassword: newPassword.trim() ? newPassword.trim() : undefined,
      };

      const updated = await updateMe(payload);
      setMe(updated);
      hydrateAccountForm(updated);
      setToast("Dados atualizados com sucesso.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const list = useMemo(() => {
    if (tab === "active") return activePurchases;
    if (tab === "purchases") return purchases;
    return [];
  }, [tab, activePurchases, purchases]);

  return (
    <main className="dashboard">
      <div className="dashboard__container">
        <header className="dashboard__header">
          <div>
            <h1 className="dashboard__title">Dashboard</h1>
            {me ? <div className="dashboard__subtitle">{me.email}</div> : null}
          </div>

          <div className="dashboard__headerActions">
            <button
              type="button"
              className="dashboard__btn"
              onClick={() => void loadAll()}
              disabled={busy}
            >
              {busy ? "A carregar..." : "Atualizar"}
            </button>

            <button
              type="button"
              className="dashboard__btn dashboard__btn--danger"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        </header>

        <nav className="dashboard__tabs">
          <button
            type="button"
            className="dashboard__tab"
            onClick={() => setTab("active")}
            aria-pressed={tab === "active"}
          >
            Peças ativadas ({activePurchases.length})
          </button>

          <button
            type="button"
            className="dashboard__tab"
            onClick={() => setTab("purchases")}
            aria-pressed={tab === "purchases"}
          >
            Compras ({purchases.length})
          </button>

          <button
            type="button"
            className="dashboard__tab"
            onClick={() => setTab("account")}
            aria-pressed={tab === "account"}
          >
            Minha conta
          </button>
        </nav>

        {error ? (
          <div className="dashboard__notice dashboard__notice--error">
            {error}
          </div>
        ) : null}

        {toast ? (
          <div className="dashboard__notice dashboard__notice--ok">{toast}</div>
        ) : null}

        {tab === "account" ? (
          <section style={{ marginTop: 18 }}>
            <h2 className="dashboard__panelTitle">Minha conta</h2>

            <form className="dashboardForm" onSubmit={onSaveAccount}>
              <div className="dashboardField">
                <div className="dashboardField__label">Email</div>
                <input
                  className="dashboardField__input"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  type="email"
                  autoComplete="email"
                />
              </div>

              <div className="dashboardField">
                <div className="dashboardField__label">Idade</div>
                <input
                  className="dashboardField__input"
                  value={age}
                  onChange={(ev) => setAge(ev.target.value)}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={150}
                />
              </div>

              <div className="dashboardField">
                <div className="dashboardField__label">Localização</div>
                <input
                  className="dashboardField__input"
                  value={locationText}
                  onChange={(ev) => setLocationText(ev.target.value)}
                  type="text"
                  maxLength={120}
                  autoComplete="address-level2"
                />
              </div>

              <label className="dashboardCheck">
                <input
                  type="checkbox"
                  checked={newsletterEmailAccept}
                  onChange={(ev) =>
                    setNewsletterEmailAccept(ev.target.checked)
                  }
                />
                <span>Quero receber newsletter por email</span>
              </label>

              <div className="dashboardField">
                <div className="dashboardField__label">
                  Nova palavra-passe (opcional)
                </div>
                <input
                  className="dashboardField__input"
                  value={newPassword}
                  onChange={(ev) => setNewPassword(ev.target.value)}
                  type="password"
                  autoComplete="new-password"
                />
                <div className="dashboardField__hint">
                  Se preencher, precisa confirmar abaixo.
                </div>
              </div>

              <div className="dashboardField">
                <div className="dashboardField__label">
                  Confirmar nova palavra-passe
                </div>
                <input
                  className="dashboardField__input"
                  value={confirmNewPassword}
                  onChange={(ev) => setConfirmNewPassword(ev.target.value)}
                  type="password"
                  autoComplete="new-password"
                />
                {confirmNewPassword.length > 0 &&
                confirmNewPassword !== newPassword ? (
                  <div className="dashboardField__hint">
                    As palavras-passe não coincidem.
                  </div>
                ) : null}
              </div>

              <button
                type="submit"
                className="dashboard__primary"
                disabled={!canSaveAccount}
              >
                {busy ? "A guardar..." : "Guardar alterações"}
              </button>
            </form>
          </section>
        ) : (
          <section className="dashboard__grid">
            {list.length === 0 && !busy ? (
              <div className="dashboard__notice">Nenhum resultado.</div>
            ) : null}

            {list.map((p) => (
              <article key={p.purchaseId} className="dashboardCard">
                <div className="dashboardCard__thumb">
                  {p.streamingVideo.thumbImage ? (
                    <img
                      src={p.streamingVideo.thumbImage ?? ""}
                      alt={p.streamingVideo.name}
                    />
                  ) : null}
                </div>

                <div>
                  <div className="dashboardCard__title">
                    {p.streamingVideo.name}
                  </div>

                  <div className="dashboardCard__meta">
                    Comprado em: {formatDateTimePt(p.purchasedAt)}
                  </div>

                  {tab === "active" ? (
                    <div className="dashboardCard__metaStrong">
                      Tempo restante: {hoursLeft(p.purchasedAt)}h
                    </div>
                  ) : null}
                </div>

                <div className="dashboardCard__cta">
                  <button
                    type="button"
                    className="dashboard__btn"
                    onClick={() =>
                      navigate(`/movies/${p.streamingVideo.streamingVideoId}`)
                    }
                  >
                    Ver
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
