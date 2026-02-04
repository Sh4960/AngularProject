using WebApiProject.Models.DTO;

namespace WebApiProject.BLL
{
    public class RaffleStorageService
    {
        //שמירת תוצאות ההגרלה ואפשרות לגשת אליהן כל זמן ריצת האפליקציה
        //הרשימה מתאפסת בכל ריצה חדשה של האפליקציה
        private readonly List<RaffleResultDTO> raffleResults = new();

        public void AddWinner(RaffleResultDTO result)
        {
            raffleResults.Add(result);
        }

        public List<RaffleResultDTO> GetAllWinners()
        {
            return raffleResults;
        }
    }
}

