import React from 'react';

const PortfolioListItem = ({ asset, styles, formatNumber, formatCurrency, formatChange, getChangeIcon, onSentimentAnalyze, sentiment }) => (
  <div style={styles.assetCard}>
    <div style={styles.assetHeader}>
      <div style={styles.assetInfo}>
        <div style={styles.assetAvatar}>
          <span style={styles.assetAvatarText}>{asset.symbol.slice(0, 3)}</span>
        </div>
        <div>
          <div style={styles.assetName}>{asset.name}</div>
          <div style={styles.assetSymbol}>{asset.symbol}</div>
        </div>
      </div>
    </div>
    <div style={styles.inputWrapper}>
      <div style={styles.inputGroup}>
        <span style={styles.inputLabel}>Amount</span>
        <div style={styles.assetValue}>{formatNumber(asset.amount)}</div>
      </div>
      <div style={styles.inputGroup}>
        <span style={styles.inputLabel}>BUY Value</span>
        <div style={styles.assetValue}>
          {formatCurrency(asset.amount * asset.buyPriceUsd)}
        </div>
      </div>
      <div style={styles.inputGroup}>
        <span style={styles.inputLabel}>Current Value</span>
        <div style={styles.assetValue}>
          {formatCurrency(asset.amount * asset.currentPriceUsd)}
        </div>
      </div>
      <div style={styles.inputGroup}>
        <span style={styles.inputLabel}>Change (%)</span>
        <div style={styles.assetValue}>
          {formatChange(asset.changePercentTotal)}
          {getChangeIcon(asset.changePercentTotal)}
        </div>
      </div>
      <div style={styles.santimentParent}>
        <button
          style={styles.sentimentButton}
          
          onClick={() => onSentimentAnalyze && onSentimentAnalyze(asset)}
        >
          Analyze Sentiment
        </button>
        {asset.sentiment ? <div style={styles.assetValue}>{asset.sentiment}</div> : null}
    </div>
    </div>
     
    <div style={styles.assetFooter}></div>
  </div>
);

export default PortfolioListItem;