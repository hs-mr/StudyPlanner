using Xunit;
using Microsoft.EntityFrameworkCore;
using StudyPlanner.Api.Controllers;
using StudyPlanner.Api.Data;
using StudyPlanner.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace StudyPlanner.Api.Tests;

public class UsersControllerTests
{
    private StudyPlannerContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<StudyPlannerContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new StudyPlannerContext(options);
    }

    // Test: GetUsers - Liefert alle Benutzer mit ihren Benachrichtigungen und Plänen
    [Fact]
    public async Task GetUsers_ReturnsAllUsers_WithNotificationsAndPlans()
    {
        // Arrange
        using (var context = CreateDbContext())
        {
            var user1 = new User { Name = "User1", Password = "password1", Status = true };
            var user2 = new User { Name = "User2", Password = "password2", Status = false };
            
            context.Users.Add(user1);
            context.Users.Add(user2);
            
            context.Notifications.Add(new Notification { NotificationMessage = "Test Notif 1", User = user1 });
            context.Plans.Add(new Plan { PlanTheme = "Plan 1", PlanStatus = false, User = user1 });
            
            await context.SaveChangesAsync();

            var controller = new UsersController(context);

            // Act
            var result = await controller.GetUsers();

            // Assert
            Assert.NotNull(result);
            var users = result.Value?.ToList();
            Assert.NotNull(users);
            Assert.Equal(2, users.Count);
            Assert.Equal("User1", users[0].Name);
            Assert.Equal("User2", users[1].Name);
            Assert.Single(users[0].Notifications);
            Assert.Single(users[0].Plans);
        }
    }

    // Test: GetUser - Liefert einzelnen Benutzer mit ID
    [Fact]
    public async Task GetUser_WithValidId_ReturnsUser()
    {
        // Arrange
        using (var context = CreateDbContext())
        {
            var user = new User { Name = "TestUser", Password = "securePassword123", Status = true };
            context.Users.Add(user);
            context.Notifications.Add(new Notification { NotificationMessage = "Reminder", User = user });
            context.Plans.Add(new Plan { PlanTheme = "Study Math", PlanStatus = false, User = user });
            
            await context.SaveChangesAsync();
            var userId = user.Id;

            var controller = new UsersController(context);

            // Act
            var result = await controller.GetUser(userId);

            // Assert
            Assert.NotNull(result);
            var returnedUser = result.Value;
            Assert.NotNull(returnedUser);
            Assert.Equal(userId, returnedUser.Id);
            Assert.Equal("TestUser", returnedUser.Name);
            Assert.True(returnedUser.Status);
            Assert.Single(returnedUser.Notifications);
            Assert.Single(returnedUser.Plans);
        }
    }

    // Test: GetUser - Liefert NotFound wenn User nicht existiert
    [Fact]
    public async Task GetUser_WithInvalidId_ReturnsNotFound()
    {
        // Arrange
        using (var context = CreateDbContext())
        {
            var controller = new UsersController(context);

            // Act
            var result = await controller.GetUser(999);

            // Assert
            Assert.NotNull(result);
            Assert.IsType<NotFoundResult>(result.Result);
        }
    }

    // Test: CreateUser - Erstellt neuen Benutzer erfolgreich
    [Fact]
    public async Task CreateUser_WithValidUser_ReturnsCreatedAtAction()
    {
        // Arrange
        using (var context = CreateDbContext())
        {
            var newUser = new User { Name = "NewUser", Password = "newPassword123", Status = false };
            var controller = new UsersController(context);

            // Act
            var result = await controller.CreateUser(newUser);

            // Assert
            Assert.NotNull(result);
            Assert.IsType<CreatedAtActionResult>(result.Result);
            var createdResult = result.Result as CreatedAtActionResult;
            Assert.NotNull(createdResult);
            Assert.Equal(nameof(controller.GetUser), createdResult.ActionName);
            Assert.True(newUser.Id > 0);
        }
    }

    // Test: UpdateUser - Aktualisiert Benutzer erfolgreich
    [Fact]
    public async Task UpdateUser_WithValidData_ReturnsNoContent()
    {
        // Arrange
        using (var context = CreateDbContext())
        {
            var user = new User { Name = "OriginalName", Password = "password123", Status = true };
            context.Users.Add(user);
            await context.SaveChangesAsync();
            
            var userId = user.Id;
            
            // Detach the original user to avoid tracking conflicts
            context.Entry(user).State = EntityState.Detached;
            
            var updatedUser = new User { Id = userId, Name = "UpdatedUser", Password = "updatedPassword123", Status = false };

            var controller = new UsersController(context);

            // Act
            var result = await controller.UpdateUser(userId, updatedUser);

            // Assert
            Assert.IsType<NoContentResult>(result);
            
            // Verify the update (reload from database)
            context.ChangeTracker.Clear();
            var dbUser = await context.Users.FindAsync(userId);
            Assert.NotNull(dbUser);
            Assert.Equal("UpdatedUser", dbUser.Name);
        }
    }

    // Test: UpdateUser - Liefert BadRequest wenn IDs nicht übereinstimmen
    [Fact]
    public async Task UpdateUser_WithMismatchedIds_ReturnsBadRequest()
    {
        // Arrange
        using (var context = CreateDbContext())
        {
            var userId = 1;
            var user = new User { Id = 2, Name = "TestUser", Password = "password123", Status = true };
            var controller = new UsersController(context);

            // Act
            var result = await controller.UpdateUser(userId, user);

            // Assert
            Assert.IsType<BadRequestResult>(result);
        }
    }

    // Test: DeleteUser - Löscht Benutzer erfolgreich
    [Fact]
    public async Task DeleteUser_WithValidId_ReturnsNoContent()
    {
        // Arrange
        using (var context = CreateDbContext())
        {
            var user = new User { Name = "UserToDelete", Password = "password123", Status = true };
            context.Users.Add(user);
            await context.SaveChangesAsync();
            
            var userId = user.Id;
            var controller = new UsersController(context);

            // Act
            var result = await controller.DeleteUser(userId);

            // Assert
            Assert.IsType<NoContentResult>(result);
            
            // Verify deletion
            var deletedUser = await context.Users.FindAsync(userId);
            Assert.Null(deletedUser);
        }
    }

    // Test: DeleteUser - Liefert NotFound wenn User nicht existiert
    [Fact]
    public async Task DeleteUser_WithInvalidId_ReturnsNotFound()
    {
        // Arrange
        using (var context = CreateDbContext())
        {
            var controller = new UsersController(context);

            // Act
            var result = await controller.DeleteUser(999);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }
    }

    // Test: CreateUser mit verschiedenen Benutzerdaten
    [Theory]
    [InlineData("Alice", "pwd123", true)]
    [InlineData("Bob", "securePass456", false)]
    [InlineData("Charlie", "testPass789", true)]
    public async Task CreateUser_WithVariousData_SuccessfullyCreated(string name, string password, bool status)
    {
        // Arrange
        using (var context = CreateDbContext())
        {
            var newUser = new User { Name = name, Password = password, Status = status };
            var controller = new UsersController(context);

            // Act
            var result = await controller.CreateUser(newUser);

            // Assert
            var createdResult = result.Result as CreatedAtActionResult;
            Assert.NotNull(createdResult);
            var createdUser = createdResult.Value as User;
            Assert.NotNull(createdUser);
            Assert.Equal(name, createdUser.Name);
            Assert.Equal(password, createdUser.Password);
            Assert.Equal(status, createdUser.Status);
        }
    }

    // Test: GetUsers - Mit mehreren Benutzern
    [Fact]
    public async Task GetUsers_WithMultipleUsers_ReturnsAllInCorrectOrder()
    {
        // Arrange
        using (var context = CreateDbContext())
        {
            context.Users.Add(new User { Name = "User A", Password = "pwd1", Status = true });
            context.Users.Add(new User { Name = "User B", Password = "pwd2", Status = false });
            context.Users.Add(new User { Name = "User C", Password = "pwd3", Status = true });
            
            await context.SaveChangesAsync();

            var controller = new UsersController(context);

            // Act
            var result = await controller.GetUsers();

            // Assert
            var users = result.Value?.ToList();
            Assert.NotNull(users);
            Assert.Equal(3, users.Count);
            Assert.Equal("User A", users[0].Name);
            Assert.Equal("User B", users[1].Name);
            Assert.Equal("User C", users[2].Name);
        }
    }
}
