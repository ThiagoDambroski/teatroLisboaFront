import React, { useMemo, useState } from "react";
import type { ApiError } from "../../api/http";
import { apiRequest } from "../../api/http";

type UserRequest = {
  email: string;
  rawPassword: string;
  age: number;
  newsletterEmailAccept: boolean;
  location: string | null;
};

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
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

async function createAdmin(payload: UserRequest) {
  return apiRequest("/users/admin", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export default function AdminCreateAdminTab() {
  const [email, setEmail] = useState("");
  const [age, setAge] = useState<string>("");
  const [locationText, setLocationText] = useState("");
  const [newsletter, setNewsletter] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    const e = email.trim();
    if (!isEmail(e)) return false;

    const a = Number(age.trim());
    if (!Number.isFinite(a) || a < 0 || a > 150) return false;

    const p = password.trim();
    const c = confirm.trim();
    if (p.length < 6 || p.length > 72) return false;
    if (c !== p) return false;

    if (locationText.trim().length > 120) return false;

    return !busy;
  }, [email, age, password, confirm, locationText, busy]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setBusy(true);
    setError(null);
    setOk(null);

    try {
      const payload: UserRequest = {
        email: email.trim(),
        rawPassword: password.trim(),
        age: clampInt(Number(age.trim()), 0, 150),
        newsletterEmailAccept: newsletter,
        location: locationText.trim() ? locationText.trim() : null,
      };

      await createAdmin(payload);

      setOk("Admin criado com sucesso.");
      setEmail("");
      setAge("");
      setLocationText("");
      setNewsletter(false);
      setPassword("");
      setConfirm("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h2 className="dash__panelTitle" style={{ marginTop: 0 }}>
        Criar Admin
      </h2>

      {error ? <div className="dashMsg dashMsg--error">{error}</div> : null}
      {ok ? <div className="dashMsg dashMsg--ok">{ok}</div> : null}

      <form onSubmit={onSubmit} className="dashForm" style={{ marginTop: 12 }}>
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
            <span className="dashField__label">Localização (opcional)</span>
            <input className="dashField__input" value={locationText} onChange={(ev) => setLocationText(ev.target.value)} maxLength={120} />
          </label>

          <label className="dashField">
            <span className="dashField__label">Newsletter</span>
            <span className="dashCheck" style={{ marginTop: 2 }}>
              <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} />
              <span>Ativo</span>
            </span>
          </label>
        </div>

        <div className="dashForm__grid2">
          <label className="dashField">
            <span className="dashField__label">Palavra-passe</span>
            <input className="dashField__input" value={password} onChange={(ev) => setPassword(ev.target.value)} type="password" autoComplete="new-password" />
          </label>

          <label className="dashField">
            <span className="dashField__label">Confirmar palavra-passe</span>
            <input className="dashField__input" value={confirm} onChange={(ev) => setConfirm(ev.target.value)} type="password" autoComplete="new-password" />
          </label>
        </div>

        <div className="dashActions">
          <button className="dashBtn" type="submit" disabled={!canSubmit}>
            {busy ? "A criar..." : "Criar Admin"}
          </button>
        </div>
      </form>
    </div>
  );
}
