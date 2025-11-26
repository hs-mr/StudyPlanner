using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyPlanner.Api.Data;
using StudyPlanner.Api.Models;

namespace StudyPlanner.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlansController : ControllerBase
{
    private readonly StudyPlannerContext _context;

    public PlansController(StudyPlannerContext context)
    {
        _context = context;
    }

    // GET: api/plans
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Plan>>> GetPlans()
    {
        return await _context.Plans
            .Include(p => p.User)
            .ToListAsync();
    }

    // GET: api/plans/user/5
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<Plan>>> GetPlansByUser(int userId)
    {
        var plans = await _context.Plans
            .Where(p => p.UserId == userId)
            .Include(p => p.User)
            .ToListAsync();

        return plans;
    }

    // POST: api/plans
    [HttpPost]
    public async Task<ActionResult<Plan>> CreatePlan(Plan plan)
    {
        // Prüfen ob User existiert
        if (!await _context.Users.AnyAsync(u => u.Id == plan.UserId))
        {
            return BadRequest("User does not exist");
        }

        _context.Plans.Add(plan);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPlans), new { id = plan.Id }, plan);
    }

    // PUT: api/plans/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePlan(int id, Plan plan)
    {
        if (id != plan.Id)
        {
            return BadRequest();
        }

        _context.Entry(plan).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!PlanExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/plans/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePlan(int id)
    {
        var plan = await _context.Plans.FindAsync(id);
        if (plan == null)
        {
            return NotFound();
        }

        _context.Plans.Remove(plan);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool PlanExists(int id)
    {
        return _context.Plans.Any(p => p.Id == id);
    }
}
