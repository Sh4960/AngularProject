using AutoMapper;
using Microsoft.EntityFrameworkCore;
using WebApiProject.BLL.Interfaces;
using WebApiProject.DAL;
using WebApiProject.DAL.Interfaces;
using WebApiProject.Models;
using WebApiProject.Models.DTO;

namespace WebApiProject.BLL
{
    public class GiftBLLService : IGiftBLLService
    {
        private readonly IGiftDAL giftDal;
        private readonly IShoppingDAL shoppingDal;
        private readonly IMapper mapper;
        private readonly ILogger<GiftBLLService> logger;
        private readonly IEmailBLLService emailService;
        private readonly RaffleStorageService raffleStorageService; // 🔹 מוסיפים שירות זוכים


        public GiftBLLService(IGiftDAL giftDal, IShoppingDAL shoppingDal, IMapper mapper, ILogger<GiftBLLService> logger, IEmailBLLService emailService, RaffleStorageService raffleStorageService)
        {
            this.giftDal = giftDal;
            this.mapper = mapper;
            this.logger = logger;
            this.shoppingDal = shoppingDal;
            this.emailService = emailService;
            this.raffleStorageService = raffleStorageService;
        }

        public async Task<List<GiftGetDTO>> Get()
        {
            try
            {
                logger.LogInformation("Fetching all gifts");

                var gifts = await giftDal.Get();
                return mapper.Map<List<GiftGetDTO>>(gifts);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while fetching gifts");
                throw;
            }
        }
        public async Task<List<GiftGetDTO>> GetFiltered(GiftFilterDTO filter)
        {
            try
            {
                // לוג בתחילת הפעולה עם הפרמטרים שנשלחו
                logger.LogInformation("Fetching filtered gifts with criteria: {@Filter}", filter);

                var query = giftDal.Query();

                // סינון לפי שם המתנה
                if (!string.IsNullOrEmpty(filter.GiftName))
                {
                    query = query.Where(g => g.Name.Contains(filter.GiftName));
                }

                // סינון לפי קטגוריה
                if (!string.IsNullOrEmpty(filter.Category))
                {
                    query = query.Where(g => g.Category == filter.Category);
                }

                // סינון לפי שם התורם
                if (!string.IsNullOrEmpty(filter.DonorName))
                {
                    query = query.Where(g => g.Donor.Name.Contains(filter.DonorName));
                }

                // מיון
                if (filter.SortBy.HasValue)
                {
                    query = filter.SortBy switch
                    {
                        GiftSortBy.Price =>
                            filter.Desc ? query.OrderByDescending(g => g.CardPrice)
                                        : query.OrderBy(g => g.CardPrice),

                        // מיון לפי כמות רכישות (ספירת רשימת ה-Shoppings)
                        GiftSortBy.PurchasesCount =>
                            filter.Desc ? query.OrderByDescending(g => g.Shoppings.Count)
                                        : query.OrderBy(g => g.Shoppings.Count),

                        _ => query
                    };
                }

                // הרצת השאילתה מול בסיס הנתונים
                var list = await query.ToListAsync();

                logger.LogInformation("Successfully fetched {Count} gifts", list.Count);

                // מיפוי ל-DTO
                return mapper.Map<List<GiftGetDTO>>(list);
            }
            catch (Exception ex)
            {
                // רישום שגיאה במידה ומשהו נכשל (למשל בעיית תקשורת עם ה-DB)
                logger.LogError(ex, "An error occurred while fetching filtered gifts with filter: {@Filter}", filter);

                // זריקת השגיאה הלאה כדי שה-Controller יוכל להחזיר תגובה מתאימה (כמו 500)
                throw;
            }
        }

        public async Task<GiftGetDTO?> GetById(int id)
        {
            try
            {
                logger.LogInformation("Fetching gift {Id}", id);

                var gift = await giftDal.GetById(id);
                return mapper.Map<GiftGetDTO?>(gift);
            }
            //אם רוצים שלכל מתנה יהיה את רשימת הקניות שלה עם פרטי המשתמשים
            //try
            //{
            //    logger.LogInformation("Fetching gift {Id}", id);

            //    // שולף את המתנה כולל רכישות
            //    var gift = await giftDal.GetById(id);
            //    if (gift == null)
            //        return null;

            //    // ממפה ל-DTO
            //    var giftDto = mapper.Map<GiftDTO>(gift);

            //    // 🔹 ממפה את רשימת הרכישות עם פרטי המשתמש בצורה שטוחה
            //    giftDto.Shoppings = gift.Shoppings
            //        .Select(s => mapper.Map<ShoppingDTO>(s))
            //        .ToList();

            //    return giftDto;
            //}

            catch (Exception ex)
            {
                logger.LogError(ex, "Error while fetching gift {Id}", id);
                throw;
            }
        }

        public async Task Add(GiftDTO giftDTO)
        {
            try
            {
                logger.LogInformation("Adding new gift");

                var gift = mapper.Map<Gift>(giftDTO);
                await giftDal.Add(gift);

                logger.LogInformation("Gift added successfully");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while adding gift");
                throw;
            }
        }

        public async Task<bool> Put(int id, GiftDTO giftDTO)
        {
            try
            {
                logger.LogInformation("Updating gift {Id}", id);

                var gift = await giftDal.GetById(id);
                if (gift == null)
                {
                    logger.LogWarning("Gift {Id} not found", id);
                    return false;
                }

                mapper.Map(giftDTO, gift);
                await giftDal.Put(gift);

                logger.LogInformation("Gift {Id} updated successfully", id);
                return true;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while updating gift {Id}", id);
                throw;
            }
        }

        public async Task<bool> Delete(int id)
        {
            try
            {
                logger.LogInformation("Deleting gift {Id}", id);

                var result = await giftDal.Delete(id);

                if (!result)
                {
                    logger.LogWarning("Delete failed for gift {Id} (not found or has shoppings)", id);
                }

                return result;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while deleting gift {Id}", id);
                throw;
            }
        }

        // Raffle a single gift: pick a random non-draft shopping entry for the gift

        public async Task<RaffleResultDTO?> RaffleGift(int giftId)
        {
            try
            {
                var gift = await giftDal.Query()
                    .Include(g => g.Shoppings)
                        .ThenInclude(s => s.User)
                    .FirstOrDefaultAsync(g => g.Id == giftId);

                if (gift == null)
                {
                    logger.LogWarning("Gift {GiftId} not found", giftId);
                    return null;
                }

                if (gift.IsRaffled)
                {
                    logger.LogWarning("Gift {GiftId} has already been raffled", giftId);
                    return null;
                }

                var confirmShoppings = gift.Shoppings.Where(s => !s.IsDraft).ToList();
                if (!confirmShoppings.Any())
                {
                    logger.LogWarning("No confirmed shoppings for gift {GiftId}", giftId);
                    return null;
                }

                var random = new Random();
                var winnerShopping = confirmShoppings[random.Next(confirmShoppings.Count)];

                var result = new RaffleResultDTO
                {
                    GiftId = gift.Id,
                    GiftName = gift.Name,
                    WinnerUserId = winnerShopping.UserId,
                    WinnerUserName = winnerShopping.User.UserName,
                    WinnerEmail = winnerShopping.User.Email
                };

                gift.IsRaffled = true;
                await giftDal.Put(gift);

                try
                {
                    await emailService.SendWinnerEmail(result.WinnerEmail, result.GiftName);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Failed to send email to winner {Email}", result.WinnerEmail);
                }

                return result;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while raffling gift {GiftId}", giftId);
                throw;
            }
        }


        //        public async Task<RaffleResultDTO?> Raffle(int giftId)
        //{
        //try
        //{
        //    logger.LogInformation("Raffling gift {GiftId}", giftId);

        //    var gift = await giftDal.GetById(giftId);
        //    if (gift == null)
        //    {
        //        logger.LogWarning("Gift {GiftId} not found for raffle", giftId);
        //        return null;
        //    }

        //    // Get confirmed shoppings (not drafts)
        //    var shoppings = await shoppingDal.Query()
        //        .Where(s => s.GiftId == giftId && !s.IsDraft)
        //        .Include(s => s.User)
        //        .ToListAsync();

        //    if (!shoppings.Any())
        //    {
        //        logger.LogWarning("No confirmed shoppings for gift {GiftId}", giftId);
        //        return null;
        //    }

        //    // Build entries according to Quantity
        //    var entries = new List<Shopping>();
        //    foreach (var s in shoppings)
        //    {
        //        for (int i = 0; i < Math.Max(1, s.Quantity); i++)
        //            entries.Add(s);
        //    }

        //    var rnd = new Random();
        //    var winnerEntry = entries[rnd.Next(entries.Count)];

        //    var result = new RaffleResultDTO
        //    {
        //        GiftId = gift.Id,
        //        GiftName = gift.Name,
        //        WinnerUserId = winnerEntry.UserId,
        //        WinnerUserName = winnerEntry.User.UserName,
        //        WinnerEmail = winnerEntry.User.Email
        //    };

        //    // Update gift as raffled
        //    if (result != null)
        //    {
        //        var gift2 = await giftDal.GetById(giftId); // ✅ נכון: להשתמש ב-giftDAL
        //        gift2.IsRaffled = true;
        //        await giftDal.Put(gift2); // ✅ מעדכן את השדה בבסיס
        //    }

        //    logger.LogInformation("Raffle result for gift {GiftId}: user {UserId}", giftId, result.WinnerUserId);
        //    return result;
        //}
        //catch (Exception ex)
        //{
        //    logger.LogError(ex, "Error while raffling gift {GiftId}", giftId);
        //    throw;
        //}
        //}

        // Raffle all gifts and produce a report with total income
        //public async Task<RaffleReportDTO> RaffleAll()
        //{
        //    try
        //    {
        //        logger.LogInformation("Starting raffle for all gifts");

        //        var gifts = await giftDal.Get();
        //        var report = new RaffleReportDTO();
        //        int income = 0;
        //        var rnd = new Random();

        //        foreach (var gift in gifts)
        //        {
        //            var shoppings = await shoppingDal.Query()
        //                .Where(s => s.GiftId == gift.Id && !s.IsDraft)
        //                .Include(s => s.User)
        //                .ToListAsync();

        //            if (!shoppings.Any())
        //    continue;

        //// total income increases by sum(Quantity * CardPrice)
        //income += shoppings.Sum(s => s.Quantity * gift.CardPrice);

        //var entries = new List<Shopping>();
        //foreach (var s in shoppings)
        //{
        //    for (int i = 0; i < Math.Max(1, s.Quantity); i++)
        //        entries.Add(s);
        //}

        //var winnerEntry = entries[rnd.Next(entries.Count)];

        //report.Results.Add(new RaffleResultDTO
        //{
        //    GiftId = gift.Id,
        //    GiftName = gift.Name,
        //    WinnerUserId = winnerEntry.UserId,
        //    WinnerUserName = winnerEntry.User.UserName,
        //    WinnerEmail = winnerEntry.User.Email
        //                });
        //            }

        //            report.TotalIncome = income;
        //            logger.LogInformation("Raffle completed. Winners: {Count}. Total income: {Income}", report.Results.Count, income);
        //            return report;
        //        }
        //        catch (Exception ex)
        //        {
        //            logger.LogError(ex, "Error while raffling all gifts");
        //            throw;
        //        }
        //    }
        //}

        //public async Task<RaffleReportDTO> RaffleAll()
        //{
        //    try
        //    {
        //        logger.LogInformation("Starting raffle for all gifts");

        //        var report = new RaffleReportDTO();

        //      //שולפים את כל המתנות
        //        var gifts = (await giftDal.Get())
        //                        //.Where(g => !g.IsRaffled)  שולפים את כל המתנות שלא הופעל עליהן הגרלה
        //                      .ToList();

        //        foreach (var gift in gifts)
        //        {
        //            // 2️⃣ בודקים אם יש רכישות לא דראפט למתנה
        //            var shoppings = await shoppingDal.GetGiftById(gift.Id);
        //            if (!shoppings.Any())
        //                continue;

        //            // 3️⃣ בוחרים מנצח אקראי
        //            var random = new Random();
        //            var winnerShopping = shoppings[random.Next(shoppings.Count)];

        //            // 4️⃣ יוצרים אובייקט תוצאה
        //            var result = new RaffleResultDTO
        //            {
        //                GiftId = gift.Id,
        //                GiftName = gift.Name,
        //                WinnerUserId = winnerShopping.UserId,
        //                WinnerUserName = winnerShopping.User.UserName,
        //                WinnerEmail = winnerShopping.User.Email
        //            };

        //            // 5️⃣ מוסיפים לדוח
        //            report.Results.Add(result);

        //            // 6️⃣ מעדכנים את ההכנסות
        //            report.TotalIncome += gift.CardPrice;

        //            // 7️⃣ מעדכנים את המתנה כבוצעה הגרלה
        //            gift.IsRaffled = true; // ✅ שימוש ב-giftDAL במקום donorDAL
        //            await giftDal.Put(gift);
        //        }

        //        logger.LogInformation("Raffle completed successfully");
        //        return report;
        //    }
        //    catch (Exception ex)
        //    {
        //        logger.LogError(ex, "Error occurred while performing raffle for all gifts");
        //        throw;
        //    }
        //}

        public async Task<List<RaffleResultDTO>> RaffleAll()
        {
            try
            {
                var gifts = await giftDal.Get();
                var results = new List<RaffleResultDTO>();

                foreach (var gift in gifts)
                {
                    if (gift.IsRaffled)
                        continue; // כבר הוגרל

                    var shoppings = gift.Shoppings.Where(s => !s.IsDraft).ToList();
                    if (!shoppings.Any())
                        continue; // אין רכישות מאושרות

                    var random = new Random();
                    var winnerShopping = shoppings[random.Next(shoppings.Count)];

                    var result = new RaffleResultDTO
                    {
                        GiftId = gift.Id,
                        GiftName = gift.Name,
                        WinnerUserId = winnerShopping.UserId,
                        WinnerUserName = winnerShopping.User.UserName,
                        WinnerEmail = winnerShopping.User.Email
                    };

                    results.Add(result);

                    // עדכון המתנה כבוצעה הגרלה
                    gift.IsRaffled = true;
                    await giftDal.Put(gift);

                    // שליחת מייל לניצח
                    try
                    {
                        await emailService.SendWinnerEmail(result.WinnerEmail, result.GiftName);
                    }
                    catch (Exception ex)
                    {
                        logger.LogError(ex, "Failed to send email to winner {Email} for gift {GiftId}", result.WinnerEmail, gift.Id);
                    }
                }

                return results;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while raffling all gifts");
                throw;
            }
        }
    }
}




        //public bool Put(int id, GiftDTO giftDTO)
        //{
        //    var gift = giftDal.GetById(id);
        //    if (gift == null)
        //        return false;

        //    // עדכון שדות מותר/בטוח בלבד
        //    gift.Name = giftDTO.Name;
        //    gift.Category = giftDTO.Category;
        //    gift.CardPrice = giftDTO.CardPrice;

        //    // אם שונה donorId - עדכן ה־FK (הניווט ישאר כפי שה־EF מטפל בו; במידת הצורך ניתן לנקות את הניווט)
        //    if (gift.DonorId != giftDTO.DonorId)
        //    {
        //        gift.DonorId = giftDTO.DonorId;
        //        // לא מחייב אך אפשר לנקות את הניווט כדי למנוע אי־התאמות:
        //        gift.Donor = null!;
        //    }

        //    giftDal.Put(gift);
        //    return true;
        //}