using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TodoApi.Data;
using TodoApi.Models;
using Xunit;

namespace TodoApi.Tests;

public class TodoApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public TodoApiTests(WebApplicationFactory<Program> factory)
    {
        // For every test class instance (which xUnit creates for every [Fact]),
        // we create a fresh in-memory database by overriding the factory configuration.
        var testFactory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Remove the app's real DbContext registration
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<TodoDbContext>));
                if (descriptor != null) services.Remove(descriptor);

                // Create and open a new in-memory SQLite connection
                var connection = new SqliteConnection("DataSource=:memory:");
                connection.Open();

                // Add the DbContext using the in-memory connection
                services.AddDbContext<TodoDbContext>(options =>
                {
                    options.UseSqlite(connection);
                });

                // Ensure the database schema is created for this fresh connection
                var sp = services.BuildServiceProvider();
                using var scope = sp.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<TodoDbContext>();
                db.Database.EnsureCreated();
            });
        });

        _client = testFactory.CreateClient();
    }

    [Fact]
    public async Task GetTodos_ReturnsSuccess()
    {
        var response = await _client.GetAsync("/todos");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task CreateTodo_AddsTodoToDatabase()
    {
        var newTodo = new TodoItem { Title = "Test Todo", Description = "Test Description" };
        var response = await _client.PostAsJsonAsync("/todos", newTodo);
        
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        
        var createdTodo = await response.Content.ReadFromJsonAsync<TodoItem>();
        Assert.NotNull(createdTodo);
        Assert.Equal("Test Todo", createdTodo.Title);
        Assert.True(createdTodo.Id > 0);
    }

    [Fact]
    public async Task SearchTodos_FiltersByTitle()
    {
        // Add specific todos
        await _client.PostAsJsonAsync("/todos", new TodoItem { Title = "UniqueTitle123" });
        await _client.PostAsJsonAsync("/todos", new TodoItem { Title = "OtherTodo" });

        // Search
        var response = await _client.GetAsync("/todos?search=UniqueTitle123");
        var todos = await response.Content.ReadFromJsonAsync<List<TodoItem>>();

        Assert.NotNull(todos);
        Assert.Contains(todos, t => t.Title == "UniqueTitle123");
        Assert.DoesNotContain(todos, t => t.Title == "OtherTodo");
    }

    [Fact]
    public async Task UpdateTodo_ModifiesExistingTodo()
    {
        // Create
        var postResponse = await _client.PostAsJsonAsync("/todos", new TodoItem { Title = "Initial" });
        var todo = await postResponse.Content.ReadFromJsonAsync<TodoItem>();
        Assert.NotNull(todo);

        // Update
        todo.Title = "Updated";
        var putResponse = await _client.PutAsJsonAsync($"/todos/{todo.Id}", todo);
        Assert.Equal(HttpStatusCode.NoContent, putResponse.StatusCode);

        // Verify
        var getResponse = await _client.GetAsync($"/todos/{todo.Id}");
        var updatedTodo = await getResponse.Content.ReadFromJsonAsync<TodoItem>();
        Assert.NotNull(updatedTodo);
        Assert.Equal("Updated", updatedTodo.Title);
    }

    [Fact]
    public async Task DeleteTodo_RemovesTodoFromDatabase()
    {
        // Create
        var postResponse = await _client.PostAsJsonAsync("/todos", new TodoItem { Title = "To Be Deleted" });
        var todo = await postResponse.Content.ReadFromJsonAsync<TodoItem>();
        Assert.NotNull(todo);

        // Delete
        var deleteResponse = await _client.DeleteAsync($"/todos/{todo.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        // Verify 404
        var getResponse = await _client.GetAsync($"/todos/{todo.Id}");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
    }

    [Fact]
    public async Task CreateTodo_ReturnsBadRequest_WhenTitleIsMissing()
    {
        // Try to create a todo with an empty title (which violates the [Required] attribute)
        var invalidTodo = new TodoItem { Title = "", Description = "This should fail validation" };
        var response = await _client.PostAsJsonAsync("/todos", invalidTodo);
        
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
