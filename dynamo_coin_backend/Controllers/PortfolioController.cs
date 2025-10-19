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
    private readonly ICoinLoreService _coinlore;
    private readonly ILogger<PortfolioController> _logger;
    private List<PortfolioItem> _currentPortfolio = new();
    private IEnumerable<string> _symbolIds = Enumerable.Empty<string>();
    private ICoinRepository _coinRepository;
    private readonly IOpenAiService _openAi;

    public PortfolioController(
        ICoinLoreService coinlore,
        ILogger<PortfolioController> logger,
        IOpenAiService openAi,
        ICoinRepository coinRepository)
    {
        _coinlore = coinlore;
        _logger = logger;
        _coinRepository = coinRepository;
        _openAi = openAi;

        _initializePortfolio();
    }

    /// <summary>
    /// Refreshes the portfolio by recalculating current values and changes.
    /// </summary>
    /// <returns>Updated portfolio result.</returns>
    [HttpGet("refresh")]
    public async Task<IActionResult> Refresh()
    {
        try
        {
            _logger.LogInformation("Refreshing portfolio...");

            if (!_currentPortfolio.Any())
            {
                _logger.LogWarning("No portfolio items to refresh");
                return BadRequest("Portfolio is empty. Please upload a portfolio file first.");
            }

            var result = await _calculatePortfolio();

            _logger.LogInformation("Computed portfolio: total={Total} change={Change}", result.TotalValueUsd, result.TotalChangeUsd);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to refresh portfolio");
            return StatusCode(500, new { error = "Failed to refresh portfolio", message = ex.Message });
        }
    }

    /// <summary>
    /// Uploads a new portfolio file, parses its contents, and recalculates portfolio values.
    /// </summary>
    /// <param name="file">Portfolio file to upload.</param>
    /// <returns>Updated portfolio result.</returns>
    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file provided or file is empty");
            }

            _logger.LogInformation("Received file {FileName}", file.FileName);
            var tempPortfolio = new List<PortfolioItem>();
            var lineNumber = 0;

            using (var sr = new StreamReader(file.OpenReadStream()))
            {
                while (!sr.EndOfStream)
                {
                    lineNumber++;
                    var line = (await sr.ReadLineAsync())?.Trim();
                    if (string.IsNullOrWhiteSpace(line)) continue;

                    try
                    {
                        var coin = _parseLine(line);
                        tempPortfolio.Add(coin);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to parse line {LineNumber}: {Line}", lineNumber, line);
                        return BadRequest(new { error = $"Invalid format at line {lineNumber}", line, message = ex.Message });
                    }
                }
            }

            if (!tempPortfolio.Any())
            {
                return BadRequest("File contains no valid portfolio items");
            }

            _logger.LogInformation("Parsed {Count} portfolio items", tempPortfolio.Count);

            var symbols = tempPortfolio.Select(p => p.Symbol.ToUpperInvariant()).Distinct();
            var map = await _coinlore.MapSymbolsToIdsAsync(symbols);

            if (map == null || !map.Any())
            {
                _logger.LogError("Failed to map symbols to IDs");
                return StatusCode(500, "Failed to map cryptocurrency symbols");
            }

            this._currentPortfolio = tempPortfolio;
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

            await _coinRepository.UpdateCoinAsync(portfolio.Items.First()); //_storage.SavePortfolioAsync(portfolio);

            _logger.LogInformation("Computed portfolio: total={Total} change={Change}", result.TotalValueUsd, result.TotalChangeUsd);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload portfolio file");
            return StatusCode(500, new { error = "Failed to process portfolio file", message = ex.Message });
        }
    }

    [HttpGet("analyse")]
    public async Task<IActionResult> Analyse(string coin)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(coin))
            {
                return BadRequest("Coin parameter is required");
            }

            _logger.LogInformation("Getting sentiment for {Coin}", coin);
            var result = await _coinlore.GetCoinSentimentAsync(coin);

            if (result == null)
            {
                return NotFound($"No sentiment data found for coin: {coin}");
            }

            var dataToAnalyze = new CoinLoreInfo
            {
                TodayAnalysis = result.TodayAnalysis,
                Prediction = result.Prediction,
                MonthlyReturns = result.MonthlyReturns
            };

            var analysis = await _openAi.AnalyzeAsync(coin, dataToAnalyze.TodayAnalysis, string.Join(",", dataToAnalyze.MonthlyReturns), dataToAnalyze.Prediction);
            _logger.LogInformation("OpenAI analysis result: {Analysis}", analysis);

            return Ok(new
            {
                OpenAiAnalysis = analysis
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to analyze coin {Coin}", coin);
            return StatusCode(500, new { error = "Failed to analyze coin", message = ex.Message });
        }
    }

    private async void _initializePortfolio()
    {
        try
        {
            var cashed = await _coinRepository.GetAllCoinsAsync(); //_storage.GetPortfolioAsync().GetAwaiter().GetResult();
            if (cashed == null || !cashed.Any())
            {
                _logger.LogWarning("No cached portfolio items found during initialization");
                _currentPortfolio = new List<PortfolioItem>();
                _symbolIds = Enumerable.Empty<string>();
                return;
            }
            _logger.LogInformation("Loaded {Count} cached portfolio items", cashed?.Count() ?? 0);
            _currentPortfolio = cashed?.ToList() ?? new List<PortfolioItem>();

            if (_currentPortfolio.Any())
            {
                var symbols = _currentPortfolio.Select(p => p.Symbol.ToUpperInvariant()).Distinct();
                var map = _coinlore.MapSymbolsToIdsAsync(symbols).GetAwaiter().GetResult();
                this._symbolIds = map?.Values.Distinct() ?? Enumerable.Empty<string>();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load portfolio during initialization");
            _currentPortfolio = new List<PortfolioItem>();
            _symbolIds = Enumerable.Empty<string>();
        }
    }

    /// <summary>
    /// Download newest crypto data and calculates the current portfolio values and changes.
    /// </summary>
    /// <returns>Calculated portfolio data.</returns>
    private async Task<PortfolioResult> _calculatePortfolio()
    {
        _logger.LogInformation("{CountIds} unique ids", this._symbolIds);

        var tickers = await _coinlore.GetTickersByIdsAsync(this._symbolIds);

        if (tickers == null || !tickers.Any())
        {
            _logger.LogWarning("No tickers returned from API");
            throw new InvalidOperationException("Failed to retrieve ticker data");
        }

        var result = new PortfolioResult();
        foreach (var p in this._currentPortfolio)
        {
            var symbol = p.Symbol.ToUpperInvariant();
            var ticker = tickers.FirstOrDefault(t => t.Symbol.ToUpperInvariant() == p.Symbol.ToUpperInvariant());

            if (ticker == null)
            {
                _logger.LogWarning("No ticker found for symbol {Symbol}", symbol);
                continue;
            }

            if (!decimal.TryParse(ticker.Price_usd, NumberStyles.Any, CultureInfo.InvariantCulture, out var price))
            {
                _logger.LogWarning("Failed to parse price for {Symbol}: {Price}", symbol, ticker.Price_usd);
                continue;
            }

            if (!decimal.TryParse(ticker.Percent_change_24h, NumberStyles.Any, CultureInfo.InvariantCulture, out var change24h))
            {
                _logger.LogWarning("Failed to parse 24h change for {Symbol}: {Change}", symbol, ticker.Percent_change_24h);
                change24h = 0;
            }

            if (!decimal.TryParse(ticker.Percent_change_7d, NumberStyles.Any, CultureInfo.InvariantCulture, out var change7d))
            {
                _logger.LogWarning("Failed to parse 7d change for {Symbol}: {Change}", symbol, ticker.Percent_change_7d);
                change7d = 0;
            }

            var buyPrice = p.PurchasePriceUsd;
            var value = price * p.Amount;
            var changePercentTotal = buyPrice > 0 ? ((price - buyPrice) / buyPrice) * 100 : 0;

            result.Coins.Add(new CoinResult
            {
                Symbol = symbol,
                Id = ticker.Id,
                Amount = p.Amount,
                CurrentPriceUsd = price,
                ValueUsd = value,
                ChangePercent24h = change24h,
                ChangePercent7d = change7d,
                BuyPriceUsd = buyPrice,
                ChangePercentTotal = changePercentTotal,
                Name = ticker.Name
            });
        }

        if (!result.Coins.Any())
        {
            _logger.LogWarning("No coins processed successfully");
            return result;
        }

        var totalBuyValue = result.Coins.Sum(c => c.BuyPriceUsd * c.Amount);
        var totalCurrentValue = result.Coins.Sum(c => c.CurrentPriceUsd * c.Amount);
        var changeInPercent = totalBuyValue > 0 ? ((totalCurrentValue - totalBuyValue) / totalBuyValue) * 100 : 0;

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
        if (parts.Length < 2)
        {
            throw new FormatException($"Line must contain at least 2 parts separated by '|'. Expected format: amount|symbol|price");
        }

        if (!decimal.TryParse(parts[0].Trim(), NumberStyles.Any, CultureInfo.InvariantCulture, out var amount))
        {
            throw new FormatException($"Invalid amount: '{parts[0]}'. Must be a valid decimal number.");
        }

        var symbol = parts[1].Trim();
        if (string.IsNullOrWhiteSpace(symbol))
        {
            throw new FormatException("Symbol cannot be empty");
        }

        decimal purchase = 0;
        if (parts.Length > 2 && !string.IsNullOrWhiteSpace(parts[2]))
        {
            if (!decimal.TryParse(parts[2].Trim(), NumberStyles.Any, CultureInfo.InvariantCulture, out purchase))
            {
                throw new FormatException($"Invalid purchase price: '{parts[2]}'. Must be a valid decimal number.");
            }
        }

        return new PortfolioItem
        {
            Symbol = symbol,
            Amount = amount,
            PurchasePriceUsd = purchase
        };
    }

    
}
