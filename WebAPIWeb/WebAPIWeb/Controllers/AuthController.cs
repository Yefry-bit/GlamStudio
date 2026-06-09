using Microsoft.AspNetCore.Mvc;
using WebAPIWeb.Models;
using WebAPIWeb.Services;
using System.Linq;

namespace WebAPIWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly JwtService _jwt;
        private readonly ContextBD _context;

        public AuthController(JwtService jwt, ContextBD context)
        {
            _jwt = jwt;
            _context = context;
        }

        // Endpoint para Registrar nuevos usuarios
        [HttpPost("register")]
        public IActionResult Register(Usuario usuario)
        {
            if (!string.IsNullOrEmpty(usuario.Username) && _context.Usuario.Any(u => u.Username == usuario.Username))
    return BadRequest("El usuario ya existe");

            _context.Usuario.Add(usuario);
            _context.SaveChanges();

            return Ok("Usuario registrado exitosamente");
        }

        // Endpoint para Loguearse y recibir el Token
        [HttpPost("login")]
        public IActionResult Login(Usuario login)
        {
            // Busca al usuario en la base de datos real
            var user = _context.Usuario.FirstOrDefault(u => u.Username == login.Username && u.Password == login.Password);

            if (user != null)
            {
                var token = _jwt.GenerateToken(user.Username);
                return Ok(new { token });
            }

            return Unauthorized("Credenciales inválidas");
        }
    }
}