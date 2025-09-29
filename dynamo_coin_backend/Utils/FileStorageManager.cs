using System.Text.Json;

public class FileStorageManager
{
    private readonly string _defaultDir = "data";
    private readonly string _filePath = "data/portfolios.json";
    private readonly JsonSerializerOptions _jsonOptions = new() { WriteIndented = true };
    private List<Portfolio> _portfolios = new();

    public FileStorageManager()
    {
        // Ensure folder exists
        var dir = Path.GetDirectoryName(_filePath);
        if (!Directory.Exists(dir)) Directory.CreateDirectory(dir ?? _defaultDir);
    }

    public Task AddAsync(Portfolio portfolio)
    {
        _portfolios.Add(portfolio);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(int id)
    {
        var portfolio = _portfolios.FirstOrDefault(p => p.Id == id);
        if (portfolio != null)
        {
            _portfolios.Remove(portfolio);
        }
        return Task.CompletedTask;
    }

    public async Task<List<Portfolio>> _getAllAsync()
    {
        if (File.Exists(_filePath))
        {
            var json = await File.ReadAllTextAsync(_filePath);
            var portfolios = JsonSerializer.Deserialize<List<Portfolio>>(json);
            if (portfolios != null)
            {
                _portfolios.Clear();
                _portfolios.AddRange(portfolios);
            }
            return _portfolios;
        }
        return new List<Portfolio>();
    }

    public async Task<Portfolio> GetPortfolioAsync()
    {
        if (_portfolios.Count == 0)
        {
            _portfolios = await _getAllAsync();
        }
        if (_portfolios.Count == 0)
        {
            return new Portfolio { Id = 1, Items = new List<PortfolioItem>() };
        }
        return _portfolios.Last();
    }

    public async Task SaveAsync(List<Portfolio> portfolios)
    {
        var json = JsonSerializer.Serialize(portfolios, _jsonOptions);
        await File.WriteAllTextAsync(_filePath, json);
    }
}