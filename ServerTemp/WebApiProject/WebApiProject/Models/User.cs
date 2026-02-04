namespace WebApiProject.Models
{
    public class User
    {
        public int Id { get; set; }
        public string UserName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public RoleEnum Role { get; set; }
        public List<Shopping> Shoppings { get; set; } = new(); 
    }
}
