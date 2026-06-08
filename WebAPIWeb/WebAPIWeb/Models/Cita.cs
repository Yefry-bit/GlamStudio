using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebAPIWeb.Models
{
    public class Cita
    {
        [Key]
        public int IdCita { get; set; }

        [Required]
        public string PersonalEncargado { get; set; } = string.Empty;

        [Required]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd HH:mm}", ApplyFormatInEditMode = true)]
        public DateTime FechaHora { get; set; }

        [Required]
        public int ServicioId { get; set; }

        [ForeignKey("ServicioId")]
        public Servicio? Servicio { get; set; }
    }
}