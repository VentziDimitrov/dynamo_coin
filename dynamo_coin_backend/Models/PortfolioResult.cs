public class PortfolioResult
{
    public List<CoinResult> Coins { get; set; } = new();
    public decimal TotalValueUsd { get; set; }
    public decimal TotalChangeUsd { get; set; }
}