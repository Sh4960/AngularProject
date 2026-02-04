using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApiProject.BLL.Interfaces;
using WebApiProject.DAL;
using WebApiProject.Models.DTO;

namespace WebApiProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserBLLService userBLL;

        public UserController(IUserBLLService userBLL)
        {
            this.userBLL = userBLL;
        }

        [HttpGet]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> Get()
        {
            try
            {
                return Ok(await userBLL.Get());
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
                var user = await userBLL.GetById(id);
                if (user == null)
                    return NotFound($"User with id {id} does not exist.");

                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Post(UserDTO userDTO)
        {
            try
            {
                await userBLL.Add(userDTO);
                return Ok();
            }
            catch (InvalidOperationException ex)
            {
                // שמירה על BadRequest אם מייל כבר קיים
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Put(int id, UserDTO userDTO)
        {
            try
            {
                var updated = await userBLL.Put(id, userDTO);
                if (!updated)
                    return NotFound($"User with id {id} does not exist.");

                return Ok();
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
                var deleted = await userBLL.Delete(id);
                if (!deleted)
                    return BadRequest("Cannot delete user with shoppings or user not found.");

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
