using System.Text.Json;

/// <summary>
/// Service for interacting with the CoinLore API to fetch cryptocurrency data.
/// Provides methods to map symbols to CoinLore IDs and retrieve ticker information.
/// </summary>
public class CoinLoreService : ICoinLoreService
{
    private readonly HttpClient _http;
    private readonly ILogger<CoinLoreService> _log;
    private readonly CoinLoreScrapper _scrapper;

    private Dictionary<string, string> map;    

    /// <summary>
    /// Initializes a new instance of the CoinLoreService.
    /// Sets up the HTTP client and logger.
    /// </summary>
    /// <param name="factory">HTTP client factory.</param>
    /// <param name="log">Logger instance.</param>
    public CoinLoreService(IHttpClientFactory factory, ILogger<CoinLoreService> log)
    {
        _http = factory.CreateClient();
        _http.BaseAddress = new Uri("https://api.coinlore.net/api/");
        _log = log;
        _scrapper = new CoinLoreScrapper();
        map = new Dictionary<string, string>();        
    }

    /// <summary>
    /// Maps a list of cryptocurrency symbols to their CoinLore IDs.
    /// Fetches paged data from CoinLore until all symbols are found or data is exhausted.
    /// </summary>
    /// <param name="symbols">Symbols to map.</param>
    /// <returns>Dictionary mapping symbol to CoinLore ID.</returns>
    public async Task<Dictionary<string, string>> MapSymbolsToIdsAsync(IEnumerable<string> symbols)
    {
        var needed = new HashSet<string>(symbols.Select(s => s.ToUpperInvariant()));
        this.map = new Dictionary<string, string>();
        int start = 0, limit = 100;

        while (needed.Count > 0)
        {
            var url = $"/api/tickers/?start={start}&limit={limit}";
            _log.LogInformation("Requesting {Url}", url);
            var resp = await _http.GetFromJsonAsync<TickersResponse>(url);
            if (resp?.Data == null || resp.Data.Count == 0) break;

            foreach (var t in resp.Data)
            {
                if (needed.Contains(t.Symbol.ToUpperInvariant()))
                {
                    this.map[t.Symbol.ToUpperInvariant()] = t.Id;
                    needed.Remove(t.Symbol.ToUpperInvariant());
                }
            }

            if (resp.Data.Count < limit) break;
            start += limit;
            // small delay-safety (CoinLore recommends moderate usage / ~1 req/sec).
            await Task.Delay(1000);
        }

        return this.map;
    }

    /// <summary>
    /// Retrieves ticker information for a list of CoinLore IDs.
    /// </summary>
    /// <param name="ids">CoinLore IDs to fetch.</param>
    /// <returns>List of CoinLoreTicker objects with price and change data.</returns>
    public async Task<List<CoinLoreTicker>> GetTickersByIdsAsync(IEnumerable<string> ids)
    {
        var idCsv = string.Join(",", ids);
        var url = $"/api/ticker/?id={idCsv}";
        _log.LogInformation("Fetching tickers: {Url}", url);
        var tickers = await _http.GetFromJsonAsync<List<object>>(url) ?? new List<object>();
        var retValue = new List<CoinLoreTicker>();
        foreach (var ticker in tickers)
        {
            retValue.Add(new CoinLoreTicker
            {
                Id = ((JsonElement)ticker).GetProperty("id").GetString() ?? "",
                Symbol = ((JsonElement)ticker).GetProperty("symbol").GetString() ?? "",
                Name = ((JsonElement)ticker).GetProperty("name").GetString() ?? "",
                Price_usd = ((JsonElement)ticker).GetProperty("price_usd").GetString() ?? "0",
                Percent_change_24h = ((JsonElement)ticker).GetProperty("percent_change_24h").GetString() ?? "0",
                Percent_change_7d = ((JsonElement)ticker).GetProperty("percent_change_7d").GetString() ?? "0"
            });
        }
        return retValue ?? new List<CoinLoreTicker>();
    }

    public async Task<CoinLoreInfo> GetCoinSentimentAsync(string coin)
    {
        _log.LogInformation("Fetching sentiment for {Coin}", coin);
        var url_daily = $"https://www.coinlore.com/coin/{coin}";
        //Task.Delay(200).Wait();
        var html_daily = await _scrapper.GetHtmlAsync(url_daily);
        _log.LogInformation("Fetched daily analysis HTML, length={Length}", html_daily.Length);
        //Task.Delay(200).Wait();
        var analysis = _scrapper.ExtractAnalysis(html_daily);
        //Task.Delay(200).Wait();
        var monthlyReturn = _scrapper.ExtractMonthlyReturn(html_daily).Split('\n').Where(l => !string.IsNullOrWhiteSpace(l)).ToList();
        //Task.Delay(200).Wait();
        var url_prediction = $"https://www.coinlore.com/coin/{coin}/forecast/price-prediction";
        var prediction = _scrapper.ExtractPricePredition(url_prediction);
        //Task.Delay(500).Wait();

        var info = new CoinLoreInfo
        {
            TodayAnalysis = analysis,
            MonthlyReturns = monthlyReturn,
            Prediction = prediction
        };
        return info;
    }
}
