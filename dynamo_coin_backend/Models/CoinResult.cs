public class CoinResult
{
    public string Symbol { get; set; } = "";
    public string Id { get; set; } = "";
    public decimal CurrentPriceUsd { get; set; }
    public decimal BuyPriceUsd { get; set; }
    public decimal Amount { get; set; }
    public decimal ValueUsd { get; set; }
    public decimal ChangePercent24h { get; set; }
    public decimal ChangePercent7d { get; set; }
    public decimal ChangePercentTotal { get; set; }
    public string Name { get; set; } = "";

    override public string ToString()
    {
        return $"{Symbol} ({Id}): {Amount} @ {CurrentPriceUsd} USD, value: {ValueUsd} USD, Buy Price: {BuyPriceUsd}";
    }
}