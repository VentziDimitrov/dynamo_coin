public class Portfolio
    {
        public int Id { get; set; }
        public string Name { get; set; } = "Dynamo Coin Portfolio";
        public List<PortfolioItem> Items { get; set; } = new();
    }