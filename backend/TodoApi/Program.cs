using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.Models;
using TodoApi.Handlers;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();

// Configure SQLite
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=todo.db";
builder.Services.AddDbContext<TodoDbContext>(options =>
    options.UseSqlite(connectionString));

// Add CORS to allow frontend access
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Automatically create the database on startup for zero-friction
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TodoDbContext>();
    db.Database.EnsureCreated();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors();

// --- Minimal API Endpoints for Tasks ---

var tasks = app.MapGroup("/tasks");

tasks.MapGet("/", TodoHandlers.GetAllTasks);
tasks.MapGet("/{id:int}", TodoHandlers.GetTaskById);
tasks.MapPost("/", TodoHandlers.CreateTask);
tasks.MapPut("/{id:int}", TodoHandlers.UpdateTask);
tasks.MapDelete("/{id:int}", TodoHandlers.DeleteTask);

app.Run();

public partial class Program { }
