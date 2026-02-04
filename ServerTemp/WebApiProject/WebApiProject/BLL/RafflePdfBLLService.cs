using QuestPDF.Fluent;
using QuestPDF.Helpers;
using Microsoft.EntityFrameworkCore;
using WebApiProject.DAL.Interfaces;

namespace WebApiProject.BLL
{
    public class RafflePdfBLLService
    {
        private readonly IGiftDAL giftDal;
        private readonly ILogger<RafflePdfBLLService> logger;

        public RafflePdfBLLService(IGiftDAL giftDal, ILogger<RafflePdfBLLService> logger)
        {
            this.giftDal = giftDal;
            this.logger = logger;
        }

        public async Task<byte[]> GenerateWinnersPdfAsync()
        {
            try
            {
                // 🔹 מביא את כל המתנות שהוגרלו כולל רכישות והמשתמשים
                var raffledGifts = await giftDal.Query()
                    .Include(g => g.Shoppings)
                        .ThenInclude(s => s.User)
                    .Where(g => g.IsRaffled)
                    .ToListAsync();

                if (!raffledGifts.Any())
                    throw new InvalidOperationException("No raffled gifts found.");

                var pdfBytes = Document.Create(container =>
                {
                    container.Page(page =>
                    {
                        page.Margin(20);
                        page.Size(PageSizes.A4);
                        page.PageColor(Colors.White);
                        page.DefaultTextStyle(x => x.FontSize(12));

                        page.Header()
                            .Text("Raffle Winners Report")
                            .SemiBold().FontSize(20).FontColor(Colors.Blue.Medium);

                        page.Content()
                            .Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn(1); // Gift ID
                                    columns.RelativeColumn(3); // Gift Name
                                    columns.RelativeColumn(3); // Winner Name
                                    columns.RelativeColumn(4); // Winner Email
                                });

                                // Header
                                table.Header(header =>
                                {
                                    header.Cell().Text("Gift ID").Bold();
                                    header.Cell().Text("Gift Name").Bold();
                                    header.Cell().Text("Winner Name").Bold();
                                    header.Cell().Text("Winner Email").Bold();
                                });

                                foreach (var gift in raffledGifts)
                                {
                                    // 🔹 לוקח את המשתמש שהוגרל (נניח רק הראשון ברשימת Shoppings)
                                    var winner = gift.Shoppings.FirstOrDefault()?.User;

                                    table.Cell().Text(gift.Id.ToString());
                                    table.Cell().Text(gift.Name);

                                    // לא יכול להיות null כעת בגלל Include
                                    table.Cell().Text(winner?.UserName ?? "Unknown");
                                    table.Cell().Text(winner?.Email ?? "Unknown");
                                }
                            });

                        page.Footer()
                            .AlignCenter()
                            .Text($"Generated on {DateTime.Now:yyyy-MM-dd HH:mm}");
                    });
                }).GeneratePdf();

                return pdfBytes;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to generate PDF");
                throw new InvalidOperationException("Failed to generate PDF", ex);
            }
        }
    }
}
