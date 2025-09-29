using System.Globalization;
using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Controller for managing and calculating cryptocurrency portfolio data.
/// Provides endpoints to refresh portfolio values and upload new portfolio files.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class PortfolioController : ControllerBase
{
    private readonly ICoinLoreService _coin;
    private readonly ILogger<PortfolioController> _log;
    private List<PortfolioItem> _currentPortfolio = new();
    private IEnumerable<string> _symbolIds = Enumerable.Empty<string>();    
    private FileStorageManager _storage;

    private readonly OpenAiService _openAi;

    public PortfolioController(ICoinLoreService coin, ILogger<PortfolioController> log, IConfiguration config)
    {
        _coin = coin;
        _log = log;
        _storage = new FileStorageManager();
        _openAi = new OpenAiService(config["OpenAI:ApiKey"] ?? throw new ArgumentNullException("OpenAI:ApiKey"));
        var cashed = _storage.GetPortfolioAsync().Result;
        _currentPortfolio = cashed.Items;
        var symbols = _currentPortfolio.Select(p => p.Symbol.ToUpperInvariant()).Distinct();
        var map = _coin.MapSymbolsToIdsAsync(symbols).Result;

        this._symbolIds = map.Values.Distinct();
    }

    /// <summary>
    /// Refreshes the portfolio by recalculating current values and changes.
    /// </summary>
    /// <returns>Updated portfolio result.</returns>
    [HttpGet("refresh")]
    public async Task<IActionResult> Refresh()
    {
        _log.LogInformation("Refreshing portfolio...");

        var result = await _calculatePortfolio();

        _log.LogInformation("Computed portfolio: total={Total} change={Change}", result.TotalValueUsd, result.TotalChangeUsd);

        return Ok(result);
    }

    /// <summary>
    /// Uploads a new portfolio file, parses its contents, and recalculates portfolio values.
    /// </summary>
    /// <param name="file">Portfolio file to upload.</param>
    /// <returns>Updated portfolio result.</returns>
    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file == null) return BadRequest("No file");

        _log.LogInformation("Received file {FileName}", file.FileName);
        this._currentPortfolio.Clear();

        using (var sr = new StreamReader(file.OpenReadStream()))
        {
            while (!sr.EndOfStream)
            {
                var line = (await sr.ReadLineAsync())?.Trim();
                if (string.IsNullOrWhiteSpace(line)) continue;

                var coin = _parseLine(line);
                this._currentPortfolio.Add(coin);
            }
        }

        _log.LogInformation("Parsed {Count} portfolio items", this._currentPortfolio.Count);

        var symbols = this._currentPortfolio.Select(p => p.Symbol.ToUpperInvariant()).Distinct();
        var map = await _coin.MapSymbolsToIdsAsync(symbols);

        this._symbolIds = map.Values.Distinct();
        var result = await _calculatePortfolio();
        var portfolio = new Portfolio
        {
            Id = 0,
            Items = result.Coins.Select(c => new PortfolioItem
            {
                Symbol = c.Symbol,
                Amount = c.Amount,
                PurchasePriceUsd = c.BuyPriceUsd
            }).ToList()
        };
        await this._storage.SaveAsync(new List<Portfolio> { portfolio });

        _log.LogInformation("Computed portfolio: total={Total} change={Change}", result.TotalValueUsd, result.TotalChangeUsd);
        return Ok(result);
    }

    [HttpGet("analyse")]
    public async Task<IActionResult> Analyse(string coin)
    {
        _log.LogInformation("Getting sentiment for {Coin}", coin);
        var result = await _coin.GetCoinSentimentAsync(coin);
        var dataToAnalyze = new CoinLoreInfo
        {
            TodayAnalysis = result.TodayAnalysis,
            Prediction = result.Prediction,
            MonthlyReturns = result.MonthlyReturns
        };
        //_log.LogInformation("Sentiment for {Coin}: {Sentiment}", coin, dataToAnalyze.ToString());

        var analysis = await _openAi.AnalyzeAsync(coin, dataToAnalyze.TodayAnalysis, string.Join(",", dataToAnalyze.MonthlyReturns), dataToAnalyze.Prediction);
        _log.LogInformation("OpenAI analysis result: {Analysis}", analysis);
        return Ok(new
        { 
            OpenAiAnalysis = analysis
        });
    }

     /// <summary>
    /// Download newest crypto data and calculates the current portfolio values and changes.
    /// </summary>
    /// <returns>Calculated portfolio data.</returns>
    private async Task<PortfolioResult> _calculatePortfolio()
    {
        _log.LogInformation("{CountIds} unique ids", this._symbolIds);

        var tickers = await _coin.GetTickersByIdsAsync(this._symbolIds);

        var result = new PortfolioResult();
        foreach (var p in this._currentPortfolio)
        {
            var symbol = p.Symbol.ToUpperInvariant();
            var ticker = tickers.FirstOrDefault(t => t.Symbol.ToUpperInvariant() == p.Symbol.ToUpperInvariant());
            if (ticker == null) continue;

            var price = decimal.Parse(ticker.Price_usd, CultureInfo.InvariantCulture);
            var buyPrice = p.PurchasePriceUsd;
            var value = price * p.Amount;

            result.Coins.Add(new CoinResult
            {
                Symbol = symbol,
                Id = ticker.Id,
                Amount = p.Amount,
                CurrentPriceUsd = price,
                ValueUsd = value,
                ChangePercent24h = decimal.Parse(ticker.Percent_change_24h),
                ChangePercent7d = decimal.Parse(ticker.Percent_change_7d),
                BuyPriceUsd = buyPrice,
                ChangePercentTotal = ((price - buyPrice) / buyPrice) * 100,
                Name = ticker.Name
            });
        }

        var totalBuyValue = result.Coins.Sum(c => c.BuyPriceUsd * c.Amount);
        var totalCurrentValue = result.Coins.Sum(c => c.CurrentPriceUsd * c.Amount);
        var changeInPercent = ((totalCurrentValue - totalBuyValue) / totalBuyValue) * 100;

        result.TotalValueUsd += totalCurrentValue;
        result.TotalChangeUsd += changeInPercent;

        return result;
    }

    /// <summary>
    /// Parses a line from the portfolio file into a PortfolioItem.
    /// </summary>
    /// <param name="line">Line from the file.</param>
    /// <returns>Parsed PortfolioItem.</returns>
    private PortfolioItem _parseLine(string line)
    {
        var parts = line.Split('|');
        if (parts.Length < 2) throw new Exception("Invalid line: " + line);

        var amount = decimal.Parse(parts[0]);
        var symbol = parts[1].Trim();
        decimal purchase = 0;
        if (parts.Length > 2)
        {
            purchase = decimal.Parse(parts[2]);
        }

        return new PortfolioItem
        {
            Symbol = symbol,
            Amount = amount,
            PurchasePriceUsd = purchase
        };
    }
}
