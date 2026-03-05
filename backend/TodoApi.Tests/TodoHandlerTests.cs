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
    private (Mock<TodoDbContext> dbMock, Mock<DbSet<TodoItem>> todoSetMock) GetMocks(List<TodoItem>? initialData = null)
    {
        var data = initialData ?? new List<TodoItem>();
        var mockSet = data.BuildMockDbSet();
        
        var options = new DbContextOptionsBuilder<TodoDbContext>()
            .UseSqlite("DataSource=:memory:")
            .Options;
            
        var dbMock = new Mock<TodoDbContext>(options);
        dbMock.Setup(m => m.Todos).Returns(mockSet.Object);
        dbMock.Setup(m => m.SaveChangesAsync(default)).ReturnsAsync(1);

        return (dbMock, mockSet);
    }

    [Fact]
    public async Task GetAllTodos_FiltersBySearch()
    {
        var data = new List<TodoItem>
        {
            new TodoItem { Title = "Apple", Description = "Fruit" },
            new TodoItem { Title = "Banana", Description = "Fruit" }
        };
        var (dbMock, _) = GetMocks(data);

        var result = await TodoHandlers.GetAllTodos(dbMock.Object, "Apple", null);
        
        var okResult = Assert.IsType<Ok<List<TodoItem>>>(result);
        Assert.Single(okResult.Value!);
        Assert.Equal("Apple", okResult.Value![0].Title);
    }

    [Fact]
    public async Task GetTodoById_ReturnsNotFound_WhenTodoDoesNotExist()
    {
        var (dbMock, _) = GetMocks();
        
        var result = await TodoHandlers.GetTodoById(999, dbMock.Object);
        
        Assert.IsType<NotFound>(result);
    }

    [Fact]
    public async Task CreateTodo_PersistsTodo()
    {
        var (dbMock, todoSetMock) = GetMocks();
        var newTodo = new TodoItem { Title = "New Todo" };

        var result = await TodoHandlers.CreateTodo(newTodo, dbMock.Object);

        var createdResult = Assert.IsType<Created<TodoItem>>(result);
        Assert.Equal("New Todo", createdResult.Value!.Title);
        dbMock.Verify(m => m.SaveChangesAsync(default), Times.Once);
    }

    [Fact]
    public async Task UpdateTodo_ModifiesExistingTodo()
    {
        var todo = new TodoItem { Id = 1, Title = "Old Title", Description = "Old Description" };
        var (dbMock, todoSetMock) = GetMocks(new List<TodoItem> { todo });
        
        // FindAsync is tricky with mocks, but MockQueryable helper usually setup it if used correctly.
        // If not, we can setup it manually.
        todoSetMock.Setup(m => m.FindAsync(1)).ReturnsAsync(todo);

        var updateInfo = new TodoItem { Title = "New Title", Description = "New Description", IsCompleted = true };
        var result = await TodoHandlers.UpdateTodo(1, updateInfo, dbMock.Object);

        Assert.IsType<NoContent>(result);
        Assert.Equal("New Title", todo.Title);
        Assert.Equal("New Description", todo.Description);
        Assert.True(todo.IsCompleted);
        dbMock.Verify(m => m.SaveChangesAsync(default), Times.Once);
    }

    [Fact]
    public async Task DeleteTodo_RemovesTodo()
    {
        var todo = new TodoItem { Id = 1, Title = "To Delete" };
        var (dbMock, todoSetMock) = GetMocks(new List<TodoItem> { todo });
        todoSetMock.Setup(m => m.FindAsync(1)).ReturnsAsync(todo);

        var result = await TodoHandlers.DeleteTodo(todo.Id, dbMock.Object);

        Assert.IsType<NoContent>(result);
        todoSetMock.Verify(m => m.Remove(It.IsAny<TodoItem>()), Times.Once);
        dbMock.Verify(m => m.SaveChangesAsync(default), Times.Once);
    }
}
