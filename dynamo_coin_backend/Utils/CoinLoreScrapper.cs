using HtmlAgilityPack;

public class CoinLoreScrapper
{
    private readonly HttpClient _httpClient;

    public CoinLoreScrapper()
    {
        _httpClient = new HttpClient();
    }

    /// <summary>
    /// Fetch HTML content from a URL.
    /// </summary>
    public async Task<string> GetHtmlAsync(string url)
    {
        var response = await _httpClient.GetAsync(url);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsStringAsync();
    }

    /// <summary>
    /// Extract the page title from HTML.
    /// </summary>
    public string ExtractAnalysis(string html)
    {
        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        var titleNode = doc.DocumentNode.SelectSingleNode("//div[@class='card p-10 content coin_page_about vzau']");
        return titleNode?.InnerText.Trim() ?? string.Empty;
    }

    public string ExtractMonthlyReturn(string html)
    {
        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        var table = doc.DocumentNode.SelectSingleNode("//table[@id='monthly-historical-stats']");
        var row2025 = table.SelectSingleNode(".//tr[td[text()='2025']]");
        return row2025?.InnerText.Trim() ?? string.Empty;
    }
        
    public string ExtractPricePredition(string page)
    {
        Console.WriteLine("Extracting price prediction from HTML: ");
        Console.WriteLine(page);
        var doc = new HtmlDocument();
        doc.LoadHtml(page);        

        var parent = doc.DocumentNode.SelectSingleNode("//div[@id='price']"); //doc.GetElementbyId("price");//
        if (parent == null) return "No price prediction element found on this site!";
        Console.WriteLine("Found parent node: " + parent.Name);
        return parent.ChildNodes[1].InnerText.Trim() ?? "No prediction found.";
    }
}