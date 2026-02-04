namespace WebApiProject.Models
{
    public class Shopping
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public int GiftId { get; set; }
        public Gift Gift { get; set; } = null!;
        public bool IsDraft { get; set; } = true;
        public int Quantity { get; set; } = 1;

    }
}
