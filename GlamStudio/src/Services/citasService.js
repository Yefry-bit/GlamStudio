const URL = "http://localhost:5078/api/Citas";

export const citasService = {
  async getAll() {
    const token = localStorage.getItem("token");
    const res = await fetch(URL, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    return await res.json();
  },

  async create(nuevaCita) {
    const token = localStorage.getItem("token");
    const res = await fetch(URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(nuevaCita),
    });

    if (!res.ok) throw new Error("Error al crear la cita");
    return await res.json();
  }
};