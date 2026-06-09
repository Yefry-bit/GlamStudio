import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./CitasPage.css";
import { serviciosService } from "../Services/serviciosService";
import { encargadosService } from "../Services/encargadosService";

const toLocalISOString = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
};

const parseFechaBackend = (fechaStr) => {
  const s = fechaStr.endsWith("Z") ? fechaStr.slice(0, -1) : fechaStr;
  return new Date(s);
};

export default function CitasPage() {
  const [encargado, setEncargado] = useState("");
  const [fecha, setFecha] = useState(new Date());
  const [servicio, setServicio] = useState("");
  const [citas, setCitas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [encargados, setEncargados] = useState([]);
  const [guardando, setGuardando] = useState(false);

  const API_URL = "http://localhost:5078/api/Citas";

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  const cargarCitas = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("No se pudieron cargar las citas");
      const data = await res.json();
      setCitas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  const cargarServicios = async () => {
    try {
      const data = await serviciosService.getAll();
      setServicios(data);
      if (data.length > 0) setServicio(String(data[0].idServicio));
    } catch (error) {
      console.error("Error al cargar servicios:", error);
    }
  };

  const cargarEncargados = async () => {
    try {
      const data = await encargadosService.getAll();
      // Solo mostrar barberos
      const barberos = data.filter((e) => e.rol === "Barbero");
      setEncargados(barberos);
    } catch (error) {
      console.error("Error al cargar encargados:", error);
    }
  };

  useEffect(() => {
    cargarCitas();
    cargarServicios();
    cargarEncargados();
  }, []);

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!encargado) { alert("Seleccione un encargado"); return; }
    if (!servicio) { alert("Seleccione un servicio"); return; }

    const ocupada = citas.some((cita) => {
      const fechaExistente = parseFechaBackend(cita.fechaHora);
      return (
        cita.personalEncargado === encargado &&
        fechaExistente.getFullYear() === fecha.getFullYear() &&
        fechaExistente.getMonth() === fecha.getMonth() &&
        fechaExistente.getDate() === fecha.getDate() &&
        fechaExistente.getHours() === fecha.getHours() &&
        fechaExistente.getMinutes() === fecha.getMinutes()
      );
    });

    if (ocupada) { alert(`❌ ${encargado} ya tiene una cita en ese horario.`); return; }

    const token = localStorage.getItem("token");
    if (!token) { alert("⚠️ Debes iniciar sesión primero."); return; }

    setGuardando(true);

    const nuevaCita = {
      personalEncargado: encargado,
      fechaHora: toLocalISOString(fecha),
      servicioId: parseInt(servicio),
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify(nuevaCita),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        alert("Tu sesión ha expirado. Inicia sesión nuevamente.");
        window.location.href = "/";
        return;
      }
      if (!res.ok) {
        const mensaje = await res.text();
        throw new Error(mensaje);
      }

      alert("✅ Cita registrada correctamente");
      setEncargado("");
      setFecha(new Date());
      cargarCitas();
      cargarServicios();
    } catch (error) {
      console.error(error);
      alert("❌ " + error.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="citas-wrapper">
      <h2 className="main-title">Gestión de Citas</h2>

      <form className="form-container" onSubmit={handleGuardar}>
        <select value={encargado} onChange={(e) => setEncargado(e.target.value)} required>
          <option value="">Seleccione encargado</option>
          {encargados.map((enc) => (
            <option key={enc.idUsuario} value={enc.nombre}>
              {enc.nombre}
            </option>
          ))}
        </select>

        <DatePicker
          selected={fecha}
          onChange={(d) => setFecha(d)}
          showTimeSelect
          timeIntervals={30}
          timeFormat="HH:mm"
          dateFormat="dd/MM/yyyy HH:mm"
          minDate={new Date()}
          minTime={new Date(0, 0, 0, 8, 0)}
          maxTime={new Date(0, 0, 0, 20, 0)}
          filterTime={(time) => {
            if (!encargado) return true;
            const slot = new Date(fecha);
            slot.setHours(time.getHours(), time.getMinutes(), 0, 0);
            return !citas.some((cita) => {
              const citaFecha = parseFechaBackend(cita.fechaHora);
              return (
                cita.personalEncargado === encargado &&
                citaFecha.getFullYear() === slot.getFullYear() &&
                citaFecha.getMonth() === slot.getMonth() &&
                citaFecha.getDate() === slot.getDate() &&
                citaFecha.getHours() === slot.getHours() &&
                citaFecha.getMinutes() === slot.getMinutes()
              );
            });
          }}
          customInput={<input className="custom-input" />}
        />

        <select value={servicio} onChange={(e) => setServicio(e.target.value)} required>
          <option value="">Seleccione servicio</option>
          {servicios.map((s) => (
            <option key={s.idServicio} value={String(s.idServicio)}>
              {s.nombre} — ${s.precio.toLocaleString("es-CO")}
            </option>
          ))}
        </select>

        <button type="submit" disabled={guardando}>
          {guardando ? "Guardando..." : "Reservar Turno"}
        </button>
      </form>

      <div className="lista-citas-contenedor">
        <h3 className="section-title">Citas Programadas</h3>
        {[...citas]
          .sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora))
          .map((c, i) => (
            <div key={c.idCita || i} className="citas-card">
              <div className="citas-card-content">
                <span className="card-encargado">{c.personalEncargado}</span>
                <span className="card-servicio">{c.servicio?.nombre || "Servicio"}</span>
                <span className="card-fecha">
                  {parseFechaBackend(c.fechaHora).toLocaleString("es-ES", {
                    day: "2-digit", month: "2-digit", year: "numeric",
                    hour: "2-digit", minute: "2-digit", hour12: false,
                  })}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
