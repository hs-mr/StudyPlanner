using Xunit;
using Microsoft.EntityFrameworkCore;
using StudyPlanner.Api.Controllers;
using StudyPlanner.Api.Data;
using StudyPlanner.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace StudyPlanner.Api.Tests;

public class NotificationsControllerTests
{
    private StudyPlannerContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<StudyPlannerContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new StudyPlannerContext(options);
    }

    // Test: GetNotifications - Liefert alle Benachrichtigungen mit ihren Benutzern
    [Fact]
    public async Task GetNotifications_ReturnsAllNotifications_WithUsers()
    {
        // Arrange
        using (var context = CreateDbContext())
        {
            var user1 = new User { Name = "User1", Password = "pwd1", Status = true };
            var user2 = new User { Name = "User2", Password = "pwd2", Status = false };
            
            context.Users.Add(user1);
            context.Users.Add(user2);
            
            context.Notifications.Add(new Notification { NotificationMessage = "Study reminder: Math", User = user1 });
            context.Notifications.Add(new Notification { NotificationMessage = "Plan deadline approaching", User = user2 });
            context.Notifications.Add(new Notification { NotificationMessage = "Task completed!", User = user1 });
            
            await context.SaveChangesAsync();

            var controller = new NotificationsController(context);

            // Act
            var result = await controller.GetNotifications();

            // Assert
            Assert.NotNull(result);
            var notifications = result.Value?.ToList();
            Assert.NotNull(notifications);
            Assert.Equal(3, notifications.Count);
            Assert.Equal("Study reminder: Math", notifications[0].NotificationMessage);
            Assert.Equal("Plan deadline approaching", notifications[1].NotificationMessage);
            Assert.Equal("Task completed!", notifications[2].NotificationMessage);
        }
    }

    // Test: GetNotificationsByUser - Liefert alle Benachrichtigungen für einen Benutzer
    [Fact]
    public async Task GetNotificationsByUser_WithValidUserId_ReturnsNotificationsByUser()
    {
        // Arrange
        using (var context = CreateDbContext())
        {
            var user = new User { Name = "TestUser", Password = "pwd123", Status = true };
            context.Users.Add(user);
            context.Notifications.Add(new Notification { NotificationMessage = "First notification", User = user });
            context.Notifications.Add(new Notification { NotificationMessage = "Second notification", User = user });
            context.Notifications.Add(new Notification { NotificationMessage = "Third notification", User = user });
            
            await context.SaveChangesAsync();
            var userId = user.Id;

            var controller = new NotificationsController(context);

            // Act
            var result = await controller.GetNotificationsByUser(userId);

            // Assert
            Assert.NotNull(result);
            var notifications = result.Value?.ToList();
            Assert.NotNull(notifications);
            Assert.Equal(3, notifications.Count);
            Assert.All(notifications, n => Assert.Equal(userId, n.UserId));
        }
    }

    // Test: GetNotificationsByUser - Liefert leere Liste wenn Benutzer keine Benachrichtigungen hat
    [Fact]
    public async Task GetNotificationsByUser_WithNoNotifications_ReturnsEmptyList()
    {
        // Arrange
        using (var context = CreateDbContext())
        {
            var controller = new NotificationsController(context);

            // Act
            var result = await controller.GetNotificationsByUser(999);

            // Assert
            Assert.NotNull(result);
            var notifications = result.Value?.ToList();
            Assert.NotNull(notifications);
            Assert.Empty(notifications);
        }
    }

    // Test: CreateNotification - Erstellt neue Benachrichtigung erfolgreich
    [Fact]
    public async Task CreateNotification_WithValidNotification_ReturnsCreatedAtAction()
    {
        // Arrange
        using (var context = CreateDbContext())
        {
            var user = new User { Name = "TestUser", Password = "pwd123", Status = true };
            context.Users.Add(user);
            await context.SaveChangesAsync();

            var newNotification = new Notification 
            { 
                NotificationMessage = "New reminder", 
                UserId = user.Id
            };

            var controller = new NotificationsController(context);

            // Act
            var result = await controller.CreateNotification(newNotification);

            // Assert
            Assert.NotNull(result);
            Assert.IsType<CreatedAtActionResult>(result.Result);
            var createdResult = result.Result as CreatedAtActionResult;
            Assert.NotNull(createdResult);
            Assert.Equal(nameof(controller.GetNotifications), createdResult.ActionName);
        }
    }

    // Test: CreateNotification - Liefert BadRequest wenn Benutzer nicht existiert
    [Fact]
    public async Task CreateNotification_WithNonexistentUser_ReturnsBadRequest()
    {
        // Arrange
        using (var context = CreateDbContext())
        {
            var newNotification = new Notification 
            { 
                NotificationMessage = "Notification for nonexistent user", 
                UserId = 999
            };

            var controller = new NotificationsController(context);

            // Act
            var result = await controller.CreateNotification(newNotification);

            // Assert
            Assert.NotNull(result);
            Assert.IsType<BadRequestObjectResult>(result.Result);
            var badRequest = result.Result as BadRequestObjectResult;
            Assert.NotNull(badRequest);
            Assert.Equal("User does not exist", badRequest.Value);
        }
    }

    // Test: DeleteNotification - Löscht Benachrichtigung erfolgreich
    [Fact]
    public async Task DeleteNotification_WithValidId_ReturnsNoContent()
    {
        // Arrange
        using (var context = CreateDbContext())
        {
            var user = new User { Name = "User", Password = "pwd", Status = true };
            var notification = new Notification { NotificationMessage = "Notification to delete", User = user };
            
            context.Users.Add(user);
            context.Notifications.Add(notification);
            await context.SaveChangesAsync();

            var notificationId = notification.Id;
            var controller = new NotificationsController(context);

            // Act
            var result = await controller.DeleteNotification(notificationId);

            // Assert
            Assert.IsType<NoContentResult>(result);
            
            var deletedNotification = await context.Notifications.FindAsync(notificationId);
            Assert.Null(deletedNotification);
        }
    }

    // Test: DeleteNotification - Liefert NotFound wenn Benachrichtigung nicht existiert
    [Fact]
    public async Task DeleteNotification_WithInvalidId_ReturnsNotFound()
    {
        // Arrange
        using (var context = CreateDbContext())
        {
            var controller = new NotificationsController(context);

            // Act
            var result = await controller.DeleteNotification(999);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }
    }

    // Test: CreateNotification - Mit verschiedenen Nachrichtentypen (Theory Test)
    [Theory]
    [InlineData("Study reminder: Biology")]
    [InlineData("Plan deadline: Tomorrow at 5 PM")]
    [InlineData("Achievement unlocked: 10 hours studied!")]
    [InlineData("Quick quiz available")]
    public async Task CreateNotification_WithVariousMessages_SuccessfullyCreated(string message)
    {
        // Arrange
        using (var context = CreateDbContext())
        {
            var user = new User { Name = "User", Password = "pwd", Status = true };
            context.Users.Add(user);
            await context.SaveChangesAsync();

            var newNotification = new Notification 
            { 
                NotificationMessage = message, 
                UserId = user.Id
            };

            var controller = new NotificationsController(context);

            // Act
            var result = await controller.CreateNotification(newNotification);

            // Assert
            var createdResult = result.Result as CreatedAtActionResult;
            Assert.NotNull(createdResult);
            var createdNotification = createdResult.Value as Notification;
            Assert.NotNull(createdNotification);
            Assert.Equal(message, createdNotification.NotificationMessage);
            Assert.Equal(user.Id, createdNotification.UserId);
        }
    }

    // Test: Benachrichtigungen von verschiedenen Benutzern filtern
    [Fact]
    public async Task GetNotificationsByUser_FiltersCorrectively_MultipleUsers()
    {
        // Arrange
        using (var context = CreateDbContext())
        {
            var user1 = new User { Name = "User1", Password = "pwd1", Status = true };
            var user2 = new User { Name = "User2", Password = "pwd2", Status = true };
            
            context.Users.Add(user1);
            context.Users.Add(user2);
            
            context.Notifications.Add(new Notification { NotificationMessage = "Notif for User1 #1", User = user1 });
            context.Notifications.Add(new Notification { NotificationMessage = "Notif for User2 #1", User = user2 });
            context.Notifications.Add(new Notification { NotificationMessage = "Notif for User1 #2", User = user1 });
            
            await context.SaveChangesAsync();
            var userId1 = user1.Id;

            var controller = new NotificationsController(context);

            // Act
            var result = await controller.GetNotificationsByUser(userId1);

            // Assert
            var notifications = result.Value?.ToList();
            Assert.NotNull(notifications);
            Assert.Equal(2, notifications.Count);
            Assert.All(notifications, n => Assert.Equal(userId1, n.UserId));
        }
    }

    // Test: GetNotifications mit mehreren Benachrichtigungen
    [Fact]
    public async Task GetNotifications_WithMultipleNotifications_ReturnsAll()
    {
        // Arrange
        using (var context = CreateDbContext())
        {
            var user1 = new User { Name = "User1", Password = "pwd1", Status = true };
            var user2 = new User { Name = "User2", Password = "pwd2", Status = true };
            
            context.Users.Add(user1);
            context.Users.Add(user2);
            
            for (int i = 0; i < 4; i++)
            {
                context.Notifications.Add(new Notification { NotificationMessage = $"User1 Notification {i+1}", User = user1 });
            }
            for (int i = 0; i < 3; i++)
            {
                context.Notifications.Add(new Notification { NotificationMessage = $"User2 Notification {i+1}", User = user2 });
            }
            
            await context.SaveChangesAsync();

            var controller = new NotificationsController(context);

            // Act
            var result = await controller.GetNotifications();

            // Assert
            var notifications = result.Value?.ToList();
            Assert.NotNull(notifications);
            Assert.Equal(7, notifications.Count);
        }
    }
}
