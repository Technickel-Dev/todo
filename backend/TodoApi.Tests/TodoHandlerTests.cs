using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using MockQueryable.Moq;
using Moq;
using TodoApi.Data;
using TodoApi.Handlers;
using TodoApi.Models;
using Xunit;

namespace TodoApi.Tests;

public class TodoHandlerTests
{
    private (Mock<TodoDbContext> dbMock, Mock<DbSet<TodoTask>> taskSetMock) GetMocks(List<TodoTask>? initialData = null)
    {
        var data = initialData ?? new List<TodoTask>();
        var mockSet = data.BuildMockDbSet();
        
        var options = new DbContextOptionsBuilder<TodoDbContext>()
            .UseSqlite("DataSource=:memory:")
            .Options;
            
        var dbMock = new Mock<TodoDbContext>(options);
        dbMock.Setup(m => m.Tasks).Returns(mockSet.Object);
        dbMock.Setup(m => m.SaveChangesAsync(default)).ReturnsAsync(1);

        return (dbMock, mockSet);
    }

    [Fact]
    public async Task GetAllTasks_FiltersBySearch()
    {
        var data = new List<TodoTask>
        {
            new TodoTask { Title = "Apple", Description = "Fruit" },
            new TodoTask { Title = "Banana", Description = "Fruit" }
        };
        var (dbMock, _) = GetMocks(data);

        var result = await TodoHandlers.GetAllTasks(dbMock.Object, "Apple", null);
        
        var okResult = Assert.IsType<Ok<List<TodoTask>>>(result);
        Assert.Single(okResult.Value!);
        Assert.Equal("Apple", okResult.Value![0].Title);
    }

    [Fact]
    public async Task GetTaskById_ReturnsNotFound_WhenTaskDoesNotExist()
    {
        var (dbMock, _) = GetMocks();
        
        var result = await TodoHandlers.GetTaskById(999, dbMock.Object);
        
        Assert.IsType<NotFound>(result);
    }

    [Fact]
    public async Task CreateTask_PersistsTask()
    {
        var (dbMock, taskSetMock) = GetMocks();
        var newTask = new TodoTask { Title = "New Task" };

        var result = await TodoHandlers.CreateTask(newTask, dbMock.Object);

        var createdResult = Assert.IsType<Created<TodoTask>>(result);
        Assert.Equal("New Task", createdResult.Value!.Title);
        dbMock.Verify(m => m.SaveChangesAsync(default), Times.Once);
    }

    [Fact]
    public async Task UpdateTask_ModifiesExistingTask()
    {
        var task = new TodoTask { Id = 1, Title = "Old Title", Description = "Old Description" };
        var (dbMock, taskSetMock) = GetMocks(new List<TodoTask> { task });
        
        // FindAsync is tricky with mocks, but MockQueryable helper usually setup it if used correctly.
        // If not, we can setup it manually.
        taskSetMock.Setup(m => m.FindAsync(1)).ReturnsAsync(task);

        var updateInfo = new TodoTask { Title = "New Title", Description = "New Description", IsCompleted = true };
        var result = await TodoHandlers.UpdateTask(1, updateInfo, dbMock.Object);

        Assert.IsType<NoContent>(result);
        Assert.Equal("New Title", task.Title);
        Assert.Equal("New Description", task.Description);
        Assert.True(task.IsCompleted);
        dbMock.Verify(m => m.SaveChangesAsync(default), Times.Once);
    }

    [Fact]
    public async Task DeleteTask_RemovesTask()
    {
        var task = new TodoTask { Id = 1, Title = "To Delete" };
        var (dbMock, taskSetMock) = GetMocks(new List<TodoTask> { task });
        taskSetMock.Setup(m => m.FindAsync(1)).ReturnsAsync(task);

        var result = await TodoHandlers.DeleteTask(task.Id, dbMock.Object);

        Assert.IsType<NoContent>(result);
        taskSetMock.Verify(m => m.Remove(It.IsAny<TodoTask>()), Times.Once);
        dbMock.Verify(m => m.SaveChangesAsync(default), Times.Once);
    }
}
