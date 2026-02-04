using WebApiProject.Models;
using WebApiProject.Models.DTO;

namespace WebApiProject.BLL.Interfaces
{
    public interface IDonorBLLService
    {
        Task<List<DonorDTO>> Get();
        Task<List<DonorDTO>> GetFiltered(DonorFilterDTO filter);
        Task<DonorDTO?> GetById(int id);
        Task Add(DonorDTO donorDTO);
        Task<bool> Put(int id, DonorDTO donorDTO);
        Task<bool> Delete(int id);
    }
}
