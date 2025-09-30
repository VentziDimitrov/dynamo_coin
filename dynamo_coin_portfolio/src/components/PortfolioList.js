import React from 'react';
import PortfolioListItem from './PortfolioListItem';

const PortfolioList = ({ coins, styles, formatNumber, formatCurrency, formatChange, getChangeIcon, onSentimentAnalyze, analyzingCoin }) => (
  <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <div style={styles.headerCell1}>Asset</div>
            <div style={styles.headerCell2}>Holdings</div>
            <div style={styles.headerCell3}>Portfolio Value</div>
            <div style={styles.headerCell4}>Change from Buy</div>
            <div style={styles.headerCell5}>24h Change</div>
            <div style={styles.headerCell6}>7d Change</div>            
            <div style={styles.headerCell8}>Actions</div>
            <div style={styles.headerCell7}>Sentiment</div>
          </div>

          <div style={styles.tableBody}>
            {coins.map((coin) => (
               <PortfolioListItem
                  key={coin.id}
                  coin={coin}
                  styles={styles}
                  formatNumber={formatNumber}
                  formatCurrency={formatCurrency}
                  formatChange={formatChange}
                  getChangeIcon={getChangeIcon}
                  onSentimentAnalyze={onSentimentAnalyze}
                  analyzingCoin={analyzingCoin}
                />
            ))}
          </div>
        </div>
);

export default PortfolioList;