using Microsoft.EntityFrameworkCore;
using WebApiProject.DAL.Interfaces;
using WebApiProject.Data;
using WebApiProject.Models;

namespace WebApiProject.DAL
{
    public class UserDAL : IUserDAL
    {
        private readonly AppDbContext appDbContext;

        public UserDAL(AppDbContext appDbContext)
        {
            this.appDbContext = appDbContext;
        }

        public async Task<List<User>> Get()
        {
            return await appDbContext.Users.ToListAsync();
        }

        public async Task<User?> GetById(int id)
        {
            return await appDbContext.Users.FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task Add(User user)
        {
            appDbContext.Users.Add(user);
            await appDbContext.SaveChangesAsync();
        }

        public async Task Put(User user)
        {
            appDbContext.Users.Update(user);
            await appDbContext.SaveChangesAsync();
        }

        public async Task<bool> Delete(int id)
        {
            var user = await GetById(id);
            if (user == null || user.Shoppings.Any())
                return false;

            appDbContext.Users.Remove(user);
            await appDbContext.SaveChangesAsync();
            return true;
        }

        public async Task<bool> EmailExists(string email)
        {
            return await appDbContext.Users.AnyAsync(u => u.Email == email);
        }
    }
}
