using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace WebApiProject.Models.DTO
{
    public class ShoppingCreateDTO
    {
        [Required(ErrorMessage = "UserId is required")]
        [Range(1, int.MaxValue, ErrorMessage = "UserId must be a positive number")]
        public int UserId { get; set; }

        [Required(ErrorMessage = "GiftId is required")]
        [Range(1, int.MaxValue, ErrorMessage = "GiftId must be a positive number")]
        public int GiftId { get; set; }

        [DefaultValue(1)]
        public int Quantity { get; set; } = 1;

    }
}
