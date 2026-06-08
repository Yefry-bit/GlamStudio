import { Link } from "react-router-dom";
import "./PaginaPrincipal.css";

function PaginaPrincipal() {
  const menu = [
      { id: 1, title: "Agenda de Citas", icon: "📅", ruta: "/citas" },
      { id: 2, title: "Gestión Clientes", icon: "👥", ruta: null },
      { id: 3, title: "Gestión Servicios", icon: "✂️", ruta: "/gestion-servicios" },
      { id: 4, title: "Historial", icon: "📋", ruta: "/historial" }
    ];

  return (
    <div className="main-wrapper">
      {/* Título estilizado sin emojis */}
      <div className="brand-container">
        <h1 className="glam-title">GLAM STUDIO</h1>
        <div className="title-underline"></div>
      </div>
      
      <p className="admin-subtitle">PANEL DE ADMINISTRACIÓN</p>

      <div className="menu-grid">
        {menu.map((item) => (
          <div className="card-custom" key={item.id}>
            <div className="card-icon">{item.icon}</div>
            <h5 className="card-title">{item.title}</h5>

            {item.ruta ? (
              <Link to={item.ruta} style={{ textDecoration: 'none' }}>
                <button className="btn-main">Abrir</button>
              </Link>
            ) : (
              <button className="btn-main disabled" disabled>
                Próximamente
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PaginaPrincipal;