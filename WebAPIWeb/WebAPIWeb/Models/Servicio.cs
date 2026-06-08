using System.ComponentModel.DataAnnotations;

namespace WebAPIWeb.Models
{
    public class Servicio
    {
        [Key]
        public int IdServicio { get; set; }

        public string Nombre { get; set; } = string.Empty;

        public decimal Precio { get; set; }
    }
}
