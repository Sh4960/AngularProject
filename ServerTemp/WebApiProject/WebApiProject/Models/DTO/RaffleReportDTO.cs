using System.Collections.Generic;

namespace WebApiProject.Models.DTO
{
    public class RaffleReportDTO
    {
        public List<RaffleResultDTO> Results { get; set; } = new();
        public int TotalIncome { get; set; }
    }
}
