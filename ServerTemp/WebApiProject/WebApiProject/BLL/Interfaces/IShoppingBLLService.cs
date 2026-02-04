using WebApiProject.Models.DTO;

namespace WebApiProject.BLL.Interfaces
{
    public interface IShoppingBLLService
    {
        Task<List<ShoppingDTO>> Get();
        Task<List<ShoppingDTO>> GetSorted(ShoppingSortDTO sort);
        Task<List<ShoppingDTO?>> GetGiftById(int id);
        Task<ShoppingDTO?> GetById(int id);
        Task Add(ShoppingDTO shoppingDTO);
        //בודקת אם קיימות רכישות שאינן טיוטה
        Task<bool> HasNonDraftShoppingsForGift(int giftId);
        Task<bool> Put(int id, ShoppingDTO shoppingDTO);
        Task<bool> Delete(int id);
        Task<bool> ConfirmShopping(int id);
    }
}
