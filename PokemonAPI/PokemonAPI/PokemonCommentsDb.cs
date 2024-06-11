using Microsoft.EntityFrameworkCore;

namespace PokemonAPI
{
    public class PokemonCommentsDb : DbContext
    {
        public PokemonCommentsDb(DbContextOptions<PokemonCommentsDb> options)
            : base(options) { }

        public DbSet<PokemonComment> PokemonComments => Set<PokemonComment>();
    }
}
