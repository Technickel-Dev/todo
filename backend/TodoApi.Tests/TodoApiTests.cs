using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using TodoApi.Models;
using Xunit;

namespace TodoApi.Tests;

public class TodoApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public TodoApiTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetTasks_ReturnsSuccess()
    {
        var response = await _client.GetAsync("/tasks");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task CreateTask_AddsTaskToDatabase()
    {
        var newTask = new TodoTask { Title = "Test Task", Description = "Test Description" };
        var response = await _client.PostAsJsonAsync("/tasks", newTask);
        
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        
        var createdTask = await response.Content.ReadFromJsonAsync<TodoTask>();
        Assert.NotNull(createdTask);
        Assert.Equal("Test Task", createdTask.Title);
        Assert.True(createdTask.Id > 0);
    }

    [Fact]
    public async Task SearchTasks_FiltersByTitle()
    {
        // Add specific tasks
        await _client.PostAsJsonAsync("/tasks", new TodoTask { Title = "UniqueTitle123" });
        await _client.PostAsJsonAsync("/tasks", new TodoTask { Title = "OtherTask" });

        // Search
        var response = await _client.GetAsync("/tasks?search=UniqueTitle123");
        var tasks = await response.Content.ReadFromJsonAsync<List<TodoTask>>();

        Assert.NotNull(tasks);
        Assert.Contains(tasks, t => t.Title == "UniqueTitle123");
        Assert.DoesNotContain(tasks, t => t.Title == "OtherTask");
    }

    [Fact]
    public async Task UpdateTask_ModifiesExistingTask()
    {
        // Create
        var postResponse = await _client.PostAsJsonAsync("/tasks", new TodoTask { Title = "Initial" });
        var task = await postResponse.Content.ReadFromJsonAsync<TodoTask>();
        Assert.NotNull(task);

        // Update
        task.Title = "Updated";
        var putResponse = await _client.PutAsJsonAsync($"/tasks/{task.Id}", task);
        Assert.Equal(HttpStatusCode.NoContent, putResponse.StatusCode);

        // Verify
        var getResponse = await _client.GetAsync($"/tasks/{task.Id}");
        var updatedTask = await getResponse.Content.ReadFromJsonAsync<TodoTask>();
        Assert.NotNull(updatedTask);
        Assert.Equal("Updated", updatedTask.Title);
    }

    [Fact]
    public async Task DeleteTask_RemovesTaskFromDatabase()
    {
        // Create
        var postResponse = await _client.PostAsJsonAsync("/tasks", new TodoTask { Title = "To Be Deleted" });
        var task = await postResponse.Content.ReadFromJsonAsync<TodoTask>();
        Assert.NotNull(task);

        // Delete
        var deleteResponse = await _client.DeleteAsync($"/tasks/{task.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        // Verify 404
        var getResponse = await _client.GetAsync($"/tasks/{task.Id}");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
    }
}
