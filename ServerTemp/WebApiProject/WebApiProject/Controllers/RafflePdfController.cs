using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApiProject.BLL;

namespace WebApiProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]//א''א לעשות כלום בלי לוגין
    [Authorize(Roles = "Manager")]

    public class RafflePdfController : ControllerBase
    {
        private readonly RafflePdfBLLService rafflePdfService;
        private readonly ILogger<RafflePdfController> logger;

        public RafflePdfController(RafflePdfBLLService rafflePdfService, ILogger<RafflePdfController> logger)
        {
            this.rafflePdfService = rafflePdfService;
            this.logger = logger;
        }

        [HttpGet("winners")]
        public async Task<IActionResult> GetRaffleWinnersPdf()
        {
            try
            {
                var pdfBytes = await rafflePdfService.GenerateWinnersPdfAsync();

                // מחזיר קובץ PDF
                return File(pdfBytes, "application/pdf", $"RaffleWinners_{DateTime.Now:yyyyMMdd_HHmm}.pdf");
            }
            catch (InvalidOperationException ex)
            {
                // אין זוכים או בעיה ידועה
                logger.LogWarning(ex, "No raffled gifts or failed to generate PDF");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                // כל שגיאה אחרת
                logger.LogError(ex, "Unexpected error while generating raffle PDF");
                return StatusCode(500, new { message = "Failed to generate PDF", details = ex.Message });
            }
        }
    }
}
