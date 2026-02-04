using WebApiProject.DAL.Interfaces;
using WebApiProject.Data;
using WebApiProject.Models;
using Microsoft.EntityFrameworkCore;

namespace WebApiProject.DAL
{
    public class DonorDAL : IDonorDAL
    {
        private readonly AppDbContext appDbContext;

        public DonorDAL(AppDbContext appDbContext)
        {
            this.appDbContext = appDbContext;
        }

        public async Task<List<Donor>> Get()
        {
            return await appDbContext.Donors
                .Include(d => d.Gifts)
                .ToListAsync();
        }
        public IQueryable<Donor> Query()
        {
            return appDbContext.Donors
                .Include(d => d.Gifts)
                .AsQueryable();
        }
        public async Task<Donor?> GetById(int id)
        {
            return await appDbContext.Donors
                .Include(d => d.Gifts)
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task Add(Donor donor)
        {
            await appDbContext.Donors.AddAsync(donor);
            await appDbContext.SaveChangesAsync();
        }

        public async Task Put(Donor donor)
        {
            appDbContext.Donors.Update(donor);
            await appDbContext.SaveChangesAsync();
        }

        public async Task<bool> Delete(int id)
        {
            var donor = await GetById(id);
            if (donor == null)
                return false;

            // 🔒 אסור למחוק תורם עם מתנות
            if (donor.Gifts.Any())
                return false;

            appDbContext.Donors.Remove(donor);
            await appDbContext.SaveChangesAsync();
            return true;
        }
    }
}
