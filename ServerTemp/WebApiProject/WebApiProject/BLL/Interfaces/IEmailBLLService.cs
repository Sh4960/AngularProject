namespace WebApiProject.BLL.Interfaces
{
    public interface IEmailBLLService
    {
        Task SendWinnerEmail(string toEmail, string giftName);
    }

}
