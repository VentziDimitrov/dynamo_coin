using Microsoft.EntityFrameworkCore;
using FluentAssertions;

namespace dynamo_coin_backend.Tests;

public class CoinRepositoryTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly CoinRepository _repository;

    public CoinRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _repository = new CoinRepository(_context);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Fact]
    public async Task GetAllCoinsAsync_WithEmptyDatabase_ReturnsEmptyList()
    {
        // Act
        var result = await _repository.GetAllCoinsAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task AddCoinAsync_WithValidCoin_AddsToDatabase()
    {
        // Arrange
        var coin = new PortfolioItem
        {
            Symbol = "BTC",
            Amount = 1.5m,
            PurchasePriceUsd = 50000m
        };

        // Act
        await _repository.AddCoinAsync(coin);
        var result = await _repository.GetAllCoinsAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(1);
        var addedCoin = result.First();
        addedCoin.Symbol.Should().Be("BTC");
        addedCoin.Amount.Should().Be(1.5m);
        addedCoin.PurchasePriceUsd.Should().Be(50000m);
    }

    [Fact]
    public async Task AddCoinAsync_WithMultipleCoins_AddsAllToDatabase()
    {
        // Arrange
        var coins = new List<PortfolioItem>
        {
            new PortfolioItem { Symbol = "BTC", Amount = 1.5m, PurchasePriceUsd = 50000m },
            new PortfolioItem { Symbol = "ETH", Amount = 10m, PurchasePriceUsd = 3000m },
            new PortfolioItem { Symbol = "ADA", Amount = 1000m, PurchasePriceUsd = 1.5m }
        };

        // Act
        foreach (var coin in coins)
        {
            await _repository.AddCoinAsync(coin);
        }
        var result = await _repository.GetAllCoinsAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(3);
        result.Select(c => c.Symbol).Should().Contain(new[] { "BTC", "ETH", "ADA" });
    }

    [Fact]
    public async Task UpdateCoinAsync_WithExistingCoin_UpdatesSuccessfully()
    {
        // Arrange
        var coin = new PortfolioItem
        {
            Symbol = "BTC",
            Amount = 1.5m,
            PurchasePriceUsd = 50000m
        };

        await _repository.AddCoinAsync(coin);

        // Modify the coin
        coin.Amount = 2.0m;
        coin.PurchasePriceUsd = 55000m;

        // Act
        await _repository.UpdateCoinAsync(coin);
        var result = await _repository.GetAllCoinsAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(1);
        var updatedCoin = result.First();
        updatedCoin.Symbol.Should().Be("BTC");
        updatedCoin.Amount.Should().Be(2.0m);
        updatedCoin.PurchasePriceUsd.Should().Be(55000m);
    }

    [Fact]
    public async Task GetAllCoinsAsync_AfterAddingCoins_ReturnsAllCoins()
    {
        // Arrange
        var coin1 = new PortfolioItem { Symbol = "BTC", Amount = 1m, PurchasePriceUsd = 50000m };
        var coin2 = new PortfolioItem { Symbol = "ETH", Amount = 5m, PurchasePriceUsd = 3000m };

        await _repository.AddCoinAsync(coin1);
        await _repository.AddCoinAsync(coin2);

        // Act
        var result = await _repository.GetAllCoinsAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task AddCoinAsync_WithZeroAmount_AddsSuccessfully()
    {
        // Arrange
        var coin = new PortfolioItem
        {
            Symbol = "BTC",
            Amount = 0m,
            PurchasePriceUsd = 50000m
        };

        // Act
        await _repository.AddCoinAsync(coin);
        var result = await _repository.GetAllCoinsAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(1);
        result.First().Amount.Should().Be(0m);
    }

    [Fact]
    public async Task AddCoinAsync_WithZeroPurchasePrice_AddsSuccessfully()
    {
        // Arrange
        var coin = new PortfolioItem
        {
            Symbol = "BTC",
            Amount = 1.5m,
            PurchasePriceUsd = 0m
        };

        // Act
        await _repository.AddCoinAsync(coin);
        var result = await _repository.GetAllCoinsAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(1);
        result.First().PurchasePriceUsd.Should().Be(0m);
    }

    [Fact]
    public async Task AddCoinAsync_WithLargeDecimalValues_HandlesCorrectly()
    {
        // Arrange
        var coin = new PortfolioItem
        {
            Symbol = "BTC",
            Amount = 123456.789012m,
            PurchasePriceUsd = 98765.4321m
        };

        // Act
        await _repository.AddCoinAsync(coin);
        var result = await _repository.GetAllCoinsAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(1);
        var addedCoin = result.First();
        addedCoin.Amount.Should().Be(123456.789012m);
        addedCoin.PurchasePriceUsd.Should().Be(98765.4321m);
    }

    [Fact]
    public async Task GetAllCoinsAsync_AfterMultipleOperations_ReturnsCorrectData()
    {
        // Arrange
        var coin1 = new PortfolioItem { Symbol = "BTC", Amount = 1m, PurchasePriceUsd = 50000m };
        var coin2 = new PortfolioItem { Symbol = "ETH", Amount = 5m, PurchasePriceUsd = 3000m };
        var coin3 = new PortfolioItem { Symbol = "ADA", Amount = 1000m, PurchasePriceUsd = 1.5m };

        // Act
        await _repository.AddCoinAsync(coin1);
        await _repository.AddCoinAsync(coin2);
        await _repository.AddCoinAsync(coin3);

        var allCoins = await _repository.GetAllCoinsAsync();

        // Assert
        allCoins.Should().HaveCount(3);
        allCoins.Should().Contain(c => c.Symbol == "BTC" && c.Amount == 1m);
        allCoins.Should().Contain(c => c.Symbol == "ETH" && c.Amount == 5m);
        allCoins.Should().Contain(c => c.Symbol == "ADA" && c.Amount == 1000m);
    }
}
