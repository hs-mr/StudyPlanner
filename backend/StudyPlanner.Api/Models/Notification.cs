namespace StudyPlanner.Api.Models;

public class Notification
{
    public int Id { get; set; }
    public required string NotificationMessage { get; set; }

    // Foreign Key
    public int UserId { get; set; }

    // Navigation Property
    public User User { get; set; } = null!;
}
