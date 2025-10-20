public interface IOpenAiServiceAlternative
{
    Task<string> AnalyzeAsync(string coin, string dailyAnalysis, string monthlyReturns, string predictions);
}