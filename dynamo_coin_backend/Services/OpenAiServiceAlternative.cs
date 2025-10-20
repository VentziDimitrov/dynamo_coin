using Microsoft.Extensions.Options;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;

public class OpenAiOptions
{
    public string ApiKey { get; set; } = string.Empty;
    public string Model { get; set; } = "gpt-4o-mini";
    public double Temperature { get; set; } = 0.2;
    public int MaxTokens { get; set; } = 500;
    public double TopP { get; set; } = 1.0;
}

public class OpenAiServiceAlternative : IOpenAiServiceAlternative
{
    private readonly Kernel _kernel;
    private readonly IChatCompletionService _chatService;
    private readonly ILogger<OpenAiService> _logger;
    private readonly OpenAiOptions _options;

    public OpenAiServiceAlternative(IConfiguration config, ILogger<OpenAiService> logger, IOptions<OpenAiOptions> options)
    {
        _logger = logger;
        _options = options.Value;
       
        _options.ApiKey = config["OpenAI:ApiKey"]
            ?? throw new ArgumentNullException("OpenAI:ApiKey", "OpenAI API key is required");

        // Build Semantic Kernel
        var builder = Kernel.CreateBuilder();
        builder.AddOpenAIChatCompletion(
            modelId: _options.Model,
            apiKey: _options.ApiKey
        );

        _kernel = builder.Build();
        _chatService = _kernel.GetRequiredService<IChatCompletionService>();
    }

    public async Task<string> AnalyzeAsync(
        string coin,
        string dailyAnalysis,
        string monthlyReturns,
        string predictions)
    {
        try
        {
            var systemPrompt = GetSystemPrompt();
            var userPrompt = GetUserPrompt(coin, dailyAnalysis, monthlyReturns, predictions);

            // Create chat history
            var chatHistory = new ChatHistory();
            chatHistory.AddSystemMessage(systemPrompt);
            chatHistory.AddUserMessage(userPrompt);

            // Configure OpenAI prompt execution settings
            var executionSettings = new OpenAIPromptExecutionSettings
            {
                Temperature = _options.Temperature,
                MaxTokens = _options.MaxTokens,
                TopP = _options.TopP,
                FrequencyPenalty = 0.0,
                PresencePenalty = 0.0
            };

            // Get completion
            var result = await _chatService.GetChatMessageContentAsync(
                chatHistory,
                executionSettings,
                _kernel
            );

            var sentiment = result.Content?.Trim().ToLower() ?? "";

            _logger.LogInformation("OpenAI Sentiment Analysis - Coin: {Coin}, Result: {Result}",
                coin, sentiment);

            // Validate response
            if (IsValidSentiment(sentiment))
            {
                return sentiment;
            }

            _logger.LogWarning("Invalid sentiment returned: {Sentiment}. Defaulting to neutral.", sentiment);
            return "neutral";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error analyzing sentiment for coin {Coin}", coin);
            throw;
        }
    }

    private string GetSystemPrompt()
    {
        return """
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
        """;
    }

    private string GetUserPrompt(
        string coin,
        string dailyAnalysis,
        string monthlyReturns,
        string predictions)
    {
        return $"""
        Analyze the following cryptocurrency and provide sentiment classification:

        **Coin:** {coin}

        **Daily Analysis:**
        {dailyAnalysis}

        **Monthly Returns:**
        {monthlyReturns}

        **Predictions:**
        {predictions}

        Provide your sentiment analysis as a single word: positive, negative, or neutral.
        """;
    }

    private bool IsValidSentiment(string sentiment)
    {
        var validSentiments = new[] { "positive", "negative", "neutral" };
        return validSentiments.Contains(sentiment);
    }
}