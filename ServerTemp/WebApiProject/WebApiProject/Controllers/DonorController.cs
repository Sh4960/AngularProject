using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApiProject.BLL.Interfaces;
using WebApiProject.Models.DTO;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Manager")]
public class DonorController : ControllerBase
{
    private readonly IDonorBLLService donorBLL;

    public DonorController(IDonorBLLService donorBLL)
    {
        this.donorBLL = donorBLL;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        try
        {
            return Ok(await donorBLL.Get());
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("filter")]
    public async Task<IActionResult> GetFiltered([FromQuery] DonorFilterDTO filter)
    {
        try
        {
            var result = await donorBLL.GetFiltered(filter);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        try
        {
            if (id <= 0)
                return BadRequest("Invalid id");

            var donor = await donorBLL.GetById(id);
            if (donor == null)
                return NotFound($"Donor with id {id} does not exist.");

            return Ok(donor);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] DonorDTO donorDTO)
    {
        try
        {
            await donorBLL.Add(donorDTO);
            return Ok("Donor added successfully.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, [FromBody] DonorDTO donorDTO)
    {
        try
        {
            if (id <= 0)
                return BadRequest("Invalid id");

            var updated = await donorBLL.Put(id, donorDTO);
            if (!updated)
                return NotFound($"Donor with id {id} does not exist.");

            return Ok("Donor updated successfully.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            if (id <= 0)
                return BadRequest("Invalid id");

            var deleted = await donorBLL.Delete(id);
            if (!deleted)
                return BadRequest("Cannot delete donor with gifts or donor not found.");

            return Ok("Donor deleted successfully.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

    }
}