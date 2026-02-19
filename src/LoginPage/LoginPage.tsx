import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../Context/AppProvider";
import { createUser } from "../api/user";
import type { ApiError } from "../api/http";
import { login } from "../api/auth";
import { useAuth } from "../auth/AuthProvider";
import { Navigate } from "react-router-dom";


import "../scss/LoginPage.css";





type PageKey = "login" | "create" | "forgot";

function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function clampInt(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

type LocationState = {
  from?: string;
};

function getErrorMessage(err: unknown): string {
  const maybe = err as Partial<ApiError> | null;
  if (maybe && typeof maybe === "object" && typeof maybe.message === "string") {
    return maybe.message;
  }
  return "Não foi possível concluir. Tente novamente.";
}

function LoginPage() {
  const { isAuthenticated, isAdmin } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;
  }
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as LocationState | null)?.from ?? "/movies";

  const [page, setPage] = useState<PageKey>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");
  const [age, setAge] = useState<string>("");
  const [newsletterEmailAccept, setNewsletterEmailAccept] = useState(false);
  const [locationText, setLocationText] = useState("");

  const [forgotEmail, setForgotEmail] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canLogin = useMemo(() => {
    return isEmail(email) && password.trim().length >= 6 && !busy;
  }, [email, password, busy]);

  const parsedAge = useMemo(() => {
    const trimmed = age.trim();
    if (!trimmed) return null;

    const n = Number(trimmed);
    if (!Number.isFinite(n)) return null;

    const asInt = Math.trunc(n);
    if (asInt < 0) return null;

    return asInt;
  }, [age]);

  const canCreate = useMemo(() => {
    const e = email.trim();
    const p = password.trim();
    const cp = confirmPassword.trim();
    const locOk = locationText.trim().length <= 120;

    const okEmail = isEmail(e);
    const okPass = p.length >= 6 && p.length <= 72;
    const okMatch = cp.length >= 6 && cp === p;
    const ageOk = parsedAge !== null;

    return okEmail && okPass && okMatch && ageOk && locOk && !busy;
  }, [email, password, confirmPassword, parsedAge, locationText, busy]);

  const canForgot = useMemo(() => {
    return isEmail(forgotEmail) && !busy;
  }, [forgotEmail, busy]);

  const resetMessages = (): void => setMessage(null);

  const switchTo = (p: PageKey): void => {
    resetMessages();
    setPage(p);

    setPassword("");
    setConfirmPassword("");
    setShowPass(false);
    setShowPass2(false);
  };
const { setAccessToken } = useAuth();

 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!canLogin) return;

  setBusy(true);
  setMessage(null);

  try {
    const res = await login({ email: email.trim(), password: password.trim() });
    setAccessToken(res.accessToken);

    const payload = res.accessToken.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/").padEnd(payload.length + (4 - (payload.length % 4)) % 4, "=")));
    const rolesStr = typeof decoded?.roles === "string" ? decoded.roles : "";
    const roles = rolesStr.trim() ? rolesStr.trim().split(/\s+/) : [];

    if (roles.includes("ROLE_ADMIN")) {
      navigate("/admin", { replace: true });
      return;
    }

    navigate("/dashboard", { replace: true });
  } catch (err) {
    setMessage(getErrorMessage(err));
  } finally {
    setBusy(false);
  }
};
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) return;

    const payload = {
      email: email.trim(),
      rawPassword: password.trim(),
      age: clampInt(parsedAge ?? 0, 0, 150),
      newsletterEmailAccept,
      location: locationText.trim() ? locationText.trim() : null,
    };

    setBusy(true);
    setMessage(null);

    try {
      await createUser(payload);
      setMessage("Conta criada com sucesso. Pode entrar agora.");
      setPage("login");
      setConfirmPassword("");
      setPassword("");
    } catch (err) {
      setMessage(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canForgot) return;

    setBusy(true);
    setMessage(null);

    try {
      setMessage("Se existir uma conta com este email, enviámos um link de recuperação.");
    } catch {
      setMessage("Não foi possível enviar a recuperação. Tente novamente.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth" aria-label="Autenticação">
      <div className="auth__bg" aria-hidden="true" />

      <div className="auth__shell">
        <button
          type="button"
          className="auth__back"
          onClick={() => navigate(-1)}
          aria-label="Voltar"
        >
          ← Voltar
        </button>

        <section className="authCard" aria-label="Conta">
          <header className="authCard__head">
            <span className="authCard__badge">Teatro Lisboa</span>

            {page === "login" && (
              <>
                <h1 className="authCard__title">Entrar</h1>
                <p className="authCard__sub">Aceda à sua conta para ver e comprar peças.</p>
              </>
            )}

            {page === "create" && (
              <>
                <h1 className="authCard__title">Criar conta</h1>
                <p className="authCard__sub">Registe-se para ter acesso ao catálogo completo.</p>
              </>
            )}

            {page === "forgot" && (
              <>
                <h1 className="authCard__title">Recuperar palavra-passe</h1>
                <p className="authCard__sub">Enviamos um link para redefinir a sua palavra-passe.</p>
              </>
            )}
          </header>

          {message ? <div className="authCard__msg">{message}</div> : null}

          {page === "login" ? (
            <form className="authForm" onSubmit={handleLogin}>
              <div className="field">
                <label className="field__label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  className="field__input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={resetMessages}
                  placeholder="ex: nome@dominio.com"
                  autoComplete="email"
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="password">
                  Palavra-passe
                </label>

                <div className="field__row">
                  <input
                    id="password"
                    className="field__input"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={resetMessages}
                    placeholder="mínimo 6 caracteres"
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="field__iconBtn"
                    onClick={() => setShowPass((p) => !p)}
                    aria-label={showPass ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
                  >
                    {showPass ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>

              <div className="authForm__links">
                <button type="button" className="linkBtn" onClick={() => switchTo("forgot")}>
                  Esqueci-me da palavra-passe
                </button>
              </div>

              <button type="submit" className="primaryBtn" disabled={!canLogin}>
                {busy ? "A entrar..." : "Entrar"}
              </button>

              <div className="authForm__divider" aria-hidden="true">
                <span />
                <span className="authForm__dividerText">ou</span>
                <span />
              </div>

              <button type="button" className="ghostBtn" onClick={() => switchTo("create")}>
                Criar conta
              </button>
            </form>
          ) : page === "create" ? (
            <form className="authForm" onSubmit={handleCreate}>
              <div className="field">
                <label className="field__label" htmlFor="createEmail">
                  Email
                </label>
                <input
                  id="createEmail"
                  className="field__input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={resetMessages}
                  placeholder="ex: nome@dominio.com"
                  autoComplete="email"
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="age">
                  Idade
                </label>
                <input
                  id="age"
                  className="field__input"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={150}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  onFocus={resetMessages}
                  placeholder="ex: 28"
                  autoComplete="bday-year"
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="location">
                  Localização (opcional)
                </label>
                <input
                  id="location"
                  className="field__input"
                  type="text"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  onFocus={resetMessages}
                  placeholder="ex: Lisboa"
                  maxLength={120}
                  autoComplete="address-level2"
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="createPass">
                  Palavra-passe
                </label>

                <div className="field__row">
                  <input
                    id="createPass"
                    className="field__input"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={resetMessages}
                    placeholder="mínimo 6 caracteres"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="field__iconBtn"
                    onClick={() => setShowPass((p) => !p)}
                    aria-label={showPass ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
                  >
                    {showPass ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="confirmPass">
                  Confirmar palavra-passe
                </label>

                <div className="field__row">
                  <input
                    id="confirmPass"
                    className="field__input"
                    type={showPass2 ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={resetMessages}
                    placeholder="repita a palavra-passe"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="field__iconBtn"
                    onClick={() => setShowPass2((p) => !p)}
                    aria-label={showPass2 ? "Ocultar palavra-passe" : "Mostrar"}
                  >
                    {showPass2 ? "Ocultar" : "Mostrar"}
                  </button>
                </div>

                {confirmPassword.length > 0 && confirmPassword !== password ? (
                  <div className="field__hint">As palavras-passe não coincidem.</div>
                ) : null}
              </div>

              <div className="field">
                <label className="field__label" htmlFor="newsletter">
                  Newsletter por email
                </label>

                <div className="field__row">
                  <input
                    id="newsletter"
                    type="checkbox"
                    checked={newsletterEmailAccept}
                    onChange={(e) => setNewsletterEmailAccept(e.target.checked)}
                    onFocus={resetMessages}
                    aria-label="Aceito receber newsletter por email"
                  />
                  <span className="field__hint" style={{ margin: 0 }}>
                    Quero receber novidades por email.
                  </span>
                </div>
              </div>

              <button type="submit" className="primaryBtn" disabled={!canCreate}>
                {busy ? "A criar..." : "Criar conta"}
              </button>

              <button type="button" className="ghostBtn" onClick={() => switchTo("login")}>
                Já tenho conta
              </button>
            </form>
          ) : (
            <form className="authForm" onSubmit={handleForgot}>
              <div className="field">
                <label className="field__label" htmlFor="forgotEmail">
                  Email
                </label>
                <input
                  id="forgotEmail"
                  className="field__input"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  onFocus={resetMessages}
                  placeholder="ex: nome@dominio.com"
                  autoComplete="email"
                />
              </div>

              <button type="submit" className="primaryBtn" disabled={!canForgot}>
                {busy ? "A enviar..." : "Enviar link"}
              </button>

              <button type="button" className="ghostBtn" onClick={() => switchTo("login")}>
                Voltar ao login
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

export default LoginPage;
