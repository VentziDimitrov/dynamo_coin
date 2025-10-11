import { render, screen } from '@testing-library/react';
import SummaryCard from './SummaryCard';
import styles from '../globalStyles'

describe('SummaryCard Component', () => {
  const mockFormatCurrency = (value) => `$${value.toFixed(2)}`;

  test('renders card with label and value', () => {
    render(
      <SummaryCard
        styles={styles}
        label="Total Assets"
        value={5}
        subtext="Cryptocurrencies"
      />
    );
    
    expect(screen.getByText(/total assets/i)).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText(/cryptocurrencies/i)).toBeInTheDocument();
  });

  test('displays positive change indicator', () => {
    render(
      <SummaryCard
      styles={styles}
        label="Total Portfolio Value"
        value="$50,000.00"
        changePercent={5.67}
        changeValue={2500}
        formatCurrency={mockFormatCurrency}
      />
    );
    
    expect(screen.getByText(/\+5\.67%/)).toBeInTheDocument();
    expect(screen.getByText(/\+\$2500\.00/)).toBeInTheDocument();
  });

  test('displays negative change indicator', () => {
    render(
      <SummaryCard
      styles={styles}
        label="Total Portfolio Value"
        value="$45,000.00"
        changePercent={-3.25}
        changeValue={-1500}
        formatCurrency={mockFormatCurrency}
      />
    );
    
    expect(screen.getByText(/-3\.25/)).toBeInTheDocument();
    expect(screen.getByText(/-1500\.00/)).toBeInTheDocument();
  });

  test('renders TrendingUp icon for positive change', () => {
    const { container } = render(
      <SummaryCard
      styles={styles}
        label="Portfolio"
        value="$50,000"
        changePercent={5}
        changeValue={1000}
        formatCurrency={mockFormatCurrency}
      />
    );
    
    // Check if green color is applied (positive change)
    const changeIndicator = container.querySelector('[style*="color: rgb(16, 185, 129)"]');
    expect(changeIndicator).toBeInTheDocument();
  });

  test('renders TrendingDown icon for negative change', () => {
    const { container } = render(
      <SummaryCard
      styles={styles}
        label="Portfolio"
        value="$50,000"
        changePercent={-5}
        changeValue={-1000}
        formatCurrency={mockFormatCurrency}
      />
    );
    
    // Check if red color is applied (negative change)
    const changeIndicator = container.querySelector('[style*="color: rgb(239, 68, 68)"]');
    expect(changeIndicator).toBeInTheDocument();
  });

  test('does not render change section when no change data provided', () => {
    render(
      <SummaryCard
      styles={styles}
        label="Total Assets"
        value={10}
        subtext="Items"
      />
    );
    
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });
});
