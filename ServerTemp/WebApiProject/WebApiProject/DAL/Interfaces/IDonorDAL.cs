using WebApiProject.Models;

namespace WebApiProject.DAL.Interfaces
{
    public interface IDonorDAL
    {
        Task<List<Donor>> Get();
        public IQueryable<Donor> Query();
        Task<Donor?> GetById(int id);
        Task Add(Donor donor);
        Task Put(Donor donor);
        Task<bool> Delete(int id);
    }
}
