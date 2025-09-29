public interface ICoinLoreService
{
    Task<Dictionary<string, string>> MapSymbolsToIdsAsync(IEnumerable<string> symbols);
    Task<List<CoinLoreTicker>> GetTickersByIdsAsync(IEnumerable<string> ids);

    Task<CoinLoreInfo> GetCoinSentimentAsync(string coin);
}