namespace WebApiProject.Models.DTO
{
    public class RaffleResultDTO
    {
        public int GiftId { get; set; }
        public string GiftName { get; set; } = null!;
        public int WinnerUserId { get; set; }
        public string WinnerUserName { get; set; } = null!;
        public string WinnerEmail { get; set; } = null!;
    }
}