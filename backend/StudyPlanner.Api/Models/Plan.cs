using System.Text.Json.Serialization;

namespace StudyPlanner.Api.Models;

public class Plan
{
    public int Id { get; set; }
    public required string PlanTheme { get; set; }
    //Status ob der Plan abgeschlossen ist oder nicht
    public bool PlanStatus { get; set; }
    public string? Notes { get; set; }

    // Foreign Key
    public int UserId { get; set; }

    // Navigation Property
    [JsonIgnore]
    public User? User { get; set; }
}
