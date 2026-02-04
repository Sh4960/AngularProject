using Microsoft.AspNetCore.Mvc;
using WebApiProject.Models;
using WebApiProject.Models.DTO;

namespace WebApiProject.DAL.Interfaces
{
    public interface IShoppingDAL
    {
        Task<List<Shopping>> Get();
        IQueryable<Shopping> Query();
        Task<List<Shopping>> GetGiftById(int id);
        Task<Shopping?> GetById(int id);
        Task Add(Shopping shopping);
        Task Put(Shopping shopping);
        Task<bool> Delete(int id);
    }
}
