import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./HistorialPage.css";

const ENCARGADOS = ["Yefry Nuñez", "Rafael Nuñez", "Yeris Nuñez"];

const SERVICIOS = [
  { id: 5, nombre: "✂️ Corte de cabello" },
  { id: 6, nombre: "💈 Corte + Barba" },
  { id: 7, nombre: "🧖 Mascarilla" },
  { id: 8, nombre: "✨ Todo incluido" },
];

// Formatea un Date como "YYYY-MM-DDTHH:mm:ss" sin conversión UTC
const toLocalISOString = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
};

// Parsea la fecha del backend sumándole el offset para mostrarla correctamente
const parseFechaBackend = (fechaStr) => {
  // El backend guarda UTC pero es hora local — tratamos el string como local
  const s = fechaStr.endsWith("Z") ? fechaStr.slice(0, -1) : fechaStr;
  return new Date(s);
};

export default function HistorialPage() {
  const API_URL = "http://localhost:5078/api/Citas";
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [citaEditar, setCitaEditar] = useState({
    idCita: 0,
    personalEncargado: "",
    fechaHora: new Date(),
    servicioId: 5,
  });

  const modalRef = useRef(null);

  const getModalInstance = () => {
    if (!modalRef.current) return null;
    return (
      Modal.getInstance(modalRef.current) ||
      new Modal(modalRef.current, { backdrop: "static" })
    );
  };

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Tu sesión expiró. Inicia sesión de nuevo.");
      navigate("/");
      return null;
    }
    return token;
  };

  const cargarCitas = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setCitas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar citas:", error);
    }
  };

  useEffect(() => { cargarCitas(); }, []);

  const eliminarCita = async (id) => {
    if (!window.confirm("¿Desea eliminar esta cita?")) return;
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        alert("Tu sesión expiró. Inicia sesión de nuevo.");
        navigate("/");
        return;
      }
      if (!res.ok) throw new Error(`Error ${res.status}`);
      cargarCitas();
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("❌ No se pudo eliminar la cita");
    }
  };

  const abrirModalEditar = (cita) => {
    setCitaEditar({
      ...cita,
      // Parseamos sin conversión UTC para que el DatePicker muestre la hora correcta
      fechaHora: parseFechaBackend(cita.fechaHora),
    });
    getModalInstance()?.show();
  };

  const cerrarModal = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    getModalInstance()?.hide();
  };

  const actualizarCita = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const payload = {
        ...citaEditar,
        // ✅ Enviamos hora local sin conversión UTC
        fechaHora: citaEditar.fechaHora instanceof Date
          ? toLocalISOString(citaEditar.fechaHora)
          : citaEditar.fechaHora,
      };
      const res = await fetch(`${API_URL}/${citaEditar.idCita}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.status === 401 || res.status === 403) {
        alert("Tu sesión expiró. Inicia sesión de nuevo.");
        navigate("/");
        return;
      }
      if (!res.ok) throw new Error(`Error ${res.status}`);
      cerrarModal();
      cargarCitas();
      alert("✅ Cita actualizada");
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("❌ No se pudo actualizar la cita");
    }
  };

  return (
    <div className="historial-container">
      <h2 className="historial-title">Historial de Citas</h2>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>Encargado</th>
              <th>Servicio</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {citas.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-muted py-4">
                  No hay citas registradas
                </td>
              </tr>
            ) : (
              citas.map((cita) => (
                <tr key={cita.idCita}>
                  <td>{cita.personalEncargado}</td>
                  <td>{cita.servicio?.nombre || "N/A"}</td>
                  {/* ✅ Parseamos sin UTC para mostrar hora correcta */}
                  <td>{parseFechaBackend(cita.fechaHora).toLocaleString("es-ES")}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => abrirModalEditar(cita)}
                    >✏️ Editar</button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => eliminarCita(cita.idCita)}
                    >🗑️ Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Edición */}
      <div className="modal fade" ref={modalRef} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Editar Cita</h5>
              <button type="button" className="btn-close" onClick={cerrarModal} aria-label="Cerrar" />
            </div>
            <div className="modal-body">
              <label className="form-label">Personal encargado</label>
              <select
                className="form-select mb-3"
                value={citaEditar.personalEncargado}
                onChange={(e) => setCitaEditar({ ...citaEditar, personalEncargado: e.target.value })}
              >
                <option value="">👤 Seleccione encargado</option>
                {ENCARGADOS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>

              <label className="form-label">Fecha y hora</label>
              <div className="mb-3">
                <DatePicker
                  selected={citaEditar.fechaHora}
                  onChange={(d) => setCitaEditar({ ...citaEditar, fechaHora: d })}
                  showTimeSelect
                  timeIntervals={30}
                  timeFormat="HH:mm"
                  dateFormat="dd/MM/yyyy HH:mm"
                  filterTime={(time) => {
                    const fechaBase = citaEditar.fechaHora instanceof Date
                      ? citaEditar.fechaHora : new Date(citaEditar.fechaHora);
                    const slot = new Date(fechaBase);
                    slot.setHours(time.getHours(), time.getMinutes(), 0, 0);

                    // Rango 8:00–20:00
                    const h = slot.getHours();
                    const m = slot.getMinutes();
                    if (h < 8 || (h === 20 && m > 0) || h > 20) return false;

                    // Bloquea pasadas si es hoy
                    if (fechaBase.toDateString() === new Date().toDateString()) {
                      if (slot <= new Date()) return false;
                    }

                    // Bloquea ocupados del mismo encargado
                    if (!citaEditar.personalEncargado) return true;
                    return !citas.some((c) => {
                      if (c.idCita === citaEditar.idCita) return false;
                      if (c.personalEncargado !== citaEditar.personalEncargado) return false;
                      const cf = parseFechaBackend(c.fechaHora);
                      return (
                        cf.getFullYear() === slot.getFullYear() &&
                        cf.getMonth() === slot.getMonth() &&
                        cf.getDate() === slot.getDate() &&
                        cf.getHours() === slot.getHours() &&
                        cf.getMinutes() === slot.getMinutes()
                      );
                    });
                  }}
                  customInput={<input className="form-control" />}
                />
              </div>

              <label className="form-label">Servicio</label>
              <select
                className="form-select"
                value={citaEditar.servicioId}
                onChange={(e) => setCitaEditar({ ...citaEditar, servicioId: parseInt(e.target.value) })}
              >
                {SERVICIOS.map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={cerrarModal}>Cancelar</button>
              <button className="btn btn-success" onClick={actualizarCita}>Guardar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
