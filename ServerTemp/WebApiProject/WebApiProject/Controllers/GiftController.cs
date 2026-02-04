using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApiProject.BLL.Interfaces;
using WebApiProject.Models.DTO;

namespace WebApiProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]//א''א לעשות כלום בלי לוגין

    public class GiftController : ControllerBase
    {
        private readonly IGiftBLLService giftBLL;
        private readonly IDonorBLLService donorBLL;
        private readonly IShoppingBLLService shoppingBLL;

        public GiftController(IGiftBLLService giftBLL, IDonorBLLService donorBLL, IShoppingBLLService shoppingBLL)
        {
            this.giftBLL = giftBLL;
            this.donorBLL = donorBLL;
            this.shoppingBLL = shoppingBLL;
        }

        // GET: api/gift
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                return Ok(await giftBLL.Get());
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("filter")]
        public async Task<IActionResult> GetFiltered([FromQuery] GiftFilterDTO filter)
        {
            try
            {
                var result = await giftBLL.GetFiltered(filter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET: api/gift/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest("Invalid id");

                var gift = await giftBLL.GetById(id);
                if (gift == null)
                    return NotFound($"Gift with id {id} does not exist.");

                return Ok(gift);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // POST: api/gift
        [HttpPost]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> Post([FromBody] GiftDTO giftDTO)
        {
            try
            {
                DonorDTO? donor = await donorBLL.GetById(giftDTO.DonorId);
                if (donor == null)
                    return NotFound($"Donor with id {giftDTO.DonorId} does not exist.");

                if (donor.Name != giftDTO.DonorName)
                    return NotFound($"Donor with name {giftDTO.DonorName} not match to donorId.");

                await giftBLL.Add(giftDTO);
                return Ok("Gift added successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/gift/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> Put(int id, [FromBody] GiftDTO giftDTO)
        {
            try
            {
                if (id <= 0)
                    return BadRequest("Invalid id");

                var existing = await giftBLL.GetById(id);
                if (existing == null)
                    return NotFound($"Gift with id {id} does not exist.");

                var donor = await donorBLL.GetById(giftDTO.DonorId);
                if (donor == null)
                    return NotFound($"Donor with id {giftDTO.DonorId} does not exist.");

                if (donor.Name != giftDTO.DonorName)
                    return NotFound($"Donor with name {giftDTO.DonorName} not match to donorId.");

                var updated = await giftBLL.Put(id, giftDTO);
                if (!updated)
                    return BadRequest("Failed to update gift.");

                return Ok("Gift updated successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // DELETE: api/gift/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest("Invalid id");

                var existing = await giftBLL.GetById(id);
                if (existing == null)
                    return NotFound($"Gift with id {id} does not exist.");

                if (await shoppingBLL.HasNonDraftShoppingsForGift(id))
                    return BadRequest("Cannot delete gift that has already been shopped.");

                var deleted = await giftBLL.Delete(id);
                if (!deleted)
                    return BadRequest("Failed to delete gift.");

                return Ok("Gift deleted successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }

        // POST: api/gift/{id}/raffle  - pick winner for specific gift
        [HttpPost("{id}/raffle")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> RaffleGift(int id)
        {
            try
            {
                var result = await giftBLL.RaffleGift(id);
                if (result == null)
                    return BadRequest("No confirmed shoppings available for raffle or gift not found.");
                //send email to winner could be added here
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // POST: api/gift/raffleAll  - raffle all gifts and return report
        [HttpPost("raffleAll")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> RaffleAll()
        {
            try
            {
                var report = await giftBLL.RaffleAll();
                return Ok(report);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}



//public IActionResult Put(int id, [FromBody] GiftDTO giftDTO)
//{
//    DonorDTO donor = donorBLL.GetById(giftDTO.DonorId);
//    if (donor == null)
//    {
//        return NotFound($"Donor with id {id} does not exist.");
//    }
//    var updated = giftBLL.Put(id, giftDTO);
//    if (!updated)
//        return NotFound($"Gift with id {id} does not exist.");

//    return Ok();
//}

//[HttpDelete("{id}")]
//public IActionResult Delete(int id)
//{
//    var deleted = giftBLL.Delete(id);
//    if (!deleted)
//        return NotFound($"Gift with id {id} does not exist.");

// //   return BadRequest("Cannot delete gift that is used in shopping.");

//    return Ok();
//}