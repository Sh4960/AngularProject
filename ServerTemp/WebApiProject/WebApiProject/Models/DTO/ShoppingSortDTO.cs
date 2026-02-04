namespace WebApiProject.Models.DTO
{
    public class ShoppingSortDTO
    {
        public ShoppingSortBy? SortBy { get; set; }
        public bool Desc { get; set; } = true; // כברירת מחדל לפי יורד
    }

    public enum ShoppingSortBy
    {
        Price,       // מתנה היקרה ביותר
        Popularity   // המתנה הנרכשת ביותר
    }

}
