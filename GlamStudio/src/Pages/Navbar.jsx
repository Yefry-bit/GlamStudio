import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/") return null;

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="glam-navbar">
      <span className="glam-navbar-brand">
        ✂️ GLAM <span>STUDIO</span>
      </span>
      <div className="glam-navbar-actions">
        {location.pathname !== "/principal" && (
          <button className="glam-btn-back" onClick={() => navigate("/principal")}>
            ← Inicio
          </button>
        )}
        <button className="glam-btn-logout" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}