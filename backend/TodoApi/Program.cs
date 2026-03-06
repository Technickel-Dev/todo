using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.Handlers;
using TodoApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();
builder.Services.AddValidation();

// Configure SQLite
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=todo.db";

// Configure Identity
builder.Services.AddAuthorizationBuilder();
builder.Services.AddDbContext<TodoDbContext>(options =>
    options.UseSqlite(connectionString));

builder.Services.AddIdentityApiEndpoints<IdentityUser>()
    .AddEntityFrameworkStores<TodoDbContext>();


// Add CORS to allow frontend access (if we were going to use a different domain)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
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
app.UseAuthentication();
app.UseAuthorization();

// --- Minimal API Endpoints for Auth ---

app.MapIdentityApi<IdentityUser>();

// --- Minimal API Endpoints for Todos ---

var todos = app.MapGroup("/todos").RequireAuthorization();

todos.MapGet("/", TodoHandlers.GetAllTodos);
todos.MapGet("/{id:int}", TodoHandlers.GetTodoById);
todos.MapPost("/", TodoHandlers.CreateTodo);
todos.MapPut("/{id:int}", TodoHandlers.UpdateTodo);
todos.MapDelete("/{id:int}", TodoHandlers.DeleteTodo);

app.Run();

public partial class Program { }
