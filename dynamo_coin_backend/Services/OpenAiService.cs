using System.Text.Json;
using OpenAI;
using OpenAI.Chat;

public class OpenAiService : IOpenAiService
{
    
    private readonly OpenAIClient _client;
    public OpenAiService(IConfiguration config)
    {
        string apiKey = config["OpenAI:ApiKey"] ?? throw new ArgumentNullException("OpenAI:ApiKey");
        _client = new OpenAIClient(apiKey);
    }

    public async Task<string> AnalyzeAsync(string coin, string dailyAnalysis, string monthlyReturns, string predictions)
    {
        var prompt = $"""
        You are an expert cryptocurrency sentiment analysis system with advanced financial modeling capabilities. Your role is to perform comprehensive sentiment analysis on cryptocurrency assets by evaluating multiple data dimensions including technical analysis, market performance metrics, and predictive indicators.

        ## Analysis Framework:

        **INPUT EVALUATION:**
        - Daily Analysis: Examine short-term price movements, volume patterns, technical indicators, and market momentum
        - Monthly Returns: Assess medium-term performance trends, volatility patterns, and comparative market performance
        - Predictions: Evaluate forecast reliability, methodology transparency, and alignment with fundamental/technical analysis

        **ANALYTICAL METHODOLOGY:**
        - Weight technical indicators (RSI, MACD, moving averages) at 35%
        - Consider market sentiment and volume analysis at 25%
        - Factor in fundamental analysis and news impact at 25%
        - Include predictive model confidence and historical accuracy at 15%

        **SENTIMENT CLASSIFICATION CRITERIA:**

        **POSITIVE**: Strong bullish indicators across multiple timeframes, sustained upward momentum, positive volume confirmation, reliable bullish predictions with >70% historical accuracy, favorable risk-reward ratio

        **NEGATIVE**: Bearish technical patterns, declining volume on rallies, negative momentum divergence, credible bearish forecasts, deteriorating fundamentals, high downside risk

        **NEUTRAL**: Mixed signals, sideways consolidation, balanced technical indicators, uncertain prediction outcomes, equal probability of directional movement, market indecision

        ## OUTPUT REQUIREMENTS:
        - Respond with exactly one word: 'positive', 'negative', or 'neutral'
        - Base decision on quantitative weight of evidence across all provided data points
        - Maintain objectivity and avoid emotional bias
        - Consider risk-adjusted returns and market context
        - Factor in prediction confidence levels and historical performance

        ## QUALITY STANDARDS:
        - Prioritize data-driven analysis over subjective interpretation
        - Weight recent performance data more heavily than historical data
        - Consider market correlation and sector-wide trends
        - Evaluate prediction methodology credibility
        - Maintain consistency in analytical approach across all assessments

        Analyze the provided cryptocurrency data comprehensively and respond with your sentiment classification.

        ##Coin: {coin}

        ##Daily Analysis: {dailyAnalysis}

        ##Prediction: {predictions}

        ##MonthlyReturns: {monthlyReturns}        
        """;

        var chatClient = _client.GetChatClient("gpt-4o-mini");
        ChatCompletionOptions options = new ChatCompletionOptions
        {
            Temperature = 0.2f, // Controls randomness (0 = deterministic)
            MaxOutputTokenCount = 500,
            TopP = 1.0f,        // Top 1            
        };

        var result = await chatClient.CompleteChatAsync([new SystemChatMessage(prompt)], options);

        Console.WriteLine("OpenAI response: " + result.Value.Content[0].Text);
        if (result.Value.Content[0].Text != null)
        {
            return result.Value.Content[0].Text;
        }
        return "";
    }
}