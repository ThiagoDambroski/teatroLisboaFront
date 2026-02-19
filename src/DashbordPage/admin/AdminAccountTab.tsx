import React, { useEffect, useMemo, useState } from "react";
import type { ApiError } from "../../api/http";
import { getMe, updateMe, type UserResponse } from "../../api/user";

function getErrorMessage(err: unknown): string {
  const maybe = err as Partial<ApiError> | null;
  if (maybe && typeof maybe === "object" && typeof maybe.message === "string") return maybe.message;
  if (err instanceof Error) return err.message;
  return "Não foi possível concluir. Tente novamente.";
}

function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function clampInt(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

export default function AdminAccountTab() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [me, setMe] = useState<UserResponse | null>(null);

  const [email, setEmail] = useState("");
  const [age, setAge] = useState<string>("");
  const [locationText, setLocationText] = useState("");
  const [newsletterEmailAccept, setNewsletterEmailAccept] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const hydrate = (u: UserResponse) => {
    setEmail(u.email ?? "");
    setAge(u.age == null ? "" : String(u.age));
    setLocationText(u.location ?? "");
    setNewsletterEmailAccept(Boolean(u.newsletterEmailAccept));
    setNewPassword("");
    setConfirm("");
  };

  const load = async () => {
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const u = await getMe();
      setMe(u);
      hydrate(u);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const canSave = useMemo(() => {
    if (busy) return false;
    if (!isEmail(email.trim())) return false;
    if (locationText.trim().length > 120) return false;

    const a = Number(age.trim());
    if (!Number.isFinite(a) || a < 0 || a > 150) return false;

    if (newPassword.trim()) {
      const p = newPassword.trim();
      const c = confirm.trim();
      if (p.length < 6 || p.length > 72) return false;
      if (c !== p) return false;
    }

    return true;
  }, [busy, email, age, locationText, newPassword, confirm]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;

    setBusy(true);
    setError(null);
    setOk(null);

    try {
      const payload = {
        email: email.trim(),
        age: clampInt(Number(age.trim()), 0, 150),
        newsletterEmailAccept,
        location: locationText.trim() ? locationText.trim() : null,
        rawPassword: newPassword.trim() ? newPassword.trim() : undefined,
      };

      const u = await updateMe(payload);
      setMe(u);
      hydrate(u);
      setOk("Dados atualizados.");
    } catch (e2) {
      setError(getErrorMessage(e2));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h2 className="dash__panelTitle" style={{ marginTop: 0 }}>
        Minha conta
      </h2>

      {me ? (
        <div style={{ opacity: 0.8, fontSize: 13, marginBottom: 10 }}>
          Role atual: <strong>{me.userRole}</strong>
        </div>
      ) : null}

      {error ? <div className="dashMsg dashMsg--error">{error}</div> : null}
      {ok ? <div className="dashMsg dashMsg--ok">{ok}</div> : null}

      <form onSubmit={onSave} className="dashForm" style={{ marginTop: 12 }}>
        <div className="dashForm__grid2">
          <label className="dashField">
            <span className="dashField__label">Email</span>
            <input className="dashField__input" value={email} onChange={(ev) => setEmail(ev.target.value)} type="email" />
          </label>

          <label className="dashField">
            <span className="dashField__label">Idade</span>
            <input
              className="dashField__input"
              value={age}
              onChange={(ev) => setAge(ev.target.value)}
              type="number"
              inputMode="numeric"
              min={0}
              max={150}
            />
          </label>
        </div>

        <div className="dashForm__grid2">
          <label className="dashField">
            <span className="dashField__label">Localização</span>
            <input className="dashField__input" value={locationText} onChange={(ev) => setLocationText(ev.target.value)} maxLength={120} />
          </label>

          <label className="dashField">
            <span className="dashField__label">Newsletter</span>
            <span className="dashCheck" style={{ marginTop: 2 }}>
              <input type="checkbox" checked={newsletterEmailAccept} onChange={(ev) => setNewsletterEmailAccept(ev.target.checked)} />
              <span>Ativo</span>
            </span>
          </label>
        </div>

        <div className="dashForm__grid2">
          <label className="dashField">
            <span className="dashField__label">Nova palavra-passe (opcional)</span>
            <input className="dashField__input" value={newPassword} onChange={(ev) => setNewPassword(ev.target.value)} type="password" autoComplete="new-password" />
          </label>

          <label className="dashField">
            <span className="dashField__label">Confirmar palavra-passe</span>
            <input className="dashField__input" value={confirm} onChange={(ev) => setConfirm(ev.target.value)} type="password" autoComplete="new-password" />
          </label>
        </div>

        <div className="dashActions">
          <button className="dashBtn" type="submit" disabled={!canSave}>
            {busy ? "A guardar..." : "Guardar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
