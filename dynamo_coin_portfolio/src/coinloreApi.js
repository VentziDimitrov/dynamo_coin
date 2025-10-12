import config from './config/config'

const BASE_URL = config.coinloreBaseUrl;

/**
 * Fetches coin list from CoinLore API.
 * @returns {Promise<Array>} Array of coin objects.
 */
export async function fetchFullCoinList() {
  const response = await fetch(`${BASE_URL}tickers/`);
  if (!response.ok) {
    throw new Error('Failed to fetch coin list');
  }
  const data = await response.json();
  return data.data;
}

/**
 * Fetches coin list from CoinLore API.
 * @returns {Promise<Array>} Array of coin objects.
 */
export async function fetchCoinList(list) {
  if (!list || !Array.isArray(list) || list.length < 1) {
    return [];
  }
  // https://api.coinlore.net/api/ticker/?id=90,80,2710
  const response = await fetch(`${BASE_URL}ticker/?id=${list.join(',')}`);
  if (!response.ok) {
    throw new Error('Failed to fetch coin list');
  }
  const data = await response.json();
  return data;
}

/**
 * Fetches coin details by CoinLore ID.
 * @param {string|number} coinId - CoinLore coin ID.
 * @returns {Promise<Object>} Coin details object.
 */
export async function fetchCoinDetails(coinId) {
  const response = await fetch(`${BASE_URL}ticker/?id=${coinId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch coin details');
  }
  const data = await response.json();
  return data[0];
}

/**
 * Fetches price for a given symbol (e.g., BTC, ETH).
 * @param {string} symbol - Coin symbol.
 * @returns {Promise<number|null>} Price in USD or null if not found.
 */
export async function fetchPriceBySymbol(symbol) {
  const coins = await fetchCoinList();
  const coin = coins.find(c => c.symbol.toUpperCase() === symbol.toUpperCase());
  return coin ? parseFloat(coin.price_usd) : null;
}

/**
 * Fetches 24h price change percentage for a given symbol.
 * @param {string} symbol - Coin symbol.
 * @returns {Promise<number|null>} 24h percent change or null if not found.
 */
export async function fetchChange24hBySymbol(symbol) {
  const coins = await fetchCoinList();
  const coin = coins.find(c => c.symbol.toUpperCase() === symbol.toUpperCase());
  return coin ? parseFloat(coin.percent_change_24h) : null;
}