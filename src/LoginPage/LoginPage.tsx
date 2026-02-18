import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../scss/LoginPage.css";

type PageKey = "login" | "create" | "forgot";

function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function LoginPage() {
  const navigate = useNavigate();

  const [page, setPage] = useState<PageKey>("login");

  // shared
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // create account
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // forgot
  const [forgotEmail, setForgotEmail] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canLogin = useMemo(() => {
    return isEmail(email) && password.trim().length >= 6 && !busy;
  }, [email, password, busy]);

  const canCreate = useMemo(() => {
    const okEmail = isEmail(email);
    const okName = fullName.trim().length >= 2;
    const okPass = password.trim().length >= 6;
    const okMatch = confirmPassword.trim().length >= 6 && confirmPassword === password;
    return okEmail && okName && okPass && okMatch && !busy;
  }, [email, fullName, password, confirmPassword, busy]);

  const canForgot = useMemo(() => {
    return isEmail(forgotEmail) && !busy;
  }, [forgotEmail, busy]);

  const resetMessages = (): void => setMessage(null);

  const switchTo = (p: PageKey): void => {
    resetMessages();
    setPage(p);

    // keep email between pages (nice UX), but reset passwords
    setPassword("");
    setConfirmPassword("");
    setShowPass(false);
    setShowPass2(false);
  };

  // MOCK handlers (replace with your API calls)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canLogin) return;

    setBusy(true);
    setMessage(null);

    try {
      // TODO: call backend
      await new Promise((r) => setTimeout(r, 600));
      // navigate to movies or wherever makes sense
      navigate("/movies");
    } catch {
      setMessage("Não foi possível entrar. Verifique os dados e tente novamente.");
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) return;

    setBusy(true);
    setMessage(null);

    try {
      // TODO: call backend
      await new Promise((r) => setTimeout(r, 700));
      setMessage("Conta criada com sucesso. Pode entrar agora.");
      setPage("login");
      setConfirmPassword("");
      setPassword("");
    } catch {
      setMessage("Não foi possível criar a conta. Tente novamente.");
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
      // TODO: call backend
      await new Promise((r) => setTimeout(r, 650));
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
                <label className="field__label" htmlFor="name">
                  Nome
                </label>
                <input
                  id="name"
                  className="field__input"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onFocus={resetMessages}
                  placeholder="ex: Letícia Lima"
                  autoComplete="name"
                />
              </div>

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
                    aria-label={showPass2 ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
                  >
                    {showPass2 ? "Ocultar" : "Mostrar"}
                  </button>
                </div>

                {confirmPassword.length > 0 && confirmPassword !== password ? (
                  <div className="field__hint">As palavras-passe não coincidem.</div>
                ) : null}
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
