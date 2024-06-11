using Microsoft.EntityFrameworkCore;
using PokemonAPI;

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<PokemonCommentsDb>(opt => opt.UseInMemoryDatabase("PokemonComments"));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy =>
                      {
                          policy.WithOrigins("http://localhost:3000").AllowAnyHeader().AllowAnyOrigin();
                      });
});
var app = builder.Build();

app.MapPost("/comments", async (PokemonComment comment, PokemonCommentsDb db) =>
{
    db.PokemonComments.Add(comment);
    await db.SaveChangesAsync();
    return Results.Created($"/comments{comment.Id}", comment);
});

app.MapGet("/comments/{id}", async (int id, PokemonCommentsDb db) =>
    await db.PokemonComments.FindAsync(id)
        is PokemonComment comment ? Results.Ok(comment) : Results.NoContent());

app.MapGet("/", () => "Hello World!");

app.UseCors(MyAllowSpecificOrigins);
app.Run();
