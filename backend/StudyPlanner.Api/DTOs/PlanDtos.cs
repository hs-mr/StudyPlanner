namespace StudyPlanner.Api.DTOs;

// DTO für die Erstellung eines Plans
public class PlanCreateDto
{
    public required string PlanTheme { get; set; }
    public bool PlanStatus { get; set; }
    public string? Notes { get; set; }
    public int UserId { get; set; }
}

// DTO für das Update eines Plans
public class PlanUpdateDto
{
    public string? PlanTheme { get; set; }
    public bool? PlanStatus { get; set; }
    public string? Notes { get; set; }
}

// DTO für die Antwort
public class PlanResponseDto
{
    public int Id { get; set; }
    public required string PlanTheme { get; set; }
    public bool PlanStatus { get; set; }
    public string? Notes { get; set; }
    public int UserId { get; set; }
    public UserSimpleDto? User { get; set; }
}
