using System.ComponentModel.DataAnnotations;

namespace WebApiProject.Models.DTO
{
    public class ShoppingDTO
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "UserId is required")]
        [Range(1, int.MaxValue, ErrorMessage = "UserId must be a positive number")]
        public int UserId { get; set; }

        [Required(ErrorMessage = "GiftId is required")]
        [Range(1, int.MaxValue, ErrorMessage = "GiftId must be a positive number")]
        public int GiftId { get; set; }
        public int Quantity { get; set; } = 1;
        public string UserName { get; set; } // להוסיף עבור פרטי רוכש
        public string Email { get; set; } // להוסיף עבור פרטי מתנה
        public string Phone { get; set; } // כדי לראות את המחיר במיון

        //אם רוצים שלכל מתנה יהיה את רשימת הקניות שלה עם פרטי המשתמשים
        //public string UserName { get; set; } = null!;
        //public string UserEmail { get; set; } = null!;
        //public string UserPhone { get; set; } = null!;
    }
}