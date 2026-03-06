using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using MockQueryable.Moq;
using Moq;
using TodoApi.Data;
using TodoApi.Handlers;
using TodoApi.Models;
using Xunit;
using System.Security.Claims;

namespace TodoApi.Tests;

public class TodoHandlerTests
{
    private (Mock<TodoDbContext> dbMock, Mock<DbSet<TodoItem>> todoSetMock) GetMocks(List<TodoItem>? initialData = null)
    {
        var data = initialData ?? new List<TodoItem>();
        var mockSet = data.BuildMockDbSet();
        
        // Use empty options - we are mocking the context behaviors anyway
        var options = new DbContextOptions<TodoDbContext>();
            
        var dbMock = new Mock<TodoDbContext>(options);
        dbMock.Setup(m => m.Todos).Returns(mockSet.Object);
        dbMock.Setup(m => m.SaveChangesAsync(default)).ReturnsAsync(1);

        return (dbMock, mockSet);
    }

    private ClaimsPrincipal GetMockUser(string userId = "test-user-id")
    {
        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, userId) };
        var identity = new ClaimsIdentity(claims, "Test");
        return new ClaimsPrincipal(identity);
    }

    [Fact]
    public async Task GetAllTodos_FiltersBySearch()
    {
        var data = new List<TodoItem>
        {
            new TodoItem { Title = "Apple", Description = "Fruit", UserId = "test-user-id" },
            new TodoItem { Title = "Banana", Description = "Fruit", UserId = "test-user-id" },
            new TodoItem { Title = "Orange", Description = "Fruit", UserId = "other-user-id" }
        };
        var (dbMock, _) = GetMocks(data);
        var user = GetMockUser();

        var result = await TodoHandlers.GetAllTodos(dbMock.Object, user, "Apple", null);
        
        var okResult = Assert.IsType<Ok<List<TodoItem>>>(result);
        Assert.Single(okResult.Value!);
        Assert.Equal("Apple", okResult.Value![0].Title);
        Assert.Equal("test-user-id", okResult.Value![0].UserId);
    }

    [Fact]
    public async Task GetTodoById_ReturnsNotFound_WhenTodoDoesNotExist()
    {
        var (dbMock, _) = GetMocks();
        var user = GetMockUser();
        
        var result = await TodoHandlers.GetTodoById(999, dbMock.Object, user);
        
        Assert.IsType<NotFound>(result);
    }

    [Fact]
    public async Task CreateTodo_PersistsTodo()
    {
        var (dbMock, todoSetMock) = GetMocks();
        var newTodo = new TodoItem { Title = "New Todo" };
        var user = GetMockUser();

        var result = await TodoHandlers.CreateTodo(newTodo, dbMock.Object, user);

        var createdResult = Assert.IsType<Created<TodoItem>>(result);
        Assert.Equal("New Todo", createdResult.Value!.Title);
        Assert.Equal("test-user-id", createdResult.Value!.UserId);
        dbMock.Verify(m => m.SaveChangesAsync(default), Times.Once);
    }

    [Fact]
    public async Task CreateTodo_AlwaysSetsUserIdToCurrentUser()
    {
        // Arrange
        var (dbMock, _) = GetMocks();
        var user = GetMockUser();
        var newTodo = new TodoItem { Title = "New Todo", UserId = "malicious-id" }; // Setting to a different ID to see if it gets overridden

        // Act
        var result = await TodoHandlers.CreateTodo(newTodo, dbMock.Object, user);

        // Assert
        var createdResult = Assert.IsType<Created<TodoItem>>(result);
        Assert.Equal("test-user-id", createdResult.Value!.UserId); // Should be overridden by the claim
        dbMock.Verify(m => m.SaveChangesAsync(default), Times.Once);
    }

    [Fact]
    public async Task UpdateTodo_ModifiesExistingTodo()
    {
        var todo = new TodoItem { Id = 1, Title = "Old Title", Description = "Old Description", UserId = "test-user-id" };
        var (dbMock, todoSetMock) = GetMocks(new List<TodoItem> { todo });
        var user = GetMockUser();

        var updateInfo = new TodoItem { Title = "New Title", Description = "New Description", IsCompleted = true };
        var result = await TodoHandlers.UpdateTodo(1, updateInfo, dbMock.Object, user);

        Assert.IsType<NoContent>(result);
        Assert.Equal("New Title", todo.Title);
        Assert.Equal("New Description", todo.Description);
        Assert.True(todo.IsCompleted);
        dbMock.Verify(m => m.SaveChangesAsync(default), Times.Once);
    }

    [Fact]
    public async Task DeleteTodo_RemovesTodo()
    {
        var todo = new TodoItem { Id = 1, Title = "To Delete", UserId = "test-user-id" };
        var (dbMock, todoSetMock) = GetMocks(new List<TodoItem> { todo });
        var user = GetMockUser();

        var result = await TodoHandlers.DeleteTodo(todo.Id, dbMock.Object, user);

        Assert.IsType<NoContent>(result);
        todoSetMock.Verify(m => m.Remove(It.IsAny<TodoItem>()), Times.Once);
        dbMock.Verify(m => m.SaveChangesAsync(default), Times.Once);
    }
}
