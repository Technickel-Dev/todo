using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TodoApi.Data;
using TodoApi.Models;
using Xunit;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using System.Text.Encodings.Web;
using System.Security.Claims;
using System.Net.Http.Headers;

namespace TodoApi.Tests;

public class TodoApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _testFactory;

    public TodoApiTests(WebApplicationFactory<Program> factory)
    {
        _testFactory = factory.WithWebHostBuilder(builder =>
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
    }

    private async Task<HttpClient> GetAuthenticatedClientAsync()
    {
        var client = _testFactory.CreateClient();
        var email = $"test-{Guid.NewGuid()}@example.com";
        var password = "Password123!";

        // Register
        var registerResponse = await client.PostAsJsonAsync("/register", new { email, password });
        registerResponse.EnsureSuccessStatusCode();

        // Login
        var loginResponse = await client.PostAsJsonAsync("/login", new { email, password });
        loginResponse.EnsureSuccessStatusCode();
        
        var tokenData = await loginResponse.Content.ReadFromJsonAsync<TokenResponse>();
        Assert.NotNull(tokenData);

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenData.AccessToken);
        return client;
    }

    private class TokenResponse
    {
        public string TokenType { get; set; } = string.Empty;
        public string AccessToken { get; set; } = string.Empty;
        public int ExpiresIn { get; set; }
        public string RefreshToken { get; set; } = string.Empty;
    }

    [Fact]
    public async Task GetTodos_ReturnsSuccess()
    {
        var client = await GetAuthenticatedClientAsync();
        var response = await client.GetAsync("/todos");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task CreateTodo_AddsTodoToDatabase()
    {
        var client = await GetAuthenticatedClientAsync();
        var newTodo = new TodoItem { Title = "Test Todo", Description = "Test Description" };
        var response = await client.PostAsJsonAsync("/todos", newTodo);
        
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        
        var createdTodo = await response.Content.ReadFromJsonAsync<TodoItem>();
        Assert.NotNull(createdTodo);
        Assert.Equal("Test Todo", createdTodo.Title);
        Assert.True(createdTodo.Id > 0);
    }

    [Fact]
    public async Task SearchTodos_FiltersByTitle()
    {
        var client = await GetAuthenticatedClientAsync();
        // Add specific todos
        await client.PostAsJsonAsync("/todos", new TodoItem { Title = "UniqueTitle123" });
        await client.PostAsJsonAsync("/todos", new TodoItem { Title = "OtherTodo" });

        // Search
        var response = await client.GetAsync("/todos?search=UniqueTitle123");
        var todos = await response.Content.ReadFromJsonAsync<List<TodoItem>>();

        Assert.NotNull(todos);
        Assert.Contains(todos, t => t.Title == "UniqueTitle123");
        Assert.DoesNotContain(todos, t => t.Title == "OtherTodo");
    }

    [Fact]
    public async Task UpdateTodo_ModifiesExistingTodo()
    {
        var client = await GetAuthenticatedClientAsync();
        // Create
        var postResponse = await client.PostAsJsonAsync("/todos", new TodoItem { Title = "Initial" });
        var todo = await postResponse.Content.ReadFromJsonAsync<TodoItem>();
        Assert.NotNull(todo);

        // Update
        todo.Title = "Updated";
        var putResponse = await client.PutAsJsonAsync($"/todos/{todo.Id}", todo);
        Assert.Equal(HttpStatusCode.NoContent, putResponse.StatusCode);

        // Verify
        var getResponse = await client.GetAsync($"/todos/{todo.Id}");
        var updatedTodo = await getResponse.Content.ReadFromJsonAsync<TodoItem>();
        Assert.NotNull(updatedTodo);
        Assert.Equal("Updated", updatedTodo.Title);
    }

    [Fact]
    public async Task DeleteTodo_RemovesTodoFromDatabase()
    {
        var client = await GetAuthenticatedClientAsync();
        // Create
        var postResponse = await client.PostAsJsonAsync("/todos", new TodoItem { Title = "To Be Deleted" });
        var todo = await postResponse.Content.ReadFromJsonAsync<TodoItem>();
        Assert.NotNull(todo);

        // Delete
        var deleteResponse = await client.DeleteAsync($"/todos/{todo.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        // Verify 404
        var getResponse = await client.GetAsync($"/todos/{todo.Id}");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
    }

    [Fact]
    public async Task CreateTodo_ReturnsBadRequest_WhenTitleIsMissing()
    {
        var client = await GetAuthenticatedClientAsync();
        // Try to create a todo with an empty title (which violates the [Required] attribute)
        var invalidTodo = new TodoItem { Title = "", Description = "This should fail validation" };
        var response = await client.PostAsJsonAsync("/todos", invalidTodo);
        
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetTodos_ReturnsUnauthorized_WhenNoAuthHeader()
    {
        // Create a new client from the test factory without the default Authorization header
        var client = _testFactory.CreateClient(); 
        
        var response = await client.GetAsync("/todos");
        
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreateTodo_ReturnsUnauthorized_WhenNoAuthHeader()
    {
        var client = _testFactory.CreateClient();
        var newTodo = new TodoItem { Title = "Unauthorized Item" };
        
        var response = await client.PostAsJsonAsync("/todos", newTodo);
        
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
