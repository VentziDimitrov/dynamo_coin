import { render, screen } from '@testing-library/react';
import CryptoPortfolioCalculator from './App';

test('renders learn react link', () => {
  render(<CryptoPortfolioCalculator />);
  const linkElement = screen.getByText(/Crypto Portfolio Calculator/i);
  expect(linkElement).toBeInTheDocument();
});
