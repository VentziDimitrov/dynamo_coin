public class CoinLoreInfo
{
    public string TodayAnalysis { get; set; } = string.Empty;
    public string Prediction { get; set; } = string.Empty;
    public List<string> MonthlyReturns { get; set; } = new();

    override public string ToString()
    {
        return $"TodayAnalysis: {TodayAnalysis},\n\nPrediction: {Prediction}, \n\nMonthlyReturns: {string.Join(", ", MonthlyReturns)}";
    }
}