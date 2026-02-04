using Microsoft.EntityFrameworkCore;
using WebApiProject.Models;

namespace WebApiProject.Data
    {

    // EF מבין שזה קשר חובה
    // אי אפשר למחוק תורם עם מתנות
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // ===== DbSets =====
        public DbSet<User> Users { get; set; }
        public DbSet<Donor> Donors { get; set; }
        public DbSet<Gift> Gifts { get; set; }
        public DbSet<Shopping> Shoppings { get; set; }
        public DbSet<RaffleWinner> RaffleWinners { get; set; }


        // ===== Fluent API =====
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Gift>()
                .Property(g => g.IsRaffled)
                .HasDefaultValue(false);

            //בדיקה שדה מייל ייחודי
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            base.OnModelCreating(modelBuilder);

            // ---------- Donor ↔ Gifts ----------
            // אחד -> הרבה מתנות Donor
            modelBuilder.Entity<Gift>()
                .HasOne(g => g.Donor)
                .WithMany(d => d.Gifts)
                .HasForeignKey(g => g.DonorId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            // ---------- Gift ↔ Shoppings ----------
            // מתנה אחת -> הרבה רכישות
            modelBuilder.Entity<Shopping>()
                .HasOne(s => s.Gift)
                .WithMany(g => g.Shoppings)
                .HasForeignKey(s => s.GiftId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            // ---------- User ↔ Shoppings ----------
            // משתמש אחד -> הרבה רכישות
            modelBuilder.Entity<Shopping>()
                .HasOne(s => s.User)
                .WithMany(u => u.Shoppings)
                .HasForeignKey(s => s.UserId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            // ---------- User ----------
            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .IsRequired();
        }
    }

}
