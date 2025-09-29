export function calculateChange (buyPrice, currentPrice) {
    if (!buyPrice || !currentPrice) return 'N/A';
    const change = ((currentPrice - buyPrice) / buyPrice) * 100;
    const changeSign = change > 0 ? '+ ' : '- ';
    return changeSign + change.toFixed(2) + '%';
  }

  export function calculateTotalValue (assets) {
    return assets.reduce((sum, asset) => {
      const amount = parseFloat(asset.amount);
      const price = parseFloat(asset.price_current);
      if (!isNaN(amount) && !isNaN(price)) {
        return sum + (amount * price);
      }
      return sum;
    }, 0);
  };

  export function calculateTotalBuyValue (assets) {
    return assets.reduce((sum, asset) => {
      const amount = parseFloat(asset.amount);
      const price = parseFloat(asset.price_buy);
      if (!isNaN(amount) && !isNaN(price)) {
        return sum + (amount * price);
      }
      return sum;
    }, 0);
  };

  export function calculateOverallChange (assets) {
    if (!Array.isArray(assets)) return 0;

    const totalBuyValue = calculateTotalBuyValue(assets);
    const totalCurrentValue = calculateTotalValue(assets);
    if (totalBuyValue === 0) return 'N/A';
    const change = ((totalCurrentValue - totalBuyValue) / totalBuyValue) * 100;
    return change;
  }