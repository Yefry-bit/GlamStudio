import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Pages/Navbar";       
import LoginPage from "./Pages/Login";
import PaginaPrincipal from "./Pages/PaginaPrincipal";
import CitasPage from "./Pages/CitasPage";
import HistorialPage from "./Pages/HistorialPage";
import GestionServicios from "./Pages/GestionServicios";
import GestionEncargados from "./Pages/GestionEncargados";

function App() {
  return (
    <Router>
      <Navbar />                                    
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/principal" element={<PaginaPrincipal />} />
        <Route path="/historial" element={<HistorialPage />} />
        <Route path="/citas" element={<CitasPage />} />
        <Route path="/gestion-servicios" element={<GestionServicios />} />
        <Route path="/gestion-encargados" element={<GestionEncargados />} />
        <Route path="*" element={<div><h1>404 - Página no encontrada</h1></div>} />
      </Routes>
    </Router>
  );
}

export default App;