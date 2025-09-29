export function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

export function formatNumber(value) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 8
    }).format(value);
};

export function formatChange(value) {
    const changeSign = value > 0 ? '+ ' : '- ';
    return changeSign + value.toFixed(2) + '%';
};