using WebApiProject.Models;

namespace WebApiProject.DAL.Interfaces
{
    public interface IGiftDAL
    {
        Task<List<Gift>> Get();
        IQueryable<Gift> Query();
        Task<Gift?> GetById(int id);
        Task Add(Gift gift);
        Task Put(Gift gift);
        Task<bool> Delete(int id);
    }
}
