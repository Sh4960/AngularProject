using WebApiProject.Data;
using WebApiProject.Models;
using WebApiProject.DAL.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace WebApiProject.DAL
{
    public class GiftDAL : IGiftDAL
    {
        private readonly AppDbContext appDbContext;

        public GiftDAL(AppDbContext appDbContext)
        {
            this.appDbContext = appDbContext;
        }

        public async Task<List<Gift>> Get()
        {
            return await appDbContext.Gifts.Include(g => g.Donor).Include(g => g.Shoppings).ToListAsync();
        }
        public IQueryable<Gift> Query()
        {
            return appDbContext.Gifts.Include(g => g.Donor).Include(g => g.Shoppings).AsQueryable();
        }

        public async Task<Gift?> GetById(int id)
        {
            return await appDbContext.Gifts.Include(g => g.Donor).Include(g => g.Shoppings).
                ThenInclude(s => s.User).FirstOrDefaultAsync(g => g.Id == id);
        }

        public async Task Add(Gift gift)
        {
            await appDbContext.Gifts.AddAsync(gift);
            await appDbContext.SaveChangesAsync();
        }

        public async Task Put(Gift gift)
        {
            appDbContext.Gifts.Update(gift);
            await appDbContext.SaveChangesAsync();
        }

        public async Task<bool> Delete(int id)
        {
            var gift = await GetById(id);
            if (gift == null)
                return false;

            // ❌ אסור למחוק מתנה שכבר בשופינג
            if (gift.Shoppings.Any())
                return false;

            appDbContext.Gifts.Remove(gift);
            await appDbContext.SaveChangesAsync();
            return true;
        }
    }
}