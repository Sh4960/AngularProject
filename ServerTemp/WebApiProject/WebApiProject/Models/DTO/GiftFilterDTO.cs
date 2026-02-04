namespace WebApiProject.Models.DTO
{
    public class GiftFilterDTO
    {
        public string? GiftName { get; set; }
        public string? DonorName { get; set; }
        public string? Category { get; set; }

        // מיון
        public GiftSortBy? SortBy { get; set; }
        public bool Desc { get; set; } = false;
    }

    public enum GiftSortBy
    {
        Price,
        PurchasesCount
    }

}
