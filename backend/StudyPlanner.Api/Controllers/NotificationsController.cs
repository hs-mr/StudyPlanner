using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyPlanner.Api.Data;
using StudyPlanner.Api.DTOs;
using StudyPlanner.Api.Mappers;

namespace StudyPlanner.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly StudyPlannerContext _context;

    public NotificationsController(StudyPlannerContext context)
    {
        _context = context;
    }

    // GET: api/notifications
    [HttpGet]
    public async Task<ActionResult<IEnumerable<NotificationResponseDto>>> GetNotifications()
    {
        var notifications = await _context.Notifications
            .Include(n => n.User)
            .ToListAsync();

        return Ok(notifications.Select(n => n.ToResponseDto()));
    }

    // GET: api/notifications/user/5
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<NotificationResponseDto>>> GetNotificationsByUser(int userId)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId)
            .Include(n => n.User)
            .ToListAsync();

        return Ok(notifications.Select(n => n.ToResponseDto()));
    }

    // POST: api/notifications
    [HttpPost]
    public async Task<ActionResult<NotificationResponseDto>> CreateNotification(NotificationCreateDto notificationDto)
    {
        // Prüfen ob User existiert
        if (!await _context.Users.AnyAsync(u => u.Id == notificationDto.UserId))
        {
            return BadRequest("User does not exist");
        }

        var notification = notificationDto.ToModel();
        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        // Lade Notification mit User für die Response
        var createdNotification = await _context.Notifications
            .Include(n => n.User)
            .FirstOrDefaultAsync(n => n.Id == notification.Id);

        return CreatedAtAction(nameof(GetNotifications), new { id = notification.Id }, createdNotification!.ToResponseDto());
    }

    // DELETE: api/notifications/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteNotification(int id)
    {
        var notification = await _context.Notifications.FindAsync(id);
        if (notification == null)
        {
            return NotFound();
        }

        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
