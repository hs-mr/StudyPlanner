using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyPlanner.Api.Data;
using StudyPlanner.Api.Models;

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
    public async Task<ActionResult<IEnumerable<Notification>>> GetNotifications()
    {
        return await _context.Notifications
            .Include(n => n.User)
            .ToListAsync();
    }

    // GET: api/notifications/user/5
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<Notification>>> GetNotificationsByUser(int userId)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId)
            .Include(n => n.User)
            .ToListAsync();

        return notifications;
    }

    // POST: api/notifications
    [HttpPost]
    public async Task<ActionResult<Notification>> CreateNotification(Notification notification)
    {
        // Prüfen ob User existiert
        if (!await _context.Users.AnyAsync(u => u.Id == notification.UserId))
        {
            return BadRequest("User does not exist");
        }

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetNotifications), new { id = notification.Id }, notification);
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
