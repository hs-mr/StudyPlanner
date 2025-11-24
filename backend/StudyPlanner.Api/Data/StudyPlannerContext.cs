using Microsoft.EntityFrameworkCore;
using StudyPlanner.Api.Models;

namespace StudyPlanner.Api.Data;

public class StudyPlannerContext : DbContext
{
    public StudyPlannerContext(DbContextOptions<StudyPlannerContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Plan> Plans { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User -> Notifications (1:n)
        modelBuilder.Entity<User>()
            .HasMany(u => u.Notifications)
            .WithOne(n => n.User)
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // User -> Plans (1:n)
        modelBuilder.Entity<User>()
            .HasMany(u => u.Plans)
            .WithOne(p => p.User)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
