using System.ComponentModel.DataAnnotations;

namespace WebApiProject.Models.DTO
{
    public class UserDTO
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "User name is required")]
        [RegularExpression(@"^[a-zA-Zא-ת ]+$", ErrorMessage = "User name must contain letters only")]
        public string UserName { get; set; } = null!;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email address format")]
        //uniqe
        public string Email { get; set; } = null!;

        [Phone(ErrorMessage = "Invalid phone number")]// בודק שבכללי מדובר בפורמט תקין של טלפון (מאפשר מקפים, רווחים..
        [MinLength(10, ErrorMessage = "Phone number must be exactly 10 digits")]
        //אפשר גם ככה
        //[MinLength(10)]
        //[MaxLength(10)]
        public string Phone { get; set; } = null!;

        [Required]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$",
            ErrorMessage = "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number.")]
        public string Password { get; set; } = null!;
    }
}
