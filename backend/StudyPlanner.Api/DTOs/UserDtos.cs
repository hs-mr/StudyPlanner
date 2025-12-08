namespace StudyPlanner.Api.DTOs;

// DTO für die Benutzerregistrierung
public class UserCreateDto
{
    public required string Name { get; set; }
    public required string Password { get; set; }
}

// DTO für Login
public class UserLoginDto
{
    public required string Name { get; set; }
    public required string Password { get; set; }
}

// DTO für Benutzer-Update (ohne Passwort)
public class UserUpdateDto
{
    public string? Name { get; set; }
    public bool? Status { get; set; }
}

// DTO für die Antwort (ohne Passwort!)
public class UserResponseDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public bool Status { get; set; }
    public ICollection<PlanResponseDto> Plans { get; set; } = new List<PlanResponseDto>();
    public ICollection<NotificationResponseDto> Notifications { get; set; } = new List<NotificationResponseDto>();
}

// DTO für Benutzer ohne Navigation Properties
public class UserSimpleDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public bool Status { get; set; }
}
