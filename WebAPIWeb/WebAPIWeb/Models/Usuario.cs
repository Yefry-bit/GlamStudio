using System.ComponentModel.DataAnnotations;

namespace WebAPIWeb.Models
{
    public class Usuario
    {
        [Key]
        public int IdUsuario { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;
        public string Rol { get; set; } = string.Empty;
    }
}