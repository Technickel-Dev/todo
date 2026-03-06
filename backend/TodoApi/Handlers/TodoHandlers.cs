using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.Models;

namespace TodoApi.Handlers;

public static class TodoHandlers
{
    public static async Task<IResult> GetAllTodos(TodoDbContext db, ClaimsPrincipal user, string? search, bool? isCompleted)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var query = db.Todos.Where(todo => todo.UserId == userId).AsQueryable();

        if (isCompleted.HasValue)
        {
            query = query.Where(todo => todo.IsCompleted == isCompleted.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(todo => todo.Title.ToLower().Contains(search.ToLower()) || 
                                     todo.Description.ToLower().Contains(search.ToLower()));
        }

        var results = await query.OrderByDescending(todo => todo.CreatedAt).ToListAsync();
        return Results.Ok(results);
    }

    public static async Task<IResult> GetTodoById(int id, TodoDbContext db, ClaimsPrincipal user)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier)!;
        return await db.Todos.FirstOrDefaultAsync(todo => todo.Id == id && todo.UserId == userId) is TodoItem item 
            ? Results.Ok(item) 
            : Results.NotFound();
    }

    public static async Task<IResult> CreateTodo(TodoItem todo, TodoDbContext db, ClaimsPrincipal user)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier)!;
        todo.UserId = userId;
        
        db.Todos.Add(todo);
        await db.SaveChangesAsync();
        return Results.Created($"/todos/{todo.Id}", todo);
    }

    public static async Task<IResult> UpdateTodo(int id, TodoItem inputTodo, TodoDbContext db, ClaimsPrincipal user)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var existingTodo = await db.Todos.FirstOrDefaultAsync(todo => todo.Id == id && todo.UserId == userId);
        if (existingTodo is null) return Results.NotFound();

        existingTodo.Title = inputTodo.Title;
        existingTodo.Description = inputTodo.Description;
        existingTodo.IsCompleted = inputTodo.IsCompleted;

        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    public static async Task<IResult> DeleteTodo(int id, TodoDbContext db, ClaimsPrincipal user)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier)!;
        if (await db.Todos.FirstOrDefaultAsync(todo => todo.Id == id && todo.UserId == userId) is TodoItem item)
        {
            db.Todos.Remove(item);
            await db.SaveChangesAsync();
            return Results.NoContent();
        }
        return Results.NotFound();
    }
}
