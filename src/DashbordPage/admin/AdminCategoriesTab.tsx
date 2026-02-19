import React, { useEffect, useMemo, useState } from "react";
import type { ApiError } from "../../api/http";
import {
  createVideoCategory,
  deleteVideoCategory,
  getVideoCategories,
  updateVideoCategory,
  type VideoCategoryResponse,
} from "../../api/videoCategories";

function getErrorMessage(err: unknown): string {
  const maybe = err as Partial<ApiError> | null;
  if (maybe && typeof maybe === "object" && typeof maybe.message === "string") return maybe.message;
  if (err instanceof Error) return err.message;
  return "Não foi possível concluir. Tente novamente.";
}

export default function AdminCategoriesTab() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [items, setItems] = useState<VideoCategoryResponse[]>([]);
  const [newName, setNewName] = useState("");

  const load = async () => {
    setBusy(true);
    setError(null);
    try {
      const data = await getVideoCategories();
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

  const canCreate = useMemo(() => newName.trim().length > 0 && newName.trim().length <= 120 && !busy, [newName, busy]);

  const onCreate = async () => {
    if (!canCreate) return;
    setBusy(true);
    setError(null);
    setOk(null);

    try {
      await createVideoCategory({ categoryName: newName.trim() });
      setNewName("");
      setOk("Categoria criada.");
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const onRename = async (id: number, nextName: string) => {
    const n = nextName.trim();
    if (!n) return;

    setBusy(true);
    setError(null);
    setOk(null);

    try {
      await updateVideoCategory(id, { categoryName: n });
      setOk("Categoria atualizada.");
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id: number) => {
    setBusy(true);
    setError(null);
    setOk(null);

    try {
      await deleteVideoCategory(id);
      setOk("Categoria removida.");
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Categorias</h2>

      {error ? <div className="notice notice--error">{error}</div> : null}
      {ok ? <div className="notice notice--ok">{ok}</div> : null}

      <div className="row" style={{ marginTop: 12, justifyContent: "space-between" }}>
        <div className="field" style={{ minWidth: 320, flex: 1 }}>
          <div className="field__label">Nova categoria</div>
          <input
            className="field__input"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="ex: Drama"
            maxLength={120}
          />
        </div>

        <button className="dbtn dbtn--primary" type="button" onClick={() => void onCreate()} disabled={!canCreate}>
          {busy ? "A criar..." : "Criar"}
        </button>

        <button className="dbtn" type="button" onClick={() => void load()} disabled={busy}>
          Atualizar
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <table className="table" aria-label="Categories table">
          <thead>
            <tr>
              <th>Nome</th>
              <th style={{ width: 220 }}>Ações</th>
            </tr>
          </thead>

          <tbody>
            {items.map((c) => (
              <CategoryRow key={c.id} item={c} busy={busy} onRename={onRename} onDelete={onDelete} />
            ))}
          </tbody>
        </table>

        {!busy && items.length === 0 ? <div className="notice">Sem categorias.</div> : null}
      </div>
    </div>
  );
}

function CategoryRow({
  item,
  busy,
  onRename,
  onDelete,
}: {
  item: VideoCategoryResponse;
  busy: boolean;
  onRename: (id: number, nextName: string) => Promise<void> | void;
  onDelete: (id: number) => Promise<void> | void;
}) {
  const [name, setName] = useState(item.name);

  useEffect(() => {
    setName(item.name);
  }, [item.name]);

  return (
    <tr className="tr">
      <td>
        <input className="field__input" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
      </td>
      <td>
        <div className="row">
          <button className="dbtn" type="button" onClick={() => onRename(item.id, name)} disabled={busy}>
            Guardar
          </button>
          <button className="dbtn dbtn--danger" type="button" onClick={() => onDelete(item.id)} disabled={busy}>
            Remover
          </button>
        </div>
      </td>
    </tr>
  );
}
