import React from 'react';
import PortfolioListItem from './PortfolioListItem';

const PortfolioList = ({ coins, styles, formatNumber, formatCurrency, formatChange, getChangeIcon, onSentimentAnalyze, sentiment }) => (
  <div style={styles.assetsList}>
    {coins.map(asset => (
      <PortfolioListItem
        key={asset.id}
        asset={asset}
        styles={styles}
        formatNumber={formatNumber}
        formatCurrency={formatCurrency}
        formatChange={formatChange}
        getChangeIcon={getChangeIcon}
        onSentimentAnalyze={onSentimentAnalyze}
        sentiment={sentiment}
      />
    ))}
  </div>
);

export default PortfolioList;