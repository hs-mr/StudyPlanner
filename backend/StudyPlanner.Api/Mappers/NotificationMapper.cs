using StudyPlanner.Api.DTOs;
using StudyPlanner.Api.Models;

namespace StudyPlanner.Api.Mappers;

public static class NotificationMapper
{
    public static NotificationResponseDto ToResponseDto(this Notification notification)
    {
        return new NotificationResponseDto
        {
            Id = notification.Id,
            NotificationMessage = notification.NotificationMessage,
            UserId = notification.UserId,
            User = notification.User?.ToSimpleDto()
        };
    }

    public static Notification ToModel(this NotificationCreateDto dto)
    {
        return new Notification
        {
            NotificationMessage = dto.NotificationMessage,
            UserId = dto.UserId
        };
    }
}
