using StudyPlanner.Api.DTOs;
using StudyPlanner.Api.Models;

namespace StudyPlanner.Api.Mappers;

public static class PlanMapper
{
    public static PlanResponseDto ToResponseDto(this Plan plan)
    {
        return new PlanResponseDto
        {
            Id = plan.Id,
            PlanTheme = plan.PlanTheme,
            PlanStatus = plan.PlanStatus,
            Notes = plan.Notes,
            UserId = plan.UserId,
            User = plan.User?.ToSimpleDto()
        };
    }

    public static Plan ToModel(this PlanCreateDto dto)
    {
        return new Plan
        {
            PlanTheme = dto.PlanTheme,
            PlanStatus = dto.PlanStatus,
            Notes = dto.Notes,
            UserId = dto.UserId
        };
    }

    public static void UpdateFromDto(this Plan plan, PlanUpdateDto dto)
    {
        if (dto.PlanTheme != null)
            plan.PlanTheme = dto.PlanTheme;

        if (dto.PlanStatus.HasValue)
            plan.PlanStatus = dto.PlanStatus.Value;

        if (dto.Notes != null)
            plan.Notes = dto.Notes;
    }
}
