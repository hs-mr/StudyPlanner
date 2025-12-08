namespace StudyPlanner.Api.DTOs;

// DTO für die Erstellung einer Notification
public class NotificationCreateDto
{
    public required string NotificationMessage { get; set; }
    public int UserId { get; set; }
}

// DTO für die Antwort
public class NotificationResponseDto
{
    public int Id { get; set; }
    public required string NotificationMessage { get; set; }
    public int UserId { get; set; }
    public UserSimpleDto? User { get; set; }
}
