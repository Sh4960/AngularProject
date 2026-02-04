using Microsoft.EntityFrameworkCore;
using WebApiProject.DAL.Interfaces;
using WebApiProject.Data;
using WebApiProject.Models;

namespace WebApiProject.DAL
{
    public class ShoppingDAL : IShoppingDAL
    {
        private readonly AppDbContext appDbContext;

        public ShoppingDAL(AppDbContext appDbContext)
        {
            this.appDbContext = appDbContext;
        }

        public async Task<List<Shopping>> Get()
        {
            return await appDbContext.Shoppings.Include(s => s.User).Include(s => s.Gift).ToListAsync();
        }
        public IQueryable<Shopping> Query()
        {
            return appDbContext.Shoppings
                .Include(s => s.Gift)
                .Include(s => s.User)
                .AsQueryable();
        }


        public async Task<List<Shopping>> GetGiftById(int id)
        {
            return await appDbContext.Shoppings.Include(s => s.User).Include(s => s.Gift).Where(s => s.GiftId == id && !s.IsDraft)
        .ToListAsync();
        }
        public async Task<Shopping?> GetById(int id)
        {
            return await appDbContext.Shoppings.Include(s => s.User).Include(s => s.Gift).FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task Add(Shopping shopping)
        {
            await appDbContext.Shoppings.AddAsync(shopping);
            await appDbContext.SaveChangesAsync();
        }

        public async Task Put(Shopping shopping)
        {
            appDbContext.Shoppings.Update(shopping);
            await appDbContext.SaveChangesAsync();
        }

        public async Task<bool> Delete(int id)
        {
            // בדיקה אם הרכישה קיימת
            var shopping = await GetById(id);
            if (shopping == null)
                return false;

            appDbContext.Shoppings.Remove(shopping);
            await appDbContext.SaveChangesAsync();
            return true;
        }
    }
}