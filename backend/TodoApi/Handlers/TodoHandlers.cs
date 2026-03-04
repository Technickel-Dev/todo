using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.Models;

namespace TodoApi.Handlers;

public static class TodoHandlers
{
    public static async Task<IResult> GetAllTasks(TodoDbContext db, string? search, bool? isCompleted)
    {
        var query = db.Tasks.AsQueryable();

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

    public static async Task<IResult> GetTaskById(int id, TodoDbContext db)
    {
        return await db.Tasks.FindAsync(id) is TodoTask task 
            ? Results.Ok(task) 
            : Results.NotFound();
    }

    public static async Task<IResult> CreateTask(TodoTask task, TodoDbContext db)
    {
        db.Tasks.Add(task);
        await db.SaveChangesAsync();
        return Results.Created($"/tasks/{task.Id}", task);
    }

    public static async Task<IResult> UpdateTask(int id, TodoTask inputTask, TodoDbContext db)
    {
        var task = await db.Tasks.FindAsync(id);
        if (task is null) return Results.NotFound();

        task.Title = inputTask.Title;
        task.Description = inputTask.Description;
        task.IsCompleted = inputTask.IsCompleted;

        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    public static async Task<IResult> DeleteTask(int id, TodoDbContext db)
    {
        if (await db.Tasks.FindAsync(id) is TodoTask task)
        {
            db.Tasks.Remove(task);
            await db.SaveChangesAsync();
            return Results.NoContent();
        }
        return Results.NotFound();
    }
}
