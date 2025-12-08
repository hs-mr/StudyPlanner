using Xunit;
using Microsoft.EntityFrameworkCore;
using StudyPlanner.Api.Controllers;
using StudyPlanner.Api.Data;
using StudyPlanner.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace StudyPlanner.Api.Tests;

public class PlansControllerTests
{
    private StudyPlannerContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<StudyPlannerContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new StudyPlannerContext(options);
    }

    // Test: GetPlans - Liefert alle Pläne mit ihren Benutzern
    [Fact]
    public async Task GetPlans_ReturnsAllPlans_WithUsers()
    {
        // Arrange
        using (var context = CreateDbContext())
        {
            var user1 = new User { Name = "User1", Password = "pwd1", Status = true };
            var user2 = new User { Name = "User2", Password = "pwd2", Status = false };
            
            context.Users.Add(user1);
            context.Users.Add(user2);
            
            context.Plans.Add(new Plan { PlanTheme = "Study Mathematics", PlanStatus = false, User = user1 });
            context.Plans.Add(new Plan { PlanTheme = "Learn C#", PlanStatus = true, Notes = "Advanced topics", User = user2 });
            
            await context.SaveChangesAsync();

            var controller = new PlansController(context);

            // Act
            var result = await controller.GetPlans();

            // Assert
            Assert.NotNull(result);
            var plans = result.Value?.ToList();
            Assert.NotNull(plans);
            Assert.Equal(2, plans.Count);
            Assert.Equal("Study Mathematics", plans[0].PlanTheme);
            Assert.Equal("Learn C#", plans[1].PlanTheme);
            Assert.False(plans[0].PlanStatus);
            Assert.True(plans[1].PlanStatus);
        }
    }

    // Test: GetPlansByUser - Liefert alle Pläne für einen Benutzer
    [Fact]
    public async Task GetPlansByUser_WithValidUserId_ReturnsPlansByUser()
    {
        // Arrange
        using (var context = CreateDbContext())
        {
            var user = new User { Name = "TestUser", Password = "pwd123", Status = true };
            context.Users.Add(user);
            context.Plans.Add(new Plan { PlanTheme = "Plan A", PlanStatus = false, User = user });
            context.Plans.Add(new Plan { PlanTheme = "Plan B", PlanStatus = true, Notes = "Nearly complete", User = user });
            context.Plans.Add(new Plan { PlanTheme = "OtherUserPlan", PlanStatus = false });
            
            await context.SaveChangesAsync();
            var userId = user.Id;

            var controller = new PlansController(context);

            // Act
            var result = await controller.GetPlansByUser(userId);

            // Assert
            Assert.NotNull(result);
            var plans = result.Value?.ToList();
            Assert.NotNull(plans);
            Assert.Equal(2, plans.Count);
            Assert.All(plans, p => Assert.Equal(userId, p.UserId));
            Assert.Equal("Plan A", plans[0].PlanTheme);
            Assert.Equal("Plan B", plans[1].PlanTheme);
        }
    }

    // Test: GetPlansByUser - Liefert leere Liste wenn Benutzer keine Pläne hat
    [Fact]
    public async Task GetPlansByUser_WithNoPlans_ReturnsEmptyList()
    {
        // Arrange
        using (var context = CreateDbContext())
        {
            var controller = new PlansController(context);

            // Act
            var result = await controller.GetPlansByUser(999);

            // Assert
            Assert.NotNull(result);
            var plans = result.Value?.ToList();
            Assert.NotNull(plans);
            Assert.Empty(plans);
        }
    }

    // Test: CreatePlan - Erstellt neuen Plan erfolgreich
    [Fact]
    public async Task CreatePlan_WithValidPlan_ReturnsCreatedAtAction()
    {
        // Arrange
        using (var context = CreateDbContext())
        {
            var user = new User { Name = "TestUser", Password = "pwd123", Status = true };
            context.Users.Add(user);
            await context.SaveChangesAsync();

            var newPlan = new Plan 
            { 
                PlanTheme = "New Study Plan", 
                PlanStatus = false, 
                UserId = user.Id,
                Notes = "Important topics"
            };

            var controller = new PlansController(context);

            // Act
            var result = await controller.CreatePlan(newPlan);

            // Assert
            Assert.NotNull(result);
            Assert.IsType<CreatedAtActionResult>(result.Result);
            var createdResult = result.Result as CreatedAtActionResult;
            Assert.NotNull(createdResult);
            Assert.Equal(nameof(controller.GetPlans), createdResult.ActionName);
        }
    }

    // Test: CreatePlan - Liefert BadRequest wenn Benutzer nicht existiert
    [Fact]
    public async Task CreatePlan_WithNonexistentUser_ReturnsBadRequest()
    {
        // Arrange
        using (var context = CreateDbContext())
        {
            var newPlan = new Plan 
            { 
                PlanTheme = "Plan for nonexistent user", 
                PlanStatus = false, 
                UserId = 999
            };

            var controller = new PlansController(context);

            // Act
            var result = await controller.CreatePlan(newPlan);

            // Assert
            Assert.NotNull(result);
            Assert.IsType<BadRequestObjectResult>(result.Result);
            var badRequest = result.Result as BadRequestObjectResult;
            Assert.NotNull(badRequest);
            Assert.Equal("User does not exist", badRequest.Value);
        }
    }

    // Test: UpdatePlan - Aktualisiert Plan erfolgreich
    [Fact]
    public async Task UpdatePlan_WithValidData_ReturnsNoContent()
    {
        // Arrange
        using (var context = CreateDbContext())
        {
            var user = new User { Name = "User", Password = "pwd", Status = true };
            var plan = new Plan { PlanTheme = "Original Plan", PlanStatus = false, User = user };
            
            context.Users.Add(user);
            context.Plans.Add(plan);
            await context.SaveChangesAsync();

            var planId = plan.Id;
            var userId = user.Id;
            
            // Detach the original plan to avoid tracking conflicts
            context.Entry(plan).State = EntityState.Detached;
            
            var updatedPlan = new Plan 
            { 
                Id = planId, 
                PlanTheme = "Updated Plan Theme", 
                PlanStatus = true, 
                UserId = userId,
                Notes = "Updated notes"
            };

            var controller = new PlansController(context);

            // Act
            var result = await controller.UpdatePlan(planId, updatedPlan);

            // Assert
            Assert.IsType<NoContentResult>(result);
            
            // Verify the update (reload from database)
            context.ChangeTracker.Clear();
            var dbPlan = await context.Plans.FindAsync(planId);
            Assert.NotNull(dbPlan);
            Assert.Equal("Updated Plan Theme", dbPlan.PlanTheme);
        }
    }

    // Test: UpdatePlan - Liefert BadRequest wenn IDs nicht übereinstimmen
    [Fact]
    public async Task UpdatePlan_WithMismatchedIds_ReturnsBadRequest()
    {
        // Arrange
        using (var context = CreateDbContext())
        {
            var planId = 1;
            var plan = new Plan { Id = 2, PlanTheme = "Test Plan", PlanStatus = false, UserId = 1 };
            var controller = new PlansController(context);

            // Act
            var result = await controller.UpdatePlan(planId, plan);

            // Assert
            Assert.IsType<BadRequestResult>(result);
        }
    }

    // Test: DeletePlan - Löscht Plan erfolgreich
    [Fact]
    public async Task DeletePlan_WithValidId_ReturnsNoContent()
    {
        // Arrange
        using (var context = CreateDbContext())
        {
            var user = new User { Name = "User", Password = "pwd", Status = true };
            var plan = new Plan { PlanTheme = "Plan to delete", PlanStatus = false, User = user };
            
            context.Users.Add(user);
            context.Plans.Add(plan);
            await context.SaveChangesAsync();

            var planId = plan.Id;
            var controller = new PlansController(context);

            // Act
            var result = await controller.DeletePlan(planId);

            // Assert
            Assert.IsType<NoContentResult>(result);
            
            var deletedPlan = await context.Plans.FindAsync(planId);
            Assert.Null(deletedPlan);
        }
    }

    // Test: DeletePlan - Liefert NotFound wenn Plan nicht existiert
    [Fact]
    public async Task DeletePlan_WithInvalidId_ReturnsNotFound()
    {
        // Arrange
        using (var context = CreateDbContext())
        {
            var controller = new PlansController(context);

            // Act
            var result = await controller.DeletePlan(999);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }
    }

    // Test: Pläne mit verschiedenen Zuständen (Theory Test)
    [Theory]
    [InlineData("Math Basics", true)]
    [InlineData("Advanced Physics", false)]
    [InlineData("Chemistry", true)]
    public async Task CreatePlan_WithVariousStatuses_SuccessfullyCreated(string theme, bool status)
    {
        // Arrange
        using (var context = CreateDbContext())
        {
            var user = new User { Name = "User", Password = "pwd", Status = true };
            context.Users.Add(user);
            await context.SaveChangesAsync();

            var newPlan = new Plan 
            { 
                PlanTheme = theme, 
                PlanStatus = status, 
                UserId = user.Id
            };

            var controller = new PlansController(context);

            // Act
            var result = await controller.CreatePlan(newPlan);

            // Assert
            var createdResult = result.Result as CreatedAtActionResult;
            Assert.NotNull(createdResult);
            var createdPlan = createdResult.Value as Plan;
            Assert.NotNull(createdPlan);
            Assert.Equal(theme, createdPlan.PlanTheme);
            Assert.Equal(status, createdPlan.PlanStatus);
        }
    }

    // Test: GetPlans mit mehreren Plänen von verschiedenen Usern
    [Fact]
    public async Task GetPlans_WithMultiplePlans_ReturnsAll()
    {
        // Arrange
        using (var context = CreateDbContext())
        {
            var user1 = new User { Name = "User1", Password = "pwd1", Status = true };
            var user2 = new User { Name = "User2", Password = "pwd2", Status = true };
            
            context.Users.Add(user1);
            context.Users.Add(user2);
            
            for (int i = 0; i < 3; i++)
            {
                context.Plans.Add(new Plan { PlanTheme = $"Plan {i+1}", PlanStatus = i % 2 == 0, User = user1 });
            }
            for (int i = 0; i < 2; i++)
            {
                context.Plans.Add(new Plan { PlanTheme = $"Plan User2-{i+1}", PlanStatus = true, User = user2 });
            }
            
            await context.SaveChangesAsync();

            var controller = new PlansController(context);

            // Act
            var result = await controller.GetPlans();

            // Assert
            var plans = result.Value?.ToList();
            Assert.NotNull(plans);
            Assert.Equal(5, plans.Count);
        }
    }
}
