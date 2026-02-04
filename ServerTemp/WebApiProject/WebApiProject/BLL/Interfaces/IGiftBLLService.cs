using WebApiProject.Models.DTO;
using WebApiProject.Models;

namespace WebApiProject.BLL.Interfaces
{
    public interface IGiftBLLService
    {
        Task<List<GiftGetDTO>> Get();
        Task<List<GiftGetDTO>> GetFiltered(GiftFilterDTO filter);
        Task<GiftGetDTO?> GetById(int id);
        Task Add(GiftDTO giftDTO);
        Task<bool> Put(int id, GiftDTO giftDTO);
        Task<bool> Delete(int id);

        // Raffle operations
        Task<RaffleResultDTO?> RaffleGift(int giftId);
        Task<List<RaffleResultDTO>> RaffleAll();

    }
}
