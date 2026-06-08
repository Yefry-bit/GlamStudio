import { useEffect, useState } from "react";
import { serviciosService } from "../Services/serviciosService";
import "./GestionServicios.css";

const EMPTY_FORM = { idServicio: 0, nombre: "", precio: "" };

export default function GestionServicios() {
  const [servicios, setServicios] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchServicios();
  }, []);

  async function fetchServicios() {
    try {
      setLoading(true);
      const data = await serviciosService.getAll();
      setServicios(data);
    } catch {
      setError("No se pudieron cargar los servicios.");
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

  function openEdit(servicio) {
    setForm({
      idServicio: servicio.idServicio,
      nombre: servicio.nombre,
      precio: servicio.precio,
    });
    setEditingId(servicio.idServicio);
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
    if (!form.nombre.trim() || form.precio === "") {
      setError("Nombre y precio son obligatorios.");
      return;
    }
    const payload = {
      idServicio: editingId ?? 0,
      nombre: form.nombre.trim(),
      precio: parseFloat(form.precio),
    };
    try {
      if (editingId) {
        await serviciosService.update(editingId, payload);
        showToast("✓ Servicio actualizado");
      } else {
        await serviciosService.create(payload);
        showToast("✓ Servicio creado");
      }
      closeModal();
      fetchServicios();
    } catch {
      setError("Ocurrió un error al guardar. Intenta de nuevo.");
    }
  }

  async function handleDelete(id, nombre) {
    if (!window.confirm(`¿Eliminar "${nombre}"?`)) return;
    try {
      await serviciosService.remove(id);
      showToast("✓ Servicio eliminado");
      fetchServicios();
    } catch {
      showToast("Error al eliminar el servicio");
    }
  }

  const filtrados = servicios.filter((s) =>
    s.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="gs-page">

      {/* Header */}
      <div className="gs-header">
        <div className="gs-header-text">
          <h1 className="gs-title">Gestión de Servicios</h1>
          <p className="gs-subtitle">Administra los servicios de GlamStudio</p>
        </div>
        <button className="gs-btn-primary" onClick={openCreate}>
          + Nuevo servicio
        </button>
      </div>

      {/* Stats */}
      <div className="gs-stats">
        <div className="gs-stat-card">
          <span className="gs-stat-label">Total servicios</span>
          <span className="gs-stat-value">{servicios.length}</span>
        </div>
        <div className="gs-stat-card">
          <span className="gs-stat-label">Precio promedio</span>
          <span className="gs-stat-value">
            {servicios.length
              ? `$${(
                  servicios.reduce((a, s) => a + s.precio, 0) / servicios.length
                ).toLocaleString("es-CO", { maximumFractionDigits: 0 })}`
              : "$0"}
          </span>
        </div>
        <div className="gs-stat-card">
          <span className="gs-stat-label">Precio más alto</span>
          <span className="gs-stat-value">
            {servicios.length
              ? `$${Math.max(...servicios.map((s) => s.precio)).toLocaleString("es-CO")}`
              : "$0"}
          </span>
        </div>
      </div>

      {/* Buscador */}
      <div className="gs-search-wrap">
        <span className="gs-search-icon">🔍</span>
        <input
          type="text"
          className="gs-search"
          placeholder="Buscar servicio por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <div className="gs-table-wrap">
        {loading ? (
          <div className="gs-empty">Cargando servicios...</div>
        ) : filtrados.length === 0 ? (
          <div className="gs-empty">No se encontraron servicios.</div>
        ) : (
          <table className="gs-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((s) => (
                <tr key={s.idServicio}>
                  <td className="gs-td-id">{s.idServicio}</td>
                  <td className="gs-td-nombre">{s.nombre}</td>
                  <td className="gs-td-precio">
                    ${s.precio.toLocaleString("es-CO")}
                  </td>
                  <td className="gs-td-actions">
                    <button
                      className="gs-btn-edit"
                      onClick={() => openEdit(s)}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      className="gs-btn-delete"
                      onClick={() => handleDelete(s.idServicio, s.nombre)}
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="gs-overlay"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="gs-modal">
            <div className="gs-modal-header">
              <h2 className="gs-modal-title">
                {editingId ? "Editar servicio" : "Nuevo servicio"}
              </h2>
              <button className="gs-modal-close" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="gs-field">
                <label htmlFor="nombre">Nombre del servicio *</label>
                <input
                  id="nombre"
                  type="text"
                  placeholder="Ej: Corte de cabello"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  autoFocus
                />
              </div>

              <div className="gs-field">
                <label htmlFor="precio">Precio (COP $) *</label>
                <input
                  id="precio"
                  type="number"
                  placeholder="Ej: 50000"
                  min="0"
                  step="100"
                  value={form.precio}
                  onChange={(e) => setForm({ ...form, precio: e.target.value })}
                />
              </div>

              {error && <p className="gs-error">{error}</p>}

              <div className="gs-modal-actions">
                <button
                  type="button"
                  className="gs-btn-cancel"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button type="submit" className="gs-btn-primary">
                  {editingId ? "Guardar cambios" : "Crear servicio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="gs-toast">{toast}</div>}
    </div>
  );
}
