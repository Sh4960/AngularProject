using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApiProject.BLL.Interfaces;
using WebApiProject.Models.DTO;

namespace WebApiProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]//א''א לעשות כלום בלי לוגין

    public class ShoppingController : ControllerBase
    {
        private readonly IShoppingBLLService shoppingBLL;
        private readonly IUserBLLService userBLL;
        private readonly IGiftBLLService giftBLL;

        public ShoppingController(IShoppingBLLService shoppingBLL, IUserBLLService userBLL, IGiftBLLService giftBLL)
        {
            this.shoppingBLL = shoppingBLL;
            this.userBLL = userBLL;
            this.giftBLL = giftBLL;
        }
        [HttpGet]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> Get()
        {
            try
            {
                return Ok(await shoppingBLL.Get());
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpGet("sorted")]
        [Authorize(Roles = "Manager")]

        public async Task<IActionResult> GetSorted([FromQuery] ShoppingSortDTO sort)
        {
            try
            {
                var result = await shoppingBLL.GetSorted(sort);
                return Ok(result);
            }
              catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> Get(int id)
        {
            try
            { 
                if (id <= 0)
                    return BadRequest("Invalid id");

                var shopping = await shoppingBLL.GetById(id);
                if (shopping == null)
                    return NotFound($"Shopping with id {id} does not exist.");

                return Ok(shopping);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        //[HttpGet("{id}")]
        //[Authorize(Roles = "Manager")]
        //public async Task<IActionResult> GetGiftById(int id)
        //{
        //    var shopping = await shoppingBLL.GetGiftById(id);
        //    if (shopping == null)
        //        return NotFound($"Shopping with id {id} does not exist.");

        //    return Ok(shopping);
        //}

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ShoppingCreateDTO createDTO)
        {
            try
            {
                var user = await userBLL.GetById(createDTO.UserId);
                if (user == null) return NotFound($"User with id {createDTO.UserId} does not exist.");

                var gift = await giftBLL.GetById(createDTO.GiftId);
                if (gift == null) return NotFound($"Gift with id {createDTO.GiftId} does not exist.");

                var shoppingDTO = new ShoppingDTO
                {
                    UserId = createDTO.UserId,
                    GiftId = createDTO.GiftId,
                    Quantity = createDTO.Quantity,

                    // ✅ ממלא פרטי משתמש כאן כדי שלא יווצר null ב-BLL
                    UserName = user.UserName,
                    Email = user.Email,
                    Phone = user.Phone
                };

                await shoppingBLL.Add(shoppingDTO);

                // ✅ עכשיו shoppingDTO.Id יתעדכן אחרי השמירה ב-DB
                return Ok("Shopping created successfully.");
            }
            
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        //[HttpPost]
        //public async Task<IActionResult> Post([FromBody] ShoppingCreateDTO createDTO)
        //{
        //    var user = await userBLL.GetById(createDTO.UserId);
        //    if (user == null) return NotFound($"User with id {createDTO.UserId} does not exist.");

        //    var gift = await giftBLL.GetById(createDTO.GiftId);
        //    if (gift == null) return NotFound($"Gift with id {createDTO.GiftId} does not exist.");

        //    var shoppingDTO = new ShoppingDTO
        //    {
        //        UserId = createDTO.UserId,
        //        GiftId = createDTO.GiftId,
        //        Quantity = createDTO.Quantity
        //    };

        //    await shoppingBLL.Add(shoppingDTO);

        //    var savedShopping = await shoppingBLL.GetById(shoppingDTO.Id);
        //    return Ok(savedShopping);
        //}


        //[HttpPost]
        //public async Task<IActionResult> Post([FromBody] ShoppingDTO shoppingDTO)
        //{
        //    var user = await userBLL.GetById(shoppingDTO.UserId);
        //    if (user == null)
        //        return NotFound($"User with id {shoppingDTO.UserId} does not exist.");

        //    var gift = await giftBLL.GetById(shoppingDTO.GiftId);
        //    if (gift == null)
        //        return NotFound($"Gift with id {shoppingDTO.GiftId} does not exist.");

        //    await shoppingBLL.Add(shoppingDTO);
        //    return Ok("Shopping added successfully.");
        //}

        //[HttpPut("{id}")]
        //public async Task<IActionResult> Put(int id, [FromBody] ShoppingDTO shoppingDTO)
        //{
        //    if (id <= 0)
        //        return BadRequest("Invalid id");

        //    var updated = await shoppingBLL.Put(id, shoppingDTO);
        //    if (!updated)
        //        return BadRequest("Cannot update confirmed shopping or gift does not exist.");

        //    return Ok("Shopping updated successfully.");
        //}

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] ShoppingDTO shoppingDTO)
        {
            //var checks = await Task.WhenAll(
            //    shoppingBLL.GetById(id),
            //    userBLL.GetById(shoppingDTO.UserId),
            //    giftBLL.GetById(shoppingDTO.GiftId)
            //);

            //if (checks[0] == null) return NotFound($"Shopping with id {id} does not exist.");
            //if (checks[1] == null) return NotFound($"User with id {shoppingDTO.UserId} does not exist.");
            //if (checks[2] == null) return NotFound($"Gift with id {shoppingDTO.GiftId} does not exist.");
            ////כך חוסכים קריאות מסודרות ומקבילות ב-DB.

            try
            {
                if (id <= 0)
                    return BadRequest("Invalid id");

                var exists = await shoppingBLL.GetById(id);
                if (exists == null)
                    return NotFound($"Shopping with id {id} does not exist.");

                var user = await userBLL.GetById(shoppingDTO.UserId);
                if (user == null)
                    return NotFound($"User with id {shoppingDTO.UserId} does not exist.");

                var gift = await giftBLL.GetById(shoppingDTO.GiftId);
                if (gift == null)
                    return NotFound($"Gift with id {shoppingDTO.GiftId} does not exist.");

                var updated = await shoppingBLL.Put(id, shoppingDTO);
                if (!updated)
                    return BadRequest("Cannot update confirmed shopping.");

                return Ok("Shopping updated successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest("Invalid id");

                var exists = await shoppingBLL.GetById(id);
                if (exists == null)
                    return NotFound($"Shopping with id {id} does not exist.");

                var deleted = await shoppingBLL.Delete(id);
                if (!deleted)
                    return BadRequest("Cannot delete confirmed shopping.");

                return Ok("Shopping deleted successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }



        //[HttpDelete("{id}")]
        //public async Task<IActionResult> Delete(int id)
        //{
        //    if (id <= 0)
        //        return BadRequest("Invalid id");

        //    var deleted = await shoppingBLL.Delete(id);
        //    if (!deleted)
        //        return BadRequest("Cannot delete confirmed shopping or shopping does not exist.");

        //    return Ok("Shopping deleted successfully.");
        //}


        //[HttpPut("{id}")]
        //public IActionResult Put(int id, [FromBody] ShoppingDTO shoppingDTO)
        //{
        //      if (id <= 0)
        //           return BadRequest("Invalid id");
        //    var updated = shoppingBLL.Put(id, shoppingDTO);
        //    if (!updated)
        //        return BadRequest("Cannot update confirmed shopping.");

        //    return Ok();
        //}

        [HttpPost("{id}/confirm")]
        public async Task<IActionResult> ConfirmShopping(int id)
        {
            if (id <= 0)
                return BadRequest("Invalid id");

            try
            {
                var confirmed = await shoppingBLL.ConfirmShopping(id);
                if (!confirmed)
                    return BadRequest("Shopping could not be confirmed for unknown reason.");

                return Ok("Shopping confirmed successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message); 
            }
        }

        //[HttpDelete("{id}")]
        //public IActionResult Delete(int id)
        //{
        //      if (id <= 0)
        //           return BadRequest("Invalid id");
        //    var deleted = shoppingBLL.Delete(id);
        //    if (!deleted)
        //        return BadRequest("Cannot delete confirmed shopping.");

        //    return Ok();
        //}
    }


}