import { useEffect, useState } from "react";
import { encargadosService } from "../Services/encargadosService";
import "./GestionEncargados.css";

const ROLES = ["Administrador", "Barbero"];

const EMPTY_FORM = {
  idUsuario: 0,
  nombre: "",
  telefono: "",
  rol: "",
  username: "",
  password: "",
};

export default function GestionEncargados() {
  const [encargados, setEncargados] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchEncargados();
  }, []);

  async function fetchEncargados() {
    try {
      setLoading(true);
      const data = await encargadosService.getAll();
      setEncargados(data);
    } catch {
      setError("No se pudieron cargar los encargados.");
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
    setShowModal(true);
  }

  function openEdit(enc) {
    setForm({
      idUsuario: enc.idUsuario,
      nombre: enc.nombre || "",
      telefono: enc.telefono || "",
      rol: enc.rol || "",
      username: enc.username || "",
      password: enc.password || "",
    });
    setEditingId(enc.idUsuario);
    setError("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!form.telefono || form.telefono.length !== 10) {
      setError("El teléfono es obligatorio y debe tener 10 dígitos.");
      return;
    }

    const payload = {
      idUsuario: editingId ?? 0,
      nombre: form.nombre.trim(),
      telefono: form.telefono.trim(),
      rol: form.rol.trim(),
      username: form.username.trim(),
      password: form.password?.trim() ?? "",
    };

    try {
      if (editingId) {
        await encargadosService.update(editingId, payload);
        showToast("✓ Encargado actualizado");
      } else {
        await encargadosService.create(payload);
        showToast("✓ Encargado creado");
      }
      closeModal();
      fetchEncargados();
    } catch {
      setError("Ocurrió un error al guardar. Intenta de nuevo.");
    }
  }

  async function handleDelete(id, nombre) {
    if (!globalThis.confirm(`¿Eliminar a "${nombre}"?`)) return;
    try {
      await encargadosService.remove(id);
      showToast("✓ Encargado eliminado");
      fetchEncargados();
    } catch {
      showToast("Error al eliminar el encargado");
    }
  }

  const filtrados = encargados.filter(
    (e) =>
      e.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      e.rol?.toLowerCase().includes(search.toLowerCase())
  );

  function renderRolBadge(rol) {
    if (!rol) return <span>—</span>;
    return (
      <span className={`ge-badge ge-badge-${rol.toLowerCase()}`}>
        {rol}
      </span>
    );
  }

  function renderContenidoTabla() {
    if (loading) {
      return <div className="ge-empty">Cargando encargados...</div>;
    }
    if (filtrados.length === 0) {
      return <div className="ge-empty">No se encontraron encargados.</div>;
    }
    return (
      <table className="ge-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtrados.map((enc) => (
            <tr key={enc.idUsuario}>
              <td className="ge-td-id">{enc.idUsuario}</td>
              <td className="ge-td-nombre">{enc.nombre || "—"}</td>
              <td className="ge-td-telefono">{enc.telefono || "—"}</td>
              <td>{renderRolBadge(enc.rol)}</td>
              <td className="ge-td-actions">
                <button className="ge-btn-edit" onClick={() => openEdit(enc)}>
                  ✏️ Editar
                </button>
                <button
                  className="ge-btn-delete"
                  onClick={() => handleDelete(enc.idUsuario, enc.nombre || enc.username)}
                >
                  🗑️ Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  function handleOverlayKeyDown(e) {
    if (e.key === "Escape") {
      closeModal();
    }
  }

  return (
    <div className="ge-page">

      <div className="ge-header">
        <div className="ge-header-text">
          <h1 className="ge-title">Gestión de Encargados</h1>
          <p className="ge-subtitle">Administra el personal de GlamStudio</p>
        </div>
        <button className="ge-btn-primary" onClick={openCreate}>
          + Nuevo encargado
        </button>
      </div>

      <div className="ge-stats">
        <div className="ge-stat-card">
          <span className="ge-stat-label">Total encargados</span>
          <span className="ge-stat-value">{encargados.length}</span>
        </div>
        <div className="ge-stat-card">
          <span className="ge-stat-label">Barberos</span>
          <span className="ge-stat-value">
            {encargados.filter((e) => e.rol === "Barbero").length}
          </span>
        </div>
        <div className="ge-stat-card">
          <span className="ge-stat-label">Administradores</span>
          <span className="ge-stat-value">
            {encargados.filter((e) => e.rol === "Administrador").length}
          </span>
        </div>
      </div>

      <div className="ge-search-wrap">
        <span className="ge-search-icon">🔍</span>
        <input
          type="text"
          className="ge-search"
          placeholder="Buscar por nombre o rol..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="ge-table-wrap">
        {renderContenidoTabla()}
      </div>

      {showModal && (
      <div
      className="ge-overlay"
      aria-hidden="true"
      onClick={(e) => e.target === e.currentTarget && closeModal()}
      onKeyDown={handleOverlayKeyDown}
    >
          <dialog
            className="ge-modal"
            open
            aria-labelledby="modal-title"
          >
            <div className="ge-modal-header">
              <h2 id="modal-title" className="ge-modal-title">
                {editingId ? "Editar encargado" : "Nuevo encargado"}
              </h2>
              <button className="ge-modal-close" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="ge-field-row">
                <div className="ge-field">
                  <label htmlFor="nombre">Nombre completo *</label>
                  <input
                    id="nombre"
                    type="text"
                    placeholder="Ej: Rafael García"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    autoFocus
                  />
                </div>
                <div className="ge-field">
                  <label htmlFor="telefono">Teléfono (10 dígitos)</label>
                  <input
                    id="telefono"
                    type="text"
                    placeholder="Ej: 3001234567"
                    maxLength={10}
                    value={form.telefono}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setForm({ ...form, telefono: val });
                    }}
                  />
                </div>
              </div>

              <div className="ge-field">
                <label htmlFor="rol">Rol</label>
                <select
                  id="rol"
                  value={form.rol}
                  onChange={(e) => setForm({ ...form, rol: e.target.value })}
                >
                  <option value="">Selecciona un rol...</option>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {error && <p className="ge-error">{error}</p>}

              <div className="ge-modal-actions">
                <button type="button" className="ge-btn-cancel" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="ge-btn-primary">
                  {editingId ? "Guardar cambios" : "Crear encargado"}
                </button>
              </div>
            </form>
          </dialog>
        </div>
      )}

      {toast && <div className="ge-toast">{toast}</div>}
    </div>
  );
}
