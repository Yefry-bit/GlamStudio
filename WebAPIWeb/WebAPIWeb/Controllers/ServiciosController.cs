using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPIWeb.Models;

namespace WebAPIWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServiciosController : ControllerBase
    {
        private readonly ContextBD _context;

        public ServiciosController(ContextBD context)
        {
            _context = context;
        }

        // GET: api/Servicios
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Servicio>>> Get()
        {
            return await _context.Servicio.ToListAsync();
        }

        // POST: api/Servicios
        [HttpPost]
        public async Task<ActionResult<Servicio>> Post(Servicio servicio)
        {
            _context.Servicio.Add(servicio);
            await _context.SaveChangesAsync();
            return Ok(servicio);
        }

        // PUT: api/Servicios/5
        [HttpPut("{id}")]
        public async Task<ActionResult<Servicio>> Put(int id, [FromBody] Servicio servicio)
        {
            var existing = await _context.Servicio.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Nombre = servicio.Nombre;
            existing.Precio = servicio.Precio;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        // DELETE: api/Servicios/5
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var servicio = await _context.Servicio.FindAsync(id);
            if (servicio == null) return NotFound();

            _context.Servicio.Remove(servicio);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
