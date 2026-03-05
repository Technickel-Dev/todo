using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.Models;

namespace TodoApi.Handlers;

public static class TodoHandlers
{
    public static async Task<IResult> GetAllTodos(TodoDbContext db, string? search, bool? isCompleted)
    {
        var query = db.Todos.AsQueryable();

        if (isCompleted.HasValue)
        {
            query = query.Where(t => t.IsCompleted == isCompleted.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(t => t.Title.ToLower().Contains(search.ToLower()) || 
                                     t.Description.ToLower().Contains(search.ToLower()));
        }

        var results = await query.OrderByDescending(t => t.CreatedAt).ToListAsync();
        return Results.Ok(results);
    }

    public static async Task<IResult> GetTodoById(int id, TodoDbContext db)
    {
        return await db.Todos.FindAsync(id) is TodoItem todo 
            ? Results.Ok(todo) 
            : Results.NotFound();
    }

    public static async Task<IResult> CreateTodo(TodoItem todo, TodoDbContext db)
    {
        db.Todos.Add(todo);
        await db.SaveChangesAsync();
        return Results.Created($"/todos/{todo.Id}", todo);
    }

    public static async Task<IResult> UpdateTodo(int id, TodoItem inputTodo, TodoDbContext db)
    {
        var todo = await db.Todos.FindAsync(id);
        if (todo is null) return Results.NotFound();

        todo.Title = inputTodo.Title;
        todo.Description = inputTodo.Description;
        todo.IsCompleted = inputTodo.IsCompleted;

        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    public static async Task<IResult> DeleteTodo(int id, TodoDbContext db)
    {
        if (await db.Todos.FindAsync(id) is TodoItem todo)
        {
            db.Todos.Remove(todo);
            await db.SaveChangesAsync();
            return Results.NoContent();
        }
        return Results.NotFound();
    }
}
