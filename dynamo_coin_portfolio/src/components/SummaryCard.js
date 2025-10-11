import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const SummaryCard = ({
  styles, 
  label, 
  value, 
  subtext, 
  changePercent, 
  changeValue, 
  formatCurrency 
}) => {
  const hasChange = changePercent !== undefined && changeValue !== undefined;
  const isPositive = changePercent >= 0;

  return (
    <div style={styles.summaryCard}>
      <div style={styles.summaryLabel}>{label}</div>
      <div style={styles.summaryValue}>{value}</div>
      
      {hasChange ? (
        <div style={styles.summaryChange}>
          <div style={{
            ...styles.changeIndicator,
            color: isPositive ? '#10b981' : '#ef4444'
          }}>
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span style={styles.summarySubTotalValue}>
              {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
            </span>
          </div>
          <span style={styles.summarySubTotalChange}>
            {isPositive ? '+' : ''}{formatCurrency(changeValue)}
          </span>
        </div>
      ) : (
        subtext && <div style={styles.summarySubtext}>{subtext}</div>
      )}
    </div>
  );
};

export default SummaryCard;