const URL = "http://localhost:5078/api/Encargados";

export const encargadosService = {
  async getAll() {
    const token = localStorage.getItem("token");
    const res = await fetch(URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al obtener los encargados");
    return await res.json();
  },

  async create(nuevoEncargado) {
    const token = localStorage.getItem("token");
    const res = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(nuevoEncargado),
    });
    if (!res.ok) throw new Error("Error al crear el encargado");
    return await res.json();
  },

  async update(id, encargado) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(encargado),
    });
    if (!res.ok) throw new Error("Error al actualizar el encargado");
    return await res.json();
  },

  async remove(id) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${URL}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al eliminar el encargado");
  },
};