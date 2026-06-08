const URL = "http://localhost:5078/api/Servicios";
 
export const serviciosService = {
  async getAll() {
    const token = localStorage.getItem("token");
    const res = await fetch(URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al obtener los servicios");
    return await res.json();
  },
 
  async create(nuevoServicio) {
    const token = localStorage.getItem("token");
    const res = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(nuevoServicio),
    });
    if (!res.ok) throw new Error("Error al crear el servicio");
    return await res.json();
  },
 
  async update(id, servicio) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(servicio),
    });
    if (!res.ok) throw new Error("Error al actualizar el servicio");
    return await res.json();
  },
 
  async remove(id) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${URL}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al eliminar el servicio");
  },
};