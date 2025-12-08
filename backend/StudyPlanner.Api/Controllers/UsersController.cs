using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyPlanner.Api.Data;
using StudyPlanner.Api.DTOs;
using StudyPlanner.Api.Mappers;
using StudyPlanner.Api.Models;

namespace StudyPlanner.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly StudyPlannerContext _context;

    public UsersController(StudyPlannerContext context)
    {
        _context = context;
    }

    // GET: api/users
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetUsers()
    {
        var users = await _context.Users
            .Include(u => u.Notifications)
            .Include(u => u.Plans)
            .ToListAsync();

        return Ok(users.Select(u => u.ToResponseDto()));
    }

    // GET: api/users/5
    [HttpGet("{id}")]
    public async Task<ActionResult<UserResponseDto>> GetUser(int id)
    {
        var user = await _context.Users
            .Include(u => u.Notifications)
            .Include(u => u.Plans)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return NotFound();
        }

        return user.ToResponseDto();
    }

    // POST: api/users
    [HttpPost]
    public async Task<ActionResult<UserResponseDto>> CreateUser(UserCreateDto userDto)
    {
        var user = userDto.ToModel();
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user.ToResponseDto());
    }

    // POST: api/users/login
    [HttpPost("login")]
    public async Task<ActionResult<UserResponseDto>> Login(UserLoginDto loginDto)
    {
        var user = await _context.Users
            .Include(u => u.Notifications)
            .Include(u => u.Plans)
            .FirstOrDefaultAsync(u => u.Name == loginDto.Name && u.Password == loginDto.Password);

        if (user == null)
        {
            return Unauthorized(new { message = "Benutzername oder Passwort falsch" });
        }

        // User-Status auf true setzen (angemeldet)
        user.Status = true;
        await _context.SaveChangesAsync();

        return Ok(user.ToResponseDto());
    }

    // PUT: api/users/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, UserUpdateDto userDto)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return NotFound();
        }

        user.UpdateFromDto(userDto);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!UserExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/users/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound();
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool UserExists(int id)
    {
        return _context.Users.Any(u => u.Id == id);
    }
}
