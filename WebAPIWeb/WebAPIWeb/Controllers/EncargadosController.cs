using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPIWeb.Models;

namespace WebAPIWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EncargadosController : ControllerBase
    {
        private readonly ContextBD _context;

        public EncargadosController(ContextBD context)
        {
            _context = context;
        }

        // GET: api/Encargados
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Usuario>>> Get()
        {
            return await _context.Usuario.ToListAsync();
        }

        // GET: api/Encargados/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Usuario>> Get(int id)
        {
            var usuario = await _context.Usuario.FindAsync(id);
            if (usuario == null) return NotFound();
            return Ok(usuario);
        }

        // POST: api/Encargados
        [HttpPost]
        public async Task<ActionResult<Usuario>> Post(Usuario usuario)
        {
            if (!string.IsNullOrEmpty(usuario.Username) && _context.Usuario.Any(u => u.Username == usuario.Username))
                return BadRequest("El usuario ya existe");

            _context.Usuario.Add(usuario);
            await _context.SaveChangesAsync();
            return Ok(usuario);
        }

        // PUT: api/Encargados/5
        [HttpPut("{id}")]
        public async Task<ActionResult<Usuario>> Put(int id, [FromBody] Usuario usuario)
        {
            var existing = await _context.Usuario.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Nombre = usuario.Nombre;
            existing.Telefono = usuario.Telefono;
            existing.Rol = usuario.Rol;
            existing.Username = usuario.Username;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        // DELETE: api/Encargados/5
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var usuario = await _context.Usuario.FindAsync(id);
            if (usuario == null) return NotFound();

            _context.Usuario.Remove(usuario);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
