const URL = "http://localhost:5078/api/Auth";

export const authService = {
  async login(username, password) {
    const res = await fetch(`${URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) throw new Error("Credenciales inválidas");

    const data = await res.json();
    localStorage.setItem("token", data.token);
    return data;
  },

  logout() {
    localStorage.removeItem("token");
  }
};