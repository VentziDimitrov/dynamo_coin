using System.Reflection;
using System.Runtime.Serialization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using FluentAssertions;

namespace dynamo_coin_backend.Tests;

public class PortfolioControllerTests
{
    private readonly Mock<ICoinLoreService> _coinLoreServiceMock;
    private readonly Mock<ILogger<PortfolioController>> _loggerMock;
    private readonly Mock<IOpenAiService> _openAiServiceMock;
    private readonly Mock<ICoinRepository> _coinRepositoryMock;

    public PortfolioControllerTests()
    {
        _coinLoreServiceMock = new Mock<ICoinLoreService>();
        _loggerMock = new Mock<ILogger<PortfolioController>>();
        _openAiServiceMock = new Mock<IOpenAiService>();
        _coinRepositoryMock = new Mock<ICoinRepository>();
    }

    // Helper: set a private field by name
    private void SetPrivateField(object target, string fieldName, object value)
    {
        var fi = target.GetType().GetField(fieldName, BindingFlags.NonPublic | BindingFlags.Instance);
        if (fi == null) throw new InvalidOperationException($"Field '{fieldName}' not found on {target.GetType().FullName}");
        fi.SetValue(target, value);
    }

    // Helper: invoke a private async method with no parameters and return typed result
    private async Task<T> InvokePrivateAsync<T>(object target, string methodName)
    {
        var mi = target.GetType().GetMethod(methodName, BindingFlags.NonPublic | BindingFlags.Instance);
        if (mi == null) throw new InvalidOperationException($"Method '{methodName}' not found on {target.GetType().FullName}");
        var task = (Task)mi.Invoke(target, null)!;
        await task.ConfigureAwait(false);
        var resultProperty = task.GetType().GetProperty("Result", BindingFlags.Public | BindingFlags.Instance);
        if (resultProperty == null) return default!;
        return (T)resultProperty.GetValue(task)!;
    }

    // Helper: invoke a private method with one parameter
    private T InvokePrivateMethod<T>(object target, string methodName, object parameter)
    {
        var mi = target.GetType().GetMethod(methodName, BindingFlags.NonPublic | BindingFlags.Instance);
        if (mi == null) throw new InvalidOperationException($"Method '{methodName}' not found on {target.GetType().FullName}");
        return (T)mi.Invoke(target, new[] { parameter })!;
    }

    [Fact]
    public async Task Refresh_WithEmptyPortfolio_ReturnsBadRequest()
    {
        // Arrange
        _coinRepositoryMock.Setup(x => x.GetAllCoinsAsync())
            .ReturnsAsync(new List<PortfolioItem>());

        var controller = new PortfolioController(
            _coinLoreServiceMock.Object,
            _loggerMock.Object,
            _openAiServiceMock.Object,
            _coinRepositoryMock.Object
        );

        // Act
        var result = await controller.Refresh();

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
        var badRequest = result as BadRequestObjectResult;
        badRequest!.Value.Should().Be("Portfolio is empty. Please upload a portfolio file first.");
    }

    [Fact]
    public async Task Refresh_WithValidPortfolio_ReturnsOkWithPortfolioResult()
    {
        // Arrange
        var portfolioItems = new List<PortfolioItem>
        {
            new PortfolioItem { Symbol = "BTC", Amount = 1m, PurchasePriceUsd = 50000m }
        };

        _coinRepositoryMock.Setup(x => x.GetAllCoinsAsync())
            .ReturnsAsync(portfolioItems);

        _coinLoreServiceMock.Setup(x => x.MapSymbolsToIdsAsync(It.IsAny<IEnumerable<string>>()))
            .ReturnsAsync(new Dictionary<string, string> { { "BTC", "90" } });

        _coinLoreServiceMock.Setup(x => x.GetTickersByIdsAsync(It.IsAny<IEnumerable<string>>()))
            .ReturnsAsync(new List<CoinLoreTicker>
            {
                new CoinLoreTicker
                {
                    Id = "90",
                    Symbol = "BTC",
                    Name = "Bitcoin",
                    Price_usd = "60000",
                    Percent_change_24h = "5.5",
                    Percent_change_7d = "10.2"
                }
            });

        var controller = new PortfolioController(
            _coinLoreServiceMock.Object,
            _loggerMock.Object,
            _openAiServiceMock.Object,
            _coinRepositoryMock.Object
        );

        // Act
        var result = await controller.Refresh();

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        var portfolioResult = okResult!.Value as PortfolioResult;

        portfolioResult.Should().NotBeNull();
        portfolioResult!.Coins.Should().HaveCount(1);
        portfolioResult.TotalValueUsd.Should().Be(60000m);
    }

    [Fact]
    public async Task Upload_WithNullFile_ReturnsBadRequest()
    {
        // Arrange
        var controller = new PortfolioController(
            _coinLoreServiceMock.Object,
            _loggerMock.Object,
            _openAiServiceMock.Object,
            _coinRepositoryMock.Object
        );

        // Act
        var result = await controller.Upload(null!);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
        var badRequest = result as BadRequestObjectResult;
        badRequest!.Value.Should().Be("No file provided or file is empty");
    }

    [Fact]
    public async Task Upload_WithValidFile_ReturnsOkWithPortfolioResult()
    {
        // Arrange
        var fileContent = "1.5|BTC|50000\n0.5|ETH|3000";
        var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(fileContent));
        var fileMock = new Mock<IFormFile>();
        fileMock.Setup(f => f.Length).Returns(fileContent.Length);
        fileMock.Setup(f => f.FileName).Returns("portfolio.txt");
        fileMock.Setup(f => f.OpenReadStream()).Returns(stream);

        _coinRepositoryMock.Setup(x => x.GetAllCoinsAsync())
            .ReturnsAsync(new List<PortfolioItem>());

        _coinLoreServiceMock.Setup(x => x.MapSymbolsToIdsAsync(It.IsAny<IEnumerable<string>>()))
            .ReturnsAsync(new Dictionary<string, string>
            {
                { "BTC", "90" },
                { "ETH", "80" }
            });

        _coinLoreServiceMock.Setup(x => x.GetTickersByIdsAsync(It.IsAny<IEnumerable<string>>()))
            .ReturnsAsync(new List<CoinLoreTicker>
            {
                new CoinLoreTicker
                {
                    Id = "90",
                    Symbol = "BTC",
                    Name = "Bitcoin",
                    Price_usd = "60000",
                    Percent_change_24h = "5.5",
                    Percent_change_7d = "10.2"
                },
                new CoinLoreTicker
                {
                    Id = "80",
                    Symbol = "ETH",
                    Name = "Ethereum",
                    Price_usd = "3500",
                    Percent_change_24h = "3.2",
                    Percent_change_7d = "8.1"
                }
            });

        _coinRepositoryMock.Setup(x => x.UpdateCoinAsync(It.IsAny<PortfolioItem>()))
            .Returns(Task.CompletedTask);

        var controller = new PortfolioController(
            _coinLoreServiceMock.Object,
            _loggerMock.Object,
            _openAiServiceMock.Object,
            _coinRepositoryMock.Object
        );

        // Act
        var result = await controller.Upload(fileMock.Object);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        var portfolioResult = okResult!.Value as PortfolioResult;

        portfolioResult.Should().NotBeNull();
        portfolioResult!.Coins.Should().HaveCount(2);
    }

    [Fact]
    public async Task Upload_WithInvalidFileFormat_ReturnsBadRequest()
    {
        // Arrange
        var fileContent = "invalid|format|extra|fields|bad";
        var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(fileContent));
        var fileMock = new Mock<IFormFile>();
        fileMock.Setup(f => f.Length).Returns(fileContent.Length);
        fileMock.Setup(f => f.FileName).Returns("portfolio.txt");
        fileMock.Setup(f => f.OpenReadStream()).Returns(stream);

        _coinRepositoryMock.Setup(x => x.GetAllCoinsAsync())
            .ReturnsAsync(new List<PortfolioItem>());

        var controller = new PortfolioController(
            _coinLoreServiceMock.Object,
            _loggerMock.Object,
            _openAiServiceMock.Object,
            _coinRepositoryMock.Object
        );

        // Act
        var result = await controller.Upload(fileMock.Object);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task Analyse_WithEmptyCoinParameter_ReturnsBadRequest()
    {
        // Arrange
        _coinRepositoryMock.Setup(x => x.GetAllCoinsAsync())
            .ReturnsAsync(new List<PortfolioItem>());

        var controller = new PortfolioController(
            _coinLoreServiceMock.Object,
            _loggerMock.Object,
            _openAiServiceMock.Object,
            _coinRepositoryMock.Object
        );

        // Act
        var result = await controller.Analyse("");

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
        var badRequest = result as BadRequestObjectResult;
        badRequest!.Value.Should().Be("Coin parameter is required");
    }

    [Fact]
    public async Task Analyse_WithValidCoin_ReturnsOkWithAnalysis()
    {
        // Arrange
        var coinInfo = new CoinLoreInfo
        {
            TodayAnalysis = "Bullish trend",
            MonthlyReturns = new List<string> { "10%", "15%", "-5%" },
            Prediction = "Price expected to rise"
        };

        _coinRepositoryMock.Setup(x => x.GetAllCoinsAsync())
            .ReturnsAsync(new List<PortfolioItem>());

        _coinLoreServiceMock.Setup(x => x.GetCoinSentimentAsync("bitcoin"))
            .ReturnsAsync(coinInfo);

        _openAiServiceMock.Setup(x => x.AnalyzeAsync(
            "bitcoin",
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<string>()))
            .ReturnsAsync("positive");

        var controller = new PortfolioController(
            _coinLoreServiceMock.Object,
            _loggerMock.Object,
            _openAiServiceMock.Object,
            _coinRepositoryMock.Object
        );

        // Act
        var result = await controller.Analyse("bitcoin");

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        okResult!.Value.Should().NotBeNull();
    }

    [Fact]
    public async Task Analyse_WhenCoinNotFound_ReturnsNotFound()
    {
        // Arrange
        _coinRepositoryMock.Setup(x => x.GetAllCoinsAsync())
            .ReturnsAsync(new List<PortfolioItem>());

        _coinLoreServiceMock.Setup(x => x.GetCoinSentimentAsync("unknowncoin"))
            .ReturnsAsync((CoinLoreInfo?)null);

        var controller = new PortfolioController(
            _coinLoreServiceMock.Object,
            _loggerMock.Object,
            _openAiServiceMock.Object,
            _coinRepositoryMock.Object
        );

        // Act
        var result = await controller.Analyse("unknowncoin");

        // Assert
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public void ParseLine_WithValidFormat_ReturnsPortfolioItem()
    {
        // Arrange
        _coinRepositoryMock.Setup(x => x.GetAllCoinsAsync())
            .ReturnsAsync(new List<PortfolioItem>());

        var controller = new PortfolioController(
            _coinLoreServiceMock.Object,
            _loggerMock.Object,
            _openAiServiceMock.Object,
            _coinRepositoryMock.Object
        );

        // Act
        var result = InvokePrivateMethod<PortfolioItem>(controller, "_parseLine", "1.5|BTC|50000");

        // Assert
        result.Should().NotBeNull();
        result.Symbol.Should().Be("BTC");
        result.Amount.Should().Be(1.5m);
        result.PurchasePriceUsd.Should().Be(50000m);
    }

    [Fact]
    public void ParseLine_WithMinimalFormat_ReturnsPortfolioItemWithZeroPrice()
    {
        // Arrange
        _coinRepositoryMock.Setup(x => x.GetAllCoinsAsync())
            .ReturnsAsync(new List<PortfolioItem>());

        var controller = new PortfolioController(
            _coinLoreServiceMock.Object,
            _loggerMock.Object,
            _openAiServiceMock.Object,
            _coinRepositoryMock.Object
        );

        // Act
        var result = InvokePrivateMethod<PortfolioItem>(controller, "_parseLine", "2.5|ETH");

        // Assert
        result.Should().NotBeNull();
        result.Symbol.Should().Be("ETH");
        result.Amount.Should().Be(2.5m);
        result.PurchasePriceUsd.Should().Be(0m);
    }

    [Fact]
    public void ParseLine_WithInvalidAmount_ThrowsFormatException()
    {
        // Arrange
        _coinRepositoryMock.Setup(x => x.GetAllCoinsAsync())
            .ReturnsAsync(new List<PortfolioItem>());

        var controller = new PortfolioController(
            _coinLoreServiceMock.Object,
            _loggerMock.Object,
            _openAiServiceMock.Object,
            _coinRepositoryMock.Object
        );

        // Act & Assert
        Action act = () => InvokePrivateMethod<PortfolioItem>(controller, "_parseLine", "invalid|BTC|50000");
        act.Should().Throw<TargetInvocationException>()
            .WithInnerException<FormatException>();
    }

    [Fact]
    public async Task CalculatePortfolio_WithMultipleCoins_CalculatesCorrectTotals()
    {
        // Create an uninitialized controller to avoid constructor side effects
        var controller = (PortfolioController)FormatterServices.GetUninitializedObject(typeof(PortfolioController));

        // Prepare portfolio items
        var portfolio = new List<PortfolioItem>
        {
            new PortfolioItem { Symbol = "BTC", Amount = 2m, PurchasePriceUsd = 10000m },
            new PortfolioItem { Symbol = "ETH", Amount = 10m, PurchasePriceUsd = 2000m }
        };

        var symbolIds = new[] { "90", "80" };

        // Mock tickers
        var tickers = new List<CoinLoreTicker>
        {
            new CoinLoreTicker
            {
                Id = "90",
                Symbol = "BTC",
                Name = "Bitcoin",
                Price_usd = "12000",
                Percent_change_24h = "5",
                Percent_change_7d = "10"
            },
            new CoinLoreTicker
            {
                Id = "80",
                Symbol = "ETH",
                Name = "Ethereum",
                Price_usd = "2500",
                Percent_change_24h = "3",
                Percent_change_7d = "8"
            }
        };

        _coinLoreServiceMock.Setup(x => x.GetTickersByIdsAsync(It.IsAny<IEnumerable<string>>()))
            .ReturnsAsync(tickers);

        // Set private fields
        SetPrivateField(controller, "_currentPortfolio", portfolio);
        SetPrivateField(controller, "_symbolIds", symbolIds);
        SetPrivateField(controller, "_coinlore", _coinLoreServiceMock.Object);
        SetPrivateField(controller, "_log", _loggerMock.Object);

        // Act
        var result = await InvokePrivateAsync<PortfolioResult>(controller, "_calculatePortfolio");

        // Assert
        result.Should().NotBeNull();
        result.Coins.Should().HaveCount(2);

        // BTC: 2 * 12000 = 24000
        // ETH: 10 * 2500 = 25000
        // Total = 49000
        result.TotalValueUsd.Should().Be(49000m);

        // BTC buy: 2 * 10000 = 20000, current: 24000, change: 4000
        // ETH buy: 10 * 2000 = 20000, current: 25000, change: 5000
        // Total buy: 40000, current: 49000, change %: (9000/40000) * 100 = 22.5%
        Math.Round(result.TotalChangeUsd, 2).Should().Be(22.5m);
    }
}
