using Microsoft.EntityFrameworkCore;

namespace WebAPIWeb.Models
{
    public class ContextBD : DbContext
    {
        public ContextBD(DbContextOptions<ContextBD> options)
            : base(options)
        {
        }

        public DbSet<Cita> Cita { get; set; }
        public DbSet<Servicio> Servicio { get; set; }
        public DbSet<Usuario> Usuario { get; set; }
    }
}