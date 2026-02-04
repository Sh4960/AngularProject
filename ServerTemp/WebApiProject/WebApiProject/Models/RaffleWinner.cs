namespace WebApiProject.Models
{
    public class RaffleWinner
    {
        public int Id { get; set; }

        public int GiftId { get; set; }
        public Gift Gift { get; set; } = null!;

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public DateTime RaffleDate { get; set; }
    }

}
