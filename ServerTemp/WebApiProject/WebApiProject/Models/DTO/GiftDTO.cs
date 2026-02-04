using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace WebApiProject.Models.DTO
{
    public class GiftDTO
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Gift name is required")]
        [RegularExpression(@"^[a-zA-Zא-ת ]+$", ErrorMessage = "Gift name must contain letters only")]
        //[SwaggerSchema(Description = "Gift name (example: Gift name)")]
        public string Name { get; set; }

        //[Required(ErrorMessage = "Category is required")]
        public string Category { get; set; }

        [Range(1, 100, ErrorMessage = "Card price must be a positive number and less then 100")]
        [Required(ErrorMessage = "Card price is required")]
        public int CardPrice { get; set; }

        public int DonorId { get; set; }

        [RegularExpression(@"^[a-zA-Zא-ת ]+$", ErrorMessage = "Donor name must contain letters only")]
        public string  DonorName { get; set; }

        public List<ShoppingDTO> Shoppings { get; set; } = new();

        [DefaultValue(false)]
        public bool IsRaffled { get; set; } = false;

    }
}
