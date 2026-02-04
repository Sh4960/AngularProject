using System.ComponentModel.DataAnnotations;

namespace WebApiProject.Models.DTO
{
    public class DonorDTO
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Donor name is required")]
        [RegularExpression(@"^[a-zA-Zא-ת ]+$", ErrorMessage = "Gift name must contain letters only")]
        public string Name { get; set; } = null!;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email address format")]
        public string Email { get; set; } = null!;

        [RegularExpression(@"^05\d{8}$", ErrorMessage = "Phone number must be a valid Israeli mobile number (10 digits, starts with 05)")]
        public string Phone { get; set; } = null!;

        //public List<GiftDTO> Gifts { get; set; } = new();
        //המורה רוצה שכן יראו לכל תורם את רשימת המתנות שלו
    }
}
