using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WebApiProject.BLL.Interfaces;
using WebApiProject.Models;
using WebApiProject.Models.DTO;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserBLLService _userService;
    private readonly IConfiguration _config;

    public AuthController(IUserBLLService userService, IConfiguration config)
    {
        _userService = userService;
        _config = config;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDTO request)
    {
        try
        {
            var user = await _userService.ValidateUser(request.Email, request.Password);

            if (user == null)
                return Unauthorized("Email or password incorrect");

            var token = await GenerateJwtToken(user);

            return Ok(new { token });
        }
        catch (Exception ex)
        {
            // כל שגיאה בלתי צפויה מוחזרת למשתמש בצורה ברורה
            return BadRequest(ex.Message);
        }
    }

    private async Task<string> GenerateJwtToken(User user)
    {
        try
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.Role, user.Role.ToString()) // Manager / User
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Key"])
            );

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        catch (Exception ex)
        {
            // אם יש בעיה בהפקת הטוקן
            throw new Exception(ex.Message);
        }
    }

    //[HttpPost("login")]
    //public async Task<IActionResult> Login([FromBody] LoginRequestDTO request)
    //{
    //    var user = await _userService.ValidateUser(request.Email, request.Password);

    //    if (user == null)
    //        return Unauthorized("Email or password incorrect");

    //    var token = await GenerateJwtToken(user);

    //    return Ok(new { token });
    //}

    //private async Task<string> GenerateJwtToken(User user)
    //{
    //    var claims = new List<Claim>
    //    {
    //        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
    //        new Claim(ClaimTypes.Name, user.UserName),
    //        new Claim(ClaimTypes.Role, user.Role.ToString()) // Manager / User
    //    };

    //    var key = new SymmetricSecurityKey(
    //        Encoding.UTF8.GetBytes(_config["Jwt:Key"])
    //    );

    //    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    //    var token = new JwtSecurityToken(
    //        issuer: _config["Jwt:Issuer"],
    //        audience: _config["Jwt:Audience"],
    //        claims: claims,
    //        expires: DateTime.Now.AddHours(2),
    //        signingCredentials: creds
    //    );

    //    return new JwtSecurityTokenHandler().WriteToken(token);
    //}
}
