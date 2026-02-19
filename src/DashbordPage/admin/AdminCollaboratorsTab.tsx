import React, { useEffect, useMemo, useState } from "react";
import type { ApiError } from "../../api/http";
import {
  createCollaborator,
  deleteCollaborator,
  getCollaborators,
  updateCollaborator,
  type CollaboratorResponse,
} from "../../api/collaborators";

function getErrorMessage(err: unknown): string {
  const maybe = err as Partial<ApiError> | null;
  if (maybe && typeof maybe === "object" && typeof maybe.message === "string") return maybe.message;
  if (err instanceof Error) return err.message;
  return "Não foi possível concluir. Tente novamente.";
}

export default function AdminCollaboratorsTab() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [items, setItems] = useState<CollaboratorResponse[]>([]);

  // create form
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [socialMedia, setSocialMedia] = useState("");
  const [profileImage, setProfileImage] = useState("");

  const load = async () => {
    setBusy(true);
    setError(null);
    try {
      const data = await getCollaborators();
      setItems(data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const canCreate = useMemo(() => {
    if (busy) return false;
    if (!name.trim() || name.trim().length > 120) return false;
    if (!role.trim() || role.trim().length > 120) return false;
    if (socialMedia.trim().length > 255) return false;
    if (profileImage.trim().length > 500) return false;
    return true;
  }, [busy, name, role, socialMedia, profileImage]);

  const onCreate = async () => {
    if (!canCreate) return;

    setBusy(true);
    setError(null);
    setOk(null);

    try {
      await createCollaborator({
        name: name.trim(),
        role: role.trim(),
        socialMedia: socialMedia.trim() ? socialMedia.trim() : null,
        profileImage: profileImage.trim() ? profileImage.trim() : null,
      });

      setOk("Colaborador criado.");
      setName("");
      setRole("");
      setSocialMedia("");
      setProfileImage("");

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
        Colaboradores
      </h2>

      {error ? <div className="dashMsg dashMsg--error">{error}</div> : null}
      {ok ? <div className="dashMsg dashMsg--ok">{ok}</div> : null}

      <section className="dash__panel" style={{ marginTop: 12 }}>
        <h3 className="dash__panelTitle" style={{ marginTop: 0 }}>
          Adicionar colaborador
        </h3>

        <div className="dashForm">
          <div className="dashForm__grid2">
            <label className="dashField">
              <span className="dashField__label">Nome</span>
              <input className="dashField__input" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
            </label>

            <label className="dashField">
              <span className="dashField__label">Função</span>
              <input className="dashField__input" value={role} onChange={(e) => setRole(e.target.value)} maxLength={120} />
            </label>
          </div>

          <div className="dashForm__grid2">
            <label className="dashField">
              <span className="dashField__label">Rede social (opcional)</span>
              <input
                className="dashField__input"
                value={socialMedia}
                onChange={(e) => setSocialMedia(e.target.value)}
                maxLength={255}
                placeholder="ex: https://instagram.com/..."
              />
            </label>

            <label className="dashField">
              <span className="dashField__label">Imagem de perfil (opcional)</span>
              <input
                className="dashField__input"
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                maxLength={500}
                placeholder="URL da imagem"
              />
            </label>
          </div>

          <div className="dashActions">
            <button className="dashBtn" type="button" onClick={() => void onCreate()} disabled={!canCreate}>
              {busy ? "A criar..." : "Criar colaborador"}
            </button>

            <button className="dashBtn" type="button" onClick={() => void load()} disabled={busy}>
              Atualizar
            </button>
          </div>
        </div>
      </section>

      <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
        {items.map((c) => (
          <CollaboratorCard key={c.collaboratorId} item={c} busy={busy} onReload={load} setBusy={setBusy} setError={setError} setOk={setOk} />
        ))}

        {!busy && items.length === 0 ? <div className="dashMsg">Sem colaboradores.</div> : null}
      </div>
    </div>
  );
}

function CollaboratorCard({
  item,
  busy,
  onReload,
  setBusy,
  setError,
  setOk,
}: {
  item: CollaboratorResponse;
  busy: boolean;
  onReload: () => Promise<void> | void;
  setBusy: (v: boolean) => void;
  setError: (v: string | null) => void;
  setOk: (v: string | null) => void;
}) {
  const [name, setName] = useState(item.name);
  const [role, setRole] = useState(item.role);
  const [socialMedia, setSocialMedia] = useState(item.socialMedia ?? "");
  const [profileImage, setProfileImage] = useState(item.profileImage ?? "");

  useEffect(() => {
    setName(item.name);
    setRole(item.role);
    setSocialMedia(item.socialMedia ?? "");
    setProfileImage(item.profileImage ?? "");
  }, [item]);

  const canSave = useMemo(() => {
    if (busy) return false;
    if (!name.trim() || name.trim().length > 120) return false;
    if (!role.trim() || role.trim().length > 120) return false;
    if (socialMedia.trim().length > 255) return false;
    if (profileImage.trim().length > 500) return false;
    return true;
  }, [busy, name, role, socialMedia, profileImage]);

  const onSave = async () => {
    if (!canSave) return;

    setBusy(true);
    setError(null);
    setOk(null);

    try {
      await updateCollaborator(item.collaboratorId, {
        name: name.trim(),
        role: role.trim(),
        socialMedia: socialMedia.trim() ? socialMedia.trim() : null,
        profileImage: profileImage.trim() ? profileImage.trim() : null,
      });

      setOk("Colaborador atualizado.");
      await onReload();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    setBusy(true);
    setError(null);
    setOk(null);

    try {
      await deleteCollaborator(item.collaboratorId);
      setOk("Colaborador removido.");
      await onReload();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="dash__panel">
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        {item.profileImage ? (
          <img
            src={item.profileImage}
            alt={item.name}
            style={{ width: 72, height: 72, borderRadius: 16, objectFit: "cover" }}
          />
        ) : (
          <div style={{ width: 72, height: 72, borderRadius: 16, background: "rgba(255,255,255,0.06)" }} />
        )}

        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>{item.name}</h3>
          <div style={{ opacity: 0.75, fontSize: 13, marginTop: 6 }}>
            <strong>{item.role}</strong> · ID: {item.collaboratorId}
          </div>

          <div className="dashForm" style={{ marginTop: 12 }}>
            <div className="dashForm__grid2">
              <label className="dashField">
                <span className="dashField__label">Nome</span>
                <input className="dashField__input" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
              </label>

              <label className="dashField">
                <span className="dashField__label">Função</span>
                <input className="dashField__input" value={role} onChange={(e) => setRole(e.target.value)} maxLength={120} />
              </label>
            </div>

            <div className="dashForm__grid2">
              <label className="dashField">
                <span className="dashField__label">Rede social</span>
                <input className="dashField__input" value={socialMedia} onChange={(e) => setSocialMedia(e.target.value)} maxLength={255} />
              </label>

              <label className="dashField">
                <span className="dashField__label">Imagem de perfil</span>
                <input className="dashField__input" value={profileImage} onChange={(e) => setProfileImage(e.target.value)} maxLength={500} />
              </label>
            </div>
          </div>
        </div>

        <div className="dashActions" style={{ marginTop: 0 }}>
          <button className="dashBtn" type="button" onClick={() => void onSave()} disabled={!canSave}>
            Guardar
          </button>
          <button className="dashBtn" type="button" onClick={() => void onDelete()} disabled={busy}>
            Remover
          </button>
        </div>
      </div>
    </article>
  );
}

