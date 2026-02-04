using AutoMapper;
using Microsoft.EntityFrameworkCore;
using WebApiProject.BLL.Interfaces;
using WebApiProject.DAL.Interfaces;
using WebApiProject.Models;
using WebApiProject.Models.DTO;

namespace WebApiProject.BLL
{
    public class ShoppingBLLService : IShoppingBLLService
    {
        private readonly IShoppingDAL shoppingDal;
        private readonly IMapper mapper;
        private readonly IGiftBLLService giftBLL;
        private readonly ILogger<ShoppingBLLService> logger;

        public ShoppingBLLService(IShoppingDAL shoppingDal, IMapper mapper, IGiftBLLService giftBLL, ILogger<ShoppingBLLService> logger)
        {
            this.shoppingDal = shoppingDal;
            this.mapper = mapper;
            this.logger = logger;
            this.giftBLL = giftBLL;
        }

        //public async Task<List<ShoppingDTO>> Get()
        //{
        //    try
        //    {
        //        logger.LogInformation("Fetching all shoppings");
        //        var shoppings = await shoppingDal.Get();
        //        return mapper.Map<List<ShoppingDTO>>(shoppings);
        //    }
        //    catch (Exception ex)
        //    {
        //        logger.LogError(ex, "Error while fetching shoppings");
        //        throw;
        //    }
        //}


        //public async Task<List<ShoppingDTO>> Get()
        //{
        //    try
        //    {
        //        logger.LogInformation("Fetching all confirmed shoppings");

        //        // קבל את כל הרכישות
        //        var shoppings = await shoppingDal.Get();

        //        // סנן רק את אלה שאינם טיוטה
        //        var confirmed = shoppings.Where(s => !s.IsDraft).ToList();

        //        return mapper.Map<List<ShoppingDTO>>(confirmed);
        //    }
        //    catch (Exception ex)
        //    {
        //        logger.LogError(ex, "Error while fetching shoppings");
        //        throw;
        //    }
        //}

        public async Task<List<ShoppingDTO>> Get()
        {
            try
            {
                logger.LogInformation("Fetching all confirmed shoppings");

                var shoppings = await shoppingDal.Get();
                var confirmed = shoppings.Where(s => !s.IsDraft).ToList();

                return mapper.Map<List<ShoppingDTO>>(confirmed);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while fetching shoppings");
                throw;
            }
        }

        public async Task<List<ShoppingDTO>> GetSorted(ShoppingSortDTO sort)
        {
            try
            {
                logger.LogInformation("Fetching shoppings sorted by {@Sort}", sort);

                var query = shoppingDal.Query();

                if (sort.SortBy.HasValue)
                {
                    if (sort.SortBy == ShoppingSortBy.Price)
                    {
                        query = sort.Desc
                            ? query.OrderByDescending(s => s.Gift.CardPrice)
                            : query.OrderBy(s => s.Gift.CardPrice);
                    }
                    else if (sort.SortBy == ShoppingSortBy.Popularity)
                    {
                        // כאן עושים קיבוץ + סכום Quantity, ואז שליפה של כל הרשומות של המתנה לפי סכום Quantity
                        var popularityQuery = await query
                            .GroupBy(s => s.GiftId)
                            .Select(g => new
                            {
                                GiftId = g.Key,
                                TotalQuantity = g.Sum(x => x.Quantity)
                            })
                            .OrderByDescending(g => g.TotalQuantity)
                            .ToListAsync();

                        // מביאים את כל הרשומות לפי סדר הפופולריות
                        var sortedList = new List<ShoppingDTO>();
                        foreach (var item in popularityQuery)
                        {
                            var shoppingsOfGift = await query
                                .Where(s => s.GiftId == item.GiftId)
                                .ToListAsync();

                            sortedList.AddRange(mapper.Map<List<ShoppingDTO>>(shoppingsOfGift));
                        }

                        return sortedList;
                    }
                }

                var shoppings = await query.ToListAsync();
                return mapper.Map<List<ShoppingDTO>>(shoppings);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while fetching sorted shoppings");
                throw;
            }
        }
        public async Task<List<ShoppingDTO?>> GetGiftById(int id)
        {
            try
            {
                logger.LogInformation("Fetching shopping {Id}", id);
                var shopping = await shoppingDal.GetGiftById(id);
                return mapper.Map<List<ShoppingDTO?>>(shopping);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while fetching shopping {Id}", id);
                throw;
            }
        }

        // ✅ Add: עכשיו בודק אם המתנה קיימת ו- IsRaffled
        public async Task Add(ShoppingDTO shoppingDTO)
        {
            try
            {
                logger.LogInformation("Adding shopping");

                var gift = await giftBLL.GetById(shoppingDTO.GiftId);
                if (gift == null)
                {
                    logger.LogWarning("Gift {GiftId} does not exist", shoppingDTO.GiftId);
                    throw new Exception("Gift does not exist.");
                }

                if (gift.IsRaffled)
                {
                    logger.LogWarning("Cannot buy a gift {GiftId} that has already been raffled", shoppingDTO.GiftId);
                    throw new Exception("Cannot buy a gift that has already been raffled.");
                }

                // ✅ בדיקה אם כבר יש רכישה של אותה מתנה על ידי אותו משתמש
                var existingShopping = await shoppingDal.GetByUserAndGift(shoppingDTO.UserId, shoppingDTO.GiftId);
                
                if (existingShopping != null && !existingShopping.IsDraft)
                {
                    // עדכן כמות קיימת
                    existingShopping.Quantity += shoppingDTO.Quantity;
                    await shoppingDal.Put(existingShopping);
                    logger.LogInformation("Shopping quantity updated successfully");
                }
                else
                {
                    // יצור רשומה חדשה
                    var shopping = mapper.Map<Shopping>(shoppingDTO);
                    shopping.IsDraft = false;
                    await shoppingDal.Add(shopping);
                    logger.LogInformation("Shopping added successfully");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while adding shopping");
                throw;
            }
        }


        //public async Task Add(ShoppingDTO shoppingDTO)
        //{
        //    try
        //    {
        //        logger.LogInformation("Adding shopping");

        //        // 🔴 בדיקה אם המתנה קיימת והאם היא הוגרלה
        //        var gift = await giftBLL.GetById(shoppingDTO.GiftId);
        //        if (gift == null)
        //        {
        //            logger.LogWarning("Gift {GiftId} does not exist", shoppingDTO.GiftId);
        //            throw new Exception("Gift does not exist.");
        //        }

        //        if (gift.IsRaffled)
        //        {
        //            logger.LogWarning("Cannot purchase a gift {GiftId} that has already been raffled", shoppingDTO.GiftId);
        //            throw new Exception("Cannot purchase a gift that has already been raffled.");
        //        }

        //        var shopping = mapper.Map<Shopping>(shoppingDTO);
        //        await shoppingDal.Add(shopping);

        //        logger.LogInformation("Shopping added successfully");
        //    }
        //    catch (Exception ex)
        //    {
        //        logger.LogError(ex, "Error while adding shopping");
        //        throw;
        //    }
        //}

        //public async Task Add(ShoppingDTO shoppingDTO)
        //{
        //    try
        //    {
        //        logger.LogInformation("Adding shopping");
        //        var shopping = mapper.Map<Shopping>(shoppingDTO);
        //        await shoppingDal.Add(shopping);
        //    }
        //    catch (Exception ex)
        //    {
        //        logger.LogError(ex, "Error while adding shopping");
        //        throw;
        //    }
        //}

        //public async Task<bool> Put(int id, ShoppingDTO shoppingDTO)
        //{
        //    try
        //    {
        //        logger.LogInformation("Updating shopping {Id}", id);

        //        var shopping = await shoppingDal.GetById(id);
        //        if (shopping == null)
        //            return false;

        //        // 🔴 בדיקה אם המתנה קיימת והאם היא הוגרלה
        //        var gift = await giftBLL.GetById(shoppingDTO.GiftId);
        //        if (gift == null)
        //        {
        //            logger.LogWarning("Gift {GiftId} does not exist", shoppingDTO.GiftId);
        //            throw new Exception("Gift does not exist.");
        //        }

        //        if (gift.IsRaffled)
        //        {
        //            logger.LogWarning("Cannot update a purchase for a gift {GiftId} that has already been raffled", shoppingDTO.GiftId);
        //            throw new Exception("Cannot update a purchase for a gift that has already been raffled.");
        //        }

        //        mapper.Map(shoppingDTO, shopping);
        //        await shoppingDal.Put(shopping);

        //        logger.LogInformation("Shopping {Id} updated successfully", id);
        //        return true;
        //    }
        //    catch (Exception ex)
        //    {
        //        logger.LogError(ex, "Error while updating shopping {Id}", id);
        //        throw;
        //    }
        //}

        public async Task<bool> Put(int id, ShoppingDTO shoppingDTO)
        {
            try
            {
                logger.LogInformation("Updating shopping {Id}", id);

                var shopping = await shoppingDal.GetById(id);
                if (shopping == null)
                    return false;

                var gift = await giftBLL.GetById(shoppingDTO.GiftId);
                if (gift == null)
                {
                    logger.LogWarning("Gift {GiftId} does not exist", shoppingDTO.GiftId);
                    throw new Exception("Gift does not exist."); // 🔴 שינוי קריטי
                }

                if (gift.IsRaffled)
                {
                    logger.LogWarning("Cannot update a shopping for a gift {GiftId} that has already been raffled", shoppingDTO.GiftId);
                    throw new Exception("Cannot update a shopping for a gift that has already been raffled."); // 🔴 שינוי קריטי
                }

                mapper.Map(shoppingDTO, shopping); // ✅ מיפוי DTO לשמירת שמות שדות
                await shoppingDal.Put(shopping);

                logger.LogInformation("Shopping {Id} updated successfully", id);
                return true;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while updating shopping {Id}", id);
                throw;
            }
        }


        public async Task<ShoppingDTO?> GetById(int id)
        {
            try
            {
                logger.LogInformation("Fetching shopping {Id}", id);
                var shopping = await shoppingDal.GetById(id);
                return mapper.Map<ShoppingDTO?>(shopping);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while fetching shopping {Id}", id);
                throw;
            }
        }

        public async Task<bool> HasNonDraftShoppingsForGift(int giftId)
        {
            try
            {
                var shoppings = await shoppingDal.Get();
                return shoppings.Any(s => s.GiftId == giftId && !s.IsDraft); // 🔴 שינוי קריטי: בודק Draft
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while checking shoppings for gift {GiftId}", giftId);
                throw;
            }
        }

        //public async Task<bool> HasNonDraftShoppingsForGift(int giftId)
        //{
        //    try
        //    {
        //        var shoppings = await shoppingDal.Get();
        //        return shoppings.Any(s => s.GiftId == giftId && !s.IsDraft);
        //    }
        //    catch (Exception ex)
        //    {
        //        logger.LogError(ex, "Error while checking shoppings for gift {GiftId}", giftId);
        //        throw;
        //    }
        //}

        //public async Task<bool> Put(int id, ShoppingDTO shoppingDTO)
        //{
        //    // בדיקה אם הרכישה קיימת
        //    var shopping = await shoppingDal.GetById(id);
        //    if (shopping == null)
        //        return false; // לא קיים רכישה עם מזהה זה

        //    // בדיקה אם הרכישה אושרה - אם כן, אסור לעדכן
        //    if (!shopping.IsDraft)
        //        return false; // אסור לעדכן רכישה שאושרה

        //    // בדיקה אם המתנה קיימת
        //    var gift = await giftBLL.GetById(shoppingDTO.GiftId);
        //    if (gift == null)
        //        return false; // לא ניתן לעדכן למתנה שנמחקה

        //    // אם הכל תקין, מבצעים עדכון
        //    shopping.UserId = shoppingDTO.UserId;
        //    shopping.GiftId = shoppingDTO.GiftId;

        //    await shoppingDal.Put(shopping);
        //    return true;
        //}

        //public async Task<bool> Put(int id, ShoppingDTO shoppingDTO)
        //{
        //    var shopping = await shoppingDal.GetById(id);
        //    if (shopping == null)
        //        return false;

        //    if (!shopping.IsDraft)
        //        return false;

        //    var gift = await giftBLL.GetById(shoppingDTO.GiftId);
        //    if (gift == null)
        //        return false;

        //    shopping.UserId = shoppingDTO.UserId;
        //    shopping.GiftId = shoppingDTO.GiftId;

        //    await shoppingDal.Put(shopping);
        //    return true;
        //}

        public async Task<bool> Delete(int id)
        {
            // בדיקה אם הרכישה קיימת
            var shopping = await shoppingDal.GetById(id);
            if (shopping == null)
                return false; // לא קיים רכישה עם מזהה זה

            // בדיקה אם הרכישה אושרה - אם כן, אסור למחוק
            if (!shopping.IsDraft)
                return false; // לא ניתן למחוק רכישה שאושרה

            // מבצעים מחיקה
            return await shoppingDal.Delete(id);
        }

        //public async Task<bool> ConfirmShopping(int id)
        //{
        //    var shopping = await shoppingDal.GetById(id);
        //    if (shopping == null)
        //        throw new Exception("Shopping does not exist.");

        //    if (!shopping.IsDraft)
        //        throw new Exception("Shopping was already confirmed."); // זריקת שגיאה

        //    shopping.IsDraft = false; 
        //    await shoppingDal.Put(shopping);

        //    return true;
        //}

        public async Task<bool> ConfirmShopping(int id)
        {
            var shopping = await shoppingDal.GetById(id);
            if (shopping == null)
                throw new Exception("Shopping does not exist.");

            if (!shopping.IsDraft)
                throw new Exception("Shopping was already confirmed."); // 🔴 שינוי קריטי

            shopping.IsDraft = false;// אישור רכישה
            await shoppingDal.Put(shopping);

            return true;
        }


    }
}