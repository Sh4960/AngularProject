using System.ComponentModel.DataAnnotations;

namespace WebApiProject.Models.DTO
{
    public class LoginRequestDTO
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
}
