// PortfolioListItem.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import PortfolioListItem from './PortfolioListItem';

describe('PortfolioListItem Component', () => {
  // Mock functions
  const mockFormatCurrency = (value) => `$${value.toFixed(2)}`;
  const mockFormatChange = (value) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  const mockOnSentimentAnalyze = jest.fn();

  // Mock styles object
  const mockStyles = {
    tableRow: { display: 'flex', padding: '10px' },
    coinInfo: { display: 'flex' },
    coinSymbol: { fontWeight: 'bold' },
    coinName: { fontSize: '12px' },
    holdingAmount: { fontWeight: '600' },
    portfolioValue: { fontSize: '16px' },
    changeChip: { display: 'flex', padding: '4px 8px', borderRadius: '4px' },
    changeText: { marginLeft: '4px' },
    changeSubtext: { fontSize: '12px' },
    analyzeButton: { padding: '8px 16px', cursor: 'pointer' },
    spinningIcon: { animation: 'spin 1s linear infinite' },
    sentimentBadge: { padding: '6px 12px', borderRadius: '6px' },
    noSentiment: { color: '#cbd5e1' }
  };

  // Mock coin data
  const mockCoin = {
    id: 1,
    symbol: 'BTC',
    name: 'Bitcoin',
    amount: 0.5,
    currentPriceUsd: 45000,
    buyPriceUsd: 40000,
    changePercentTotal: 12.5,
    changePercent24h: 2.34,
    changePercent7d: 5.67,
    sentiment: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Basic Rendering Tests
  describe('Rendering', () => {
    test('renders coin symbol and name', () => {
      render(
        <PortfolioListItem
          coin={mockCoin}
          styles={mockStyles}
          formatCurrency={mockFormatCurrency}
          formatChange={mockFormatChange}
          onSentimentAnalyze={mockOnSentimentAnalyze}
          analyzingCoin={null}
        />
      );

      expect(screen.getByText('BTC')).toBeInTheDocument();
      expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    });

    test('renders holding amount', () => {
      render(
        <PortfolioListItem
          coin={mockCoin}
          styles={mockStyles}
          formatCurrency={mockFormatCurrency}
          formatChange={mockFormatChange}
          onSentimentAnalyze={mockOnSentimentAnalyze}
          analyzingCoin={null}
        />
      );

      expect(screen.getByText('0.5')).toBeInTheDocument();
    });

    test('renders portfolio value correctly', () => {
      render(
        <PortfolioListItem
          coin={mockCoin}
          styles={mockStyles}
          formatCurrency={mockFormatCurrency}
          formatChange={mockFormatChange}
          onSentimentAnalyze={mockOnSentimentAnalyze}
          analyzingCoin={null}
        />
      );

      // Portfolio value = 0.5 * 45000 = 22500
      expect(screen.getByText('$22500.00')).toBeInTheDocument();
    });

    test('returns empty div when coin is null', () => {
      const { container } = render(
        <PortfolioListItem
          coin={null}
          styles={mockStyles}
          formatCurrency={mockFormatCurrency}
          formatChange={mockFormatChange}
          onSentimentAnalyze={mockOnSentimentAnalyze}
          analyzingCoin={null}
        />
      );

      expect(container.firstChild).toBeEmptyDOMElement();
    });

    test('returns empty div when coin is undefined', () => {
      const { container } = render(
        <PortfolioListItem
          coin={undefined}
          styles={mockStyles}
          formatCurrency={mockFormatCurrency}
          formatChange={mockFormatChange}
          onSentimentAnalyze={mockOnSentimentAnalyze}
          analyzingCoin={null}
        />
      );

      expect(container.firstChild).toBeEmptyDOMElement();
    });
  });

  // Change Calculations Tests
  describe('Change Calculations', () => {
    test('displays positive change from buy correctly', () => {
      render(
        <PortfolioListItem
          coin={mockCoin}
          styles={mockStyles}
          formatCurrency={mockFormatCurrency}
          formatChange={mockFormatChange}
          onSentimentAnalyze={mockOnSentimentAnalyze}
          analyzingCoin={null}
        />
      );

      expect(screen.getByText('+12.50%')).toBeInTheDocument();
      // changeFromBuy = 0.5 * (45000 - 40000) = 2500
      expect(screen.getByText('$2500.00')).toBeInTheDocument();
    });

    test('displays negative change from buy correctly', () => {
      const negativeCoin = {
        ...mockCoin,
        currentPriceUsd: 35000,
        changePercentTotal: -12.5
      };

      render(
        <PortfolioListItem
          coin={negativeCoin}
          styles={mockStyles}
          formatCurrency={mockFormatCurrency}
          formatChange={mockFormatChange}
          onSentimentAnalyze={mockOnSentimentAnalyze}
          analyzingCoin={null}
        />
      );

      expect(screen.getByText('-12.50%')).toBeInTheDocument();
      // changeFromBuy = 0.5 * (35000 - 40000) = -2500
      expect(screen.getByText('$-2500.00')).toBeInTheDocument();
    });

    test('displays 24h change correctly', () => {
      render(
        <PortfolioListItem
          coin={mockCoin}
          styles={mockStyles}
          formatCurrency={mockFormatCurrency}
          formatChange={mockFormatChange}
          onSentimentAnalyze={mockOnSentimentAnalyze}
          analyzingCoin={null}
        />
      );

      expect(screen.getByText('+2.34%')).toBeInTheDocument();
    });

    test('displays 7d change correctly', () => {
      render(
        <PortfolioListItem
          coin={mockCoin}
          styles={mockStyles}
          formatCurrency={mockFormatCurrency}
          formatChange={mockFormatChange}
          onSentimentAnalyze={mockOnSentimentAnalyze}
          analyzingCoin={null}
        />
      );

      expect(screen.getByText('+5.67%')).toBeInTheDocument();
    });

    test('displays negative 24h change', () => {
      const negativeCoin = {
        ...mockCoin,
        changePercent24h: -3.45
      };

      render(
        <PortfolioListItem
          coin={negativeCoin}
          styles={mockStyles}
          formatCurrency={mockFormatCurrency}
          formatChange={mockFormatChange}
          onSentimentAnalyze={mockOnSentimentAnalyze}
          analyzingCoin={null}
        />
      );

      expect(screen.getByText('-3.45%')).toBeInTheDocument();
    });
  });

  // Sentiment Tests
  describe('Sentiment Display', () => {
    test('displays positive sentiment badge', () => {
      const coinWithSentiment = {
        ...mockCoin,
        sentiment: 'positive'
      };

      const { container } = render(
        <PortfolioListItem
          coin={coinWithSentiment}
          styles={mockStyles}
          formatCurrency={mockFormatCurrency}
          formatChange={mockFormatChange}
          onSentimentAnalyze={mockOnSentimentAnalyze}
          analyzingCoin={null}
        />
      );

      const badge = screen.getByText('POSITIVE');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveStyle({
        background: '#dcfce7',
        color: '#16a34a',
        border: '1px solid #86efac'
      });
    });

    test('displays negative sentiment badge', () => {
      const coinWithSentiment = {
        ...mockCoin,
        sentiment: 'negative'
      };

      const { container } = render(
        <PortfolioListItem
          coin={coinWithSentiment}
          styles={mockStyles}
          formatCurrency={mockFormatCurrency}
          formatChange={mockFormatChange}
          onSentimentAnalyze={mockOnSentimentAnalyze}
          analyzingCoin={null}
        />
      );

      const badge = screen.getByText('NEGATIVE');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveStyle({
        background: '#fee2e2',
        color: '#dc2626',
        border: '1px solid #fca5a5'
      });
    });

    test('displays neutral sentiment badge', () => {
      const coinWithSentiment = {
        ...mockCoin,
        sentiment: 'neutral'
      };

      render(
        <PortfolioListItem
          coin={coinWithSentiment}
          styles={mockStyles}
          formatCurrency={mockFormatCurrency}
          formatChange={mockFormatChange}
          onSentimentAnalyze={mockOnSentimentAnalyze}
          analyzingCoin={null}
        />
      );

      const badge = screen.getByText('NEUTRAL');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveStyle({
        background: '#f3f4f6',
        color: '#6b7280',
        border: '1px solid #d1d5db'
      });
    });

    test('displays dash when sentiment is null', () => {
      render(
        <PortfolioListItem
          coin={mockCoin}
          styles={mockStyles}
          formatCurrency={mockFormatCurrency}
          formatChange={mockFormatChange}
          onSentimentAnalyze={mockOnSentimentAnalyze}
          analyzingCoin={null}
        />
      );

      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });

  // Analyze Button Tests
  describe('Analyze Button', () => {
    test('renders analyze button with correct text', () => {
      render(
        <PortfolioListItem
          coin={mockCoin}
          styles={mockStyles}
          formatCurrency={mockFormatCurrency}
          formatChange={mockFormatChange}
          onSentimentAnalyze={mockOnSentimentAnalyze}
          analyzingCoin={null}
        />
      );

      expect(screen.getByText('Analyze')).toBeInTheDocument();
    });

    test('calls onSentimentAnalyze when analyze button is clicked', () => {
      render(
        <PortfolioListItem
          coin={mockCoin}
          styles={mockStyles}
          formatCurrency={mockFormatCurrency}
          formatChange={mockFormatChange}
          onSentimentAnalyze={mockOnSentimentAnalyze}
          analyzingCoin={null}
        />
      );

      const analyzeButton = screen.getByText('Analyze').closest('button');
      fireEvent.click(analyzeButton);

      expect(mockOnSentimentAnalyze).toHaveBeenCalledTimes(1);
      expect(mockOnSentimentAnalyze).toHaveBeenCalledWith(mockCoin);
    });

    test('shows analyzing state when coin is being analyzed', () => {
      render(
        <PortfolioListItem
          coin={mockCoin}
          styles={mockStyles}
          formatCurrency={mockFormatCurrency}
          formatChange={mockFormatChange}
          onSentimentAnalyze={mockOnSentimentAnalyze}
          analyzingCoin={mockCoin.id}
        />
      );

      expect(screen.getByText('Analyzing...')).toBeInTheDocument();
      expect(screen.queryByText('Analyze')).not.toBeInTheDocument();
    });

    test('disables button when analyzing', () => {
      render(
        <PortfolioListItem
          coin={mockCoin}
          styles={mockStyles}
          formatCurrency={mockFormatCurrency}
          formatChange={mockFormatChange}
          onSentimentAnalyze={mockOnSentimentAnalyze}
          analyzingCoin={mockCoin.id}
        />
      );

      const analyzeButton = screen.getByText('Analyzing...').closest('button');
      expect(analyzeButton).toBeDisabled();
    });

    test('does not call onSentimentAnalyze when button is disabled', () => {
      render(
        <PortfolioListItem
          coin={mockCoin}
          styles={mockStyles}
          formatCurrency={mockFormatCurrency}
          formatChange={mockFormatChange}
          onSentimentAnalyze={mockOnSentimentAnalyze}
          analyzingCoin={mockCoin.id}
        />
      );

      const analyzeButton = screen.getByText('Analyzing...').closest('button');
      fireEvent.click(analyzeButton);

      expect(mockOnSentimentAnalyze).not.toHaveBeenCalled();
    });

    test('button is enabled when analyzing different coin', () => {
      render(
        <PortfolioListItem
          coin={mockCoin}
          styles={mockStyles}
          formatCurrency={mockFormatCurrency}
          formatChange={mockFormatChange}
          onSentimentAnalyze={mockOnSentimentAnalyze}
          analyzingCoin={999} // Different coin ID
        />
      );

      const analyzeButton = screen.getByText('Analyze').closest('button');
      expect(analyzeButton).not.toBeDisabled();
    });
  });

  // Icon Tests
  describe('Icons Display', () => {
    test('displays TrendingUp icon for positive changes', () => {
      const { container } = render(
        <PortfolioListItem
          coin={mockCoin}
          styles={mockStyles}
          formatCurrency={mockFormatCurrency}
          formatChange={mockFormatChange}
          onSentimentAnalyze={mockOnSentimentAnalyze}
          analyzingCoin={null}
        />
      );

      // Should have TrendingUp icons for positive changes
      const positiveChips = container.querySelectorAll('[style*="background: rgb(220, 252, 231)"]');
      expect(positiveChips.length).toBeGreaterThan(0);
    });

    test('displays TrendingDown icon for negative changes', () => {
      const negativeCoin = {
        ...mockCoin,
        currentPriceUsd: 35000,
        changePercentTotal: -12.5,
        changePercent24h: -2.34,
        changePercent7d: -5.67
      };

      const { container } = render(
        <PortfolioListItem
          coin={negativeCoin}
          styles={mockStyles}
          formatCurrency={mockFormatCurrency}
          formatChange={mockFormatChange}
          onSentimentAnalyze={mockOnSentimentAnalyze}
          analyzingCoin={null}
        />
      );

      // Should have TrendingDown icons for negative changes
      const negativeChips = container.querySelectorAll('[style*="background: rgb(254, 226, 226)"]');
      expect(negativeChips.length).toBeGreaterThan(0);
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
    test('handles zero change values', () => {
      const zeroCoin = {
        ...mockCoin,
        currentPriceUsd: 40000, // Same as buy price
        changePercentTotal: 0,
        changePercent24h: 0,
        changePercent7d: 0
      };

      render(
        <PortfolioListItem
          coin={zeroCoin}
          styles={mockStyles}
          formatCurrency={mockFormatCurrency}
          formatChange={mockFormatChange}
          onSentimentAnalyze={mockOnSentimentAnalyze}
          analyzingCoin={null}
        />
      );

      expect(screen.getAllByText('+0.00%').length).toBeGreaterThan(0);
    });

    test('handles very large amounts', () => {
      const largeCoin = {
        ...mockCoin,
        amount: 1000000,
        currentPriceUsd: 50000
      };

      render(
        <PortfolioListItem
          coin={largeCoin}
          styles={mockStyles}
          formatCurrency={mockFormatCurrency}
          formatChange={mockFormatChange}
          onSentimentAnalyze={mockOnSentimentAnalyze}
          analyzingCoin={null}
        />
      );

      expect(screen.getByText('1000000')).toBeInTheDocument();
      // Portfolio value = 1000000 * 50000 = 50,000,000,000
      expect(screen.getByText('$50000000000.00')).toBeInTheDocument();
    });

    test('handles decimal amounts', () => {
      const decimalCoin = {
        ...mockCoin,
        amount: 0.00123456
      };

      render(
        <PortfolioListItem
          coin={decimalCoin}
          styles={mockStyles}
          formatCurrency={mockFormatCurrency}
          formatChange={mockFormatChange}
          onSentimentAnalyze={mockOnSentimentAnalyze}
          analyzingCoin={null}
        />
      );

      expect(screen.getByText('0.00123456')).toBeInTheDocument();
    });
  });

  // Snapshot Test
  describe('Snapshot', () => {
    test('matches snapshot', () => {
      const { container } = render(
        <PortfolioListItem
          coin={mockCoin}
          styles={mockStyles}
          formatCurrency={mockFormatCurrency}
          formatChange={mockFormatChange}
          onSentimentAnalyze={mockOnSentimentAnalyze}
          analyzingCoin={null}
        />
      );

      expect(container).toMatchSnapshot();
    });

    test('matches snapshot with sentiment', () => {
      const coinWithSentiment = {
        ...mockCoin,
        sentiment: 'positive'
      };

      const { container } = render(
        <PortfolioListItem
          coin={coinWithSentiment}
          styles={mockStyles}
          formatCurrency={mockFormatCurrency}
          formatChange={mockFormatChange}
          onSentimentAnalyze={mockOnSentimentAnalyze}
          analyzingCoin={null}
        />
      );

      expect(container).toMatchSnapshot();
    });

    test('matches snapshot while analyzing', () => {
      const { container } = render(
        <PortfolioListItem
          coin={mockCoin}
          styles={mockStyles}
          formatCurrency={mockFormatCurrency}
          formatChange={mockFormatChange}
          onSentimentAnalyze={mockOnSentimentAnalyze}
          analyzingCoin={mockCoin.id}
        />
      );

      expect(container).toMatchSnapshot();
    });
  });
});