namespace StudyPlanner.Api.Models;

public class User
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Password { get; set; }
    //Der Status ob der User angemeldet ist oder nicht
    public bool Status { get; set; }

    // Navigation Properties
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<Plan> Plans { get; set; } = new List<Plan>();
}
