using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using WebApiProject.BLL.Interfaces;

namespace WebApiProject.BLL
{
    public class EmailBLLService : IEmailBLLService
    {
        private readonly IConfiguration _config;

        public EmailBLLService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendWinnerEmail(string toEmail, string giftName)
        {
            var smtp = new SmtpClient
            {
                Host = _config["Email:Smtp"],
                Port = int.Parse(_config["Email:Port"]),
                EnableSsl = true,
                Credentials = new NetworkCredential(
                    _config["Email:Username"],
                    _config["Email:Password"]
                )
            };

            var mail = new MailMessage
            {
                From = new MailAddress(_config["Email:From"]),
                Subject = "🎉 זכית בהגרלה!",
                Body = $@"
                שלום,

                מזל טוב! 🎊  
                זכית בפרס: {giftName}

                ניצור איתך קשר בהקדם 😊
                ",
                IsBodyHtml = false
            };

            mail.To.Add(toEmail);

            await smtp.SendMailAsync(mail);
        }
    }
}
