using Microsoft.EntityFrameworkCore;

public class CoinRepository : ICoinRepository
    {
        private readonly ApplicationDbContext _context;

        public CoinRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PortfolioItem> GetCoinByIdAsync(int id)
        {
            return await _context.PortfolioItems.FindAsync(id);
        }

        public async Task<IEnumerable<PortfolioItem>> GetAllCoinsAsync()
        {
            return await _context.PortfolioItems.ToListAsync();
        }

        public async Task AddCoinAsync(PortfolioItem coin)
        {
            await _context.PortfolioItems.AddAsync(coin);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateCoinAsync(PortfolioItem coin)
        {
            _context.PortfolioItems.Update(coin);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteCoinAsync(int id)
        {
            var coin = await GetCoinByIdAsync(id);
            if (coin != null)
            {
                _context.PortfolioItems.Remove(coin);
                await _context.SaveChangesAsync();
            }
        }
    }