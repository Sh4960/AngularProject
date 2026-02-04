using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using WebApiProject.Models.DTO;

namespace WebApiProject.Models
{
    public class Donor
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public List<Gift> Gifts { get; set; } = new();

    }
}
