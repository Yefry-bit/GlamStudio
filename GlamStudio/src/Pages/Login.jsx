import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../Services/AuthService";
import "./Login.css";

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await authService.login(usuario, password);
      navigate("/principal");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-card" onSubmit={handleLogin}>
        <h2>Bienvenido</h2>
        <p>Inicia sesión para continuar</p>
        <div className="input-group">
          <label htmlFor="usuario">Usuario</label>
          <input
            id="usuario"
            type="text"
            placeholder="Escribe tu usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-btn">Ingresar</button>
      </form>
    </div>
  );
}