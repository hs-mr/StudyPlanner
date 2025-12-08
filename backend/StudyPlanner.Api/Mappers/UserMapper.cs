using StudyPlanner.Api.DTOs;
using StudyPlanner.Api.Models;

namespace StudyPlanner.Api.Mappers;

public static class UserMapper
{
    public static UserResponseDto ToResponseDto(this User user)
    {
        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Status = user.Status,
            Plans = user.Plans?.Select(p => p.ToResponseDto()).ToList() ?? new List<PlanResponseDto>(),
            Notifications = user.Notifications?.Select(n => n.ToResponseDto()).ToList() ?? new List<NotificationResponseDto>()
        };
    }

    public static UserSimpleDto ToSimpleDto(this User user)
    {
        return new UserSimpleDto
        {
            Id = user.Id,
            Name = user.Name,
            Status = user.Status
        };
    }

    public static User ToModel(this UserCreateDto dto)
    {
        return new User
        {
            Name = dto.Name,
            Password = dto.Password,
            Status = false
        };
    }

    public static void UpdateFromDto(this User user, UserUpdateDto dto)
    {
        if (dto.Name != null)
            user.Name = dto.Name;

        if (dto.Status.HasValue)
            user.Status = dto.Status.Value;
    }
}
