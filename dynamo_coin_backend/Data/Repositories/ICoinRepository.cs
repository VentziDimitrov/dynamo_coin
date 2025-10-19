public interface ICoinRepository
    {
        Task<PortfolioItem> GetCoinByIdAsync(int id);
        Task<IEnumerable<PortfolioItem>> GetAllCoinsAsync();
        Task AddCoinAsync(PortfolioItem coin);
        Task UpdateCoinAsync(PortfolioItem coin);
        Task DeleteCoinAsync(int id);
    }