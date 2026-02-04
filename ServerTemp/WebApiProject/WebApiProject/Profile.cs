using AutoMapper;
using WebApiProject.Models;
using WebApiProject.Models.DTO;

namespace WebApiProject
{
    public class Profile : AutoMapper.Profile
    {
        public Profile()
        {
            //אנחנו מתעלמים ממנו ID גם אם המשתמש מכניס
            //PK -כ SSMS שבדיטיאו מוגדר ב ID בעיקרון זה קורה אוטומטית כי ה
            //לא יכול להשתנות PK -ו

            // ===== Donor =====
            CreateMap<DonorDTO, Donor>()
                .ForMember(d => d.Id, opt => opt.Ignore());

            CreateMap<Donor, DonorDTO>();

            // ===== Gift =====
            CreateMap<Gift, GiftDTO>()
                .ForMember(dest => dest.DonorName, opt => opt.MapFrom(src => src.Donor.Name));
            //.IsRaffled יומפה אוטומטית כי השם זהה
            CreateMap<GiftDTO, Gift>()
                .ForMember(g => g.Id, opt => opt.Ignore());
           
            CreateMap<Gift, GiftGetDTO>();
            CreateMap<GiftGetDTO, Gift>()
                .ForMember(g => g.Id, opt => opt.Ignore());


            // ===== Shopping =====
            CreateMap<ShoppingDTO, Shopping>().ForMember(s => s.Id, opt => opt.Ignore());

            CreateMap<Shopping, ShoppingDTO>()
                       // מיפוי שם המשתמש מתוך האובייקט המקונן User
                       .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.UserName))
                       // מיפוי שם המתנה מתוך האובייקט המקונן Gift
                       .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User.Email))
                       // מיפוי מחיר המתנה
                       .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.User.Phone));


            // ===== User =====
            CreateMap<UserDTO, User>()
                .ForMember(u => u.Id, opt => opt.Ignore());

            CreateMap<User, UserDTO>();
        }
    }
}
