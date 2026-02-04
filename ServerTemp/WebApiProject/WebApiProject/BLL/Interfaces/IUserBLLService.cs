using WebApiProject.Models.DTO;
using WebApiProject.Models;

namespace WebApiProject.BLL.Interfaces
{
    public interface IUserBLLService
    {
        Task<List<User>> Get();
        Task<User?> GetById(int id);
        Task Add(UserDTO userDTO);
        Task<bool> Put(int id, UserDTO userDTO);
        Task<bool> Delete(int id);
        Task<User?> ValidateUser(string email, string password);
    }
}
