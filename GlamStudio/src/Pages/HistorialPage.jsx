import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./HistorialPage.css";
import { encargadosService } from "../Services/encargadosService";

const toLocalISOString = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
};

const parseFechaBackend = (fechaStr) => {
  const s = fechaStr.endsWith("Z") ? fechaStr.slice(0, -1) : fechaStr;
  return new Date(s);
};

export default function HistorialPage() {
  const API_URL = "http://localhost:5078/api/Citas";
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [encargados, setEncargados] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [citaEditar, setCitaEditar] = useState({
    idCita: 0,
    personalEncargado: "",
    fechaHora: new Date(),
    servicioId: 0,
  });

  const modalRef = useRef(null);

  // ✅ fix: eliminada variable getModalInstance, lógica inlinada directamente
  const showModal = () => {
    if (!modalRef.current) return;
    const instance =
      Modal.getInstance(modalRef.current) ||
      new Modal(modalRef.current, { backdrop: "static" });
    instance.show();
  };

  const hideModal = () => {
    if (!modalRef.current) return;
    const instance = Modal.getInstance(modalRef.current);
    instance?.hide();
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

  const cargarEncargados = async () => {
    try {
      const data = await encargadosService.getAll();
      const barberos = data.filter((e) => e.rol === "Barbero");
      setEncargados(barberos);
    } catch (error) {
      console.error("Error al cargar encargados:", error);
    }
  };

  const cargarServicios = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5078/api/Servicios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setServicios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar servicios:", error);
    }
  };

  useEffect(() => {
    cargarCitas();
    cargarEncargados();
    cargarServicios();
  }, []);

  const eliminarCita = async (id) => {
    if (!globalThis.confirm("¿Desea eliminar esta cita?")) return;
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
      fechaHora: parseFechaBackend(cita.fechaHora),
    });
    showModal(); // ✅ fix: usa showModal directo
  };

  const cerrarModal = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    hideModal(); // ✅ fix: usa hideModal directo
  };

  const actualizarCita = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const payload = {
        ...citaEditar,
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

              <label htmlFor="encargado-select" className="form-label">Personal encargado</label>
              <select
                id="encargado-select"
                className="form-select mb-3"
                value={citaEditar.personalEncargado}
                onChange={(e) => setCitaEditar({ ...citaEditar, personalEncargado: e.target.value })}
              >
                <option value="">👤 Seleccione encargado</option>
                {encargados.map((enc) => (
                  <option key={enc.idUsuario} value={enc.nombre}>
                    {enc.nombre}
                  </option>
                ))}
              </select>

              <label htmlFor="fecha-picker" className="form-label">Fecha y hora</label>
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
                    const h = slot.getHours();
                    const m = slot.getMinutes();
                    if (h < 8 || (h === 20 && m > 0) || h > 20) return false;
                    if (fechaBase.toDateString() === new Date().toDateString()) {
                      if (slot <= new Date()) return false;
                    }
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
                  customInput={<input id="fecha-picker" className="form-control" />}
                />
              </div>

              <label htmlFor="servicio-select" className="form-label">Servicio</label>
              <select
                id="servicio-select"
                className="form-select"
                value={citaEditar.servicioId}
                onChange={(e) => setCitaEditar({ ...citaEditar, servicioId: Number.parseInt(e.target.value, 10) })}
              >
                <option value="">Seleccione servicio</option>
                {servicios.map((s) => (
                  <option key={s.idServicio} value={s.idServicio}>
                    {s.nombre} — ${s.precio.toLocaleString("es-CO")}
                  </option>
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
