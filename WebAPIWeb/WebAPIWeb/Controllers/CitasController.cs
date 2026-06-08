using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPIWeb.Models;

namespace WebAPIWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // 🔒 Protege todo el controlador por defecto!

    public class CitasController : ControllerBase
    {
        private readonly ContextBD _context;

        public CitasController(ContextBD context)
        {
            _context = context;
        }

        // GET: api/Citas
        [AllowAnonymous] // 🔓 Permite ver la lista de citas sin token (SOLUCIONA EL 401)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cita>>> Get()
        {
            return await _context.Cita
                .Include(c => c.Servicio)
                .ToListAsync();
        }
        // PUT: api/Citas/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, Cita cita)
        {
            if (id != cita.IdCita)
                return BadRequest();

            _context.Entry(cita).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch
            {
                return NotFound();
            }

            return NoContent();
        }

        // DELETE: api/Citas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var cita = await _context.Cita.FindAsync(id);

            if (cita == null)
                return NotFound();

            _context.Cita.Remove(cita);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        // POST: api/Citas
        [HttpPost] // 🔒 Seguirá pidiendo token para agendar (CORRECTO)
        public async Task<ActionResult<Cita>> Post(Cita cita)
        {
            if (cita.FechaHora < DateTime.Now)
                return BadRequest("❌ No puedes agendar citas en el pasado");

            if (string.IsNullOrEmpty(cita.PersonalEncargado))
                return BadRequest("❌ Debes ingresar el encargado");

            var servicioExiste = await _context.Servicio.AnyAsync(s => s.IdServicio == cita.ServicioId);

            if (!servicioExiste)
                return BadRequest("❌ Servicio no válido");

            // Validar que no exista otra cita en la misma fecha y hora
            var citaExistente = await _context.Cita.AnyAsync(c =>
            c.PersonalEncargado == cita.PersonalEncargado &&
            c.FechaHora.Year == cita.FechaHora.Year &&
            c.FechaHora.Month == cita.FechaHora.Month &&
            c.FechaHora.Day == cita.FechaHora.Day &&
            c.FechaHora.Hour == cita.FechaHora.Hour &&
            c.FechaHora.Minute == cita.FechaHora.Minute
);


            if (citaExistente)
                return BadRequest("❌ Ya existe una cita en ese horario");

            _context.Cita.Add(cita);
            await _context.SaveChangesAsync();

            return Ok(cita);
        }
    }
}