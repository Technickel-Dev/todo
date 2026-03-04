using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.Handlers;
using TodoApi.Models;
using Xunit;

namespace TodoApi.Tests;

public class TodoHandlerTests
{
    private TodoDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<TodoDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        
        return new TodoDbContext(options);
    }

    [Fact]
    public async Task GetAllTasks_FiltersBySearch()
    {
        using var db = GetDbContext();
        db.Tasks.Add(new TodoTask { Title = "Apple", Description = "Fruit" });
        db.Tasks.Add(new TodoTask { Title = "Banana", Description = "Fruit" });
        await db.SaveChangesAsync();

        var result = await TodoHandlers.GetAllTasks(db, "Apple", null);
        
        var okResult = Assert.IsType<Ok<List<TodoTask>>>(result);
        Assert.Single(okResult.Value!);
        Assert.Equal("Apple", okResult.Value![0].Title);
    }

    [Fact]
    public async Task GetTaskById_ReturnsNotFound_WhenTaskDoesNotExist()
    {
        using var db = GetDbContext();
        
        var result = await TodoHandlers.GetTaskById(999, db);
        
        Assert.IsType<NotFound>(result);
    }

    [Fact]
    public async Task CreateTask_PersistsTask()
    {
        using var db = GetDbContext();
        var newTask = new TodoTask { Title = "New Task" };

        var result = await TodoHandlers.CreateTask(newTask, db);

        var createdResult = Assert.IsType<Created<TodoTask>>(result);
        Assert.Equal("New Task", createdResult.Value!.Title);
        Assert.Equal(1, await db.Tasks.CountAsync());
    }

    [Fact]
    public async Task UpdateTask_ModifiesExistingTask()
    {
        using var db = GetDbContext();
        var task = new TodoTask { Title = "Old Title", Description = "Old Description" };
        db.Tasks.Add(task);
        await db.SaveChangesAsync();

        var updateInfo = new TodoTask { Title = "New Title", Description = "New Description", IsCompleted = true };
        var result = await TodoHandlers.UpdateTask(task.Id, updateInfo, db);

        Assert.IsType<NoContent>(result);
        var updated = await db.Tasks.FindAsync(task.Id);
        Assert.NotNull(updated);
        Assert.Equal("New Title", updated.Title);
        Assert.True(updated.IsCompleted);
    }

    [Fact]
    public async Task DeleteTask_RemovesTask()
    {
        using var db = GetDbContext();
        var task = new TodoTask { Title = "To Delete" };
        db.Tasks.Add(task);
        await db.SaveChangesAsync();

        var result = await TodoHandlers.DeleteTask(task.Id, db);

        Assert.IsType<NoContent>(result);
        Assert.Equal(0, await db.Tasks.CountAsync());
    }
}
