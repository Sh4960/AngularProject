using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using WebApiProject.Models.DTO;

namespace WebApiProject.Models
{
    public class Gift
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Category { get; set; } = null!;
        public int CardPrice { get; set; }
        public int DonorId { get; set; }
        public ICollection<Shopping> Shoppings { get; set; } = new List<Shopping>();
        public Donor Donor { get; set; } = null!;
        //public List<Shopping> Shoppings { get; set; } = new();
        [DefaultValue(false)]
        public bool IsRaffled { get; set; } = false;
    }
}