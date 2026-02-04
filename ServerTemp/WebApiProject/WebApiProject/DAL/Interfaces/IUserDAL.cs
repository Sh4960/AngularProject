using WebApiProject.Models;

namespace WebApiProject.DAL.Interfaces
{
    public interface IUserDAL
    {
        Task<List<User>> Get();
        Task<User?> GetById(int id);
        Task Add(User user);
        Task Put(User user);
        Task<bool> Delete(int id);
        Task<bool> EmailExists(string email);
    }
}
