import { TrendingUp, TrendingDown, Loader2, BarChart3 } from 'lucide-react';

const PortfolioListItem = ({ coin, styles, formatCurrency, formatChange, onSentimentAnalyze, analyzingCoin }) => {
              if (!coin) return <div/>

              const portfolioValue = coin.currentPriceUsd * coin.amount;
              const changeFromBuy = coin.amount * (coin.currentPriceUsd - coin.buyPriceUsd);
              const getSentimentStyle = (sentiment) => {
                              switch(sentiment) {
                                case 'positive':
                                  return {
                                    background: '#dcfce7',
                                    color: '#16a34a',
                                    border: '1px solid #86efac'
                                  };
                                case 'negative':
                                  return {
                                    background: '#fee2e2',
                                    color: '#dc2626',
                                    border: '1px solid #fca5a5'
                                  };
                                case 'neutral':
                                  return {
                                    background: '#f3f4f6',
                                    color: '#6b7280',
                                    border: '1px solid #d1d5db'
                                  };
                                default:
                                  return {};
                              }
                            };

              return (
                <div key={coin.id} style={styles.tableRow}>
                  <div style={styles.cell1}>
                    <div style={styles.coinInfo}>
                      <div>
                        <div style={styles.coinSymbol}>{coin.symbol}</div>
                        <div style={styles.coinName}>{coin.name}</div>
                      </div>
                    </div>
                  </div>

                  <div style={styles.cell2}>
                    <div style={styles.holdingAmount}>{coin.amount}</div>
                  </div>

                  <div style={styles.cell3}>
                    <div style={styles.portfolioValue}>{formatCurrency(portfolioValue)}</div>
                  </div>

                  <div style={styles.cell4}>
                    <div style={{
                      ...styles.changeChip,
                      background: changeFromBuy >= 0 ? '#dcfce7' : '#fee2e2',
                      color: changeFromBuy >= 0 ? '#16a34a' : '#dc2626'
                    }}>
                      {changeFromBuy >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      <span style={styles.changeText}>
                        {formatChange(coin.changePercentTotal)}
                      </span>
                    </div>
                    <div style={styles.changeSubtext}>
                      {formatCurrency(changeFromBuy)}
                    </div>
                  </div>

                  <div style={styles.cell5}>
                    <div style={{
                      ...styles.changeChip,
                      background: coin.changePercent24h >= 0 ? '#dcfce7' : '#fee2e2',
                      color: coin.changePercent24h >= 0 ? '#16a34a' : '#dc2626'
                    }}>
                      {coin.changePercent24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      <span style={styles.changeText}>
                        {coin.changePercent24h >= 0 ? '+' : ''}{coin.changePercent24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div style={styles.cell6}>
                    <div style={{
                      ...styles.changeChip,
                      background: coin.changePercent7d >= 0 ? '#dcfce7' : '#fee2e2',
                      color: coin.changePercent7d >= 0 ? '#16a34a' : '#dc2626'
                    }}>
                      {coin.changePercent7d >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      <span style={styles.changeText}>
                        {coin.changePercent7d >= 0 ? '+' : ''}{coin.changePercent7d.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div style={styles.cell8}>
                    <button 
                      style={{
                        ...styles.analyzeButton,
                        opacity: analyzingCoin === coin.id ? 0.7 : 1,
                        cursor: analyzingCoin === coin.id ? 'not-allowed' : 'pointer'
                      }}
                      onClick={() => onSentimentAnalyze(coin)}
                      disabled={analyzingCoin === coin.id}
                    >
                      {analyzingCoin === coin.id ? (
                        <>
                          <Loader2 size={16} style={styles.spinningIcon} />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <BarChart3 size={16} />
                          <span>Analyze</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div style={styles.cell7}>
                    {coin.sentiment ? (
                      <div style={{
                        ...styles.sentimentBadge,
                        ...getSentimentStyle(coin.sentiment)
                      }}>
                        {coin.sentiment.toUpperCase()}
                      </div>
                    ) : (
                      <span style={styles.noSentiment}>—</span>
                    )}
                  </div>
                </div>
        )
      }

export default PortfolioListItem;