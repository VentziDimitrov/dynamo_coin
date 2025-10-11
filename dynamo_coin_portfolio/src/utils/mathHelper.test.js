// src/utils/calculations.test.js
import {
  calculateChange,
  calculateTotalValue,
  calculateTotalBuyValue,
  calculateOverallChange
} from './mathHelper';

describe('Calculation Utilities', () => {
  
  // Mock data
  const mockAssets = [
    {
      id: 1,
      symbol: 'BTC',
      amount: 0.5,
      currentPriceUsd: 45000,
      buyPriceUsd: 40000
    },
    {
      id: 2,
      symbol: 'ETH',
      amount: 2.0,
      currentPriceUsd: 2500,
      buyPriceUsd: 2000
    },
    {
      id: 3,
      symbol: 'ADA',
      amount: 1000,
      currentPriceUsd: 0.5,
      buyPriceUsd: 0.4
    }
  ];

  describe('calculateChange', () => {
    describe('Valid Inputs', () => {
      test('should calculate positive change correctly', () => {
        const result = calculateChange(40000, 45000);
        expect(result).toBe('+ 12.50%');
      });

      test('should calculate negative change correctly', () => {
        const result = calculateChange(45000, 40000);
        expect(result).toBe('- -11.11%');
      });

      test('should calculate zero change', () => {
        const result = calculateChange(100, 100);
        expect(result).toBe('- 0.00%');
      });

      test('should handle small positive changes', () => {
        const result = calculateChange(100, 100.5);
        expect(result).toBe('+ 0.50%');
      });

      test('should handle small negative changes', () => {
        const result = calculateChange(100, 99.5);
        expect(result).toBe('- -0.50%');
      });

      test('should handle large positive changes', () => {
        const result = calculateChange(1000, 5000);
        expect(result).toBe('+ 400.00%');
      });

      test('should handle large negative changes', () => {
        const result = calculateChange(5000, 1000);
        expect(result).toBe('- -80.00%');
      });

      test('should round to 2 decimal places', () => {
        const result = calculateChange(100, 133.333);
        expect(result).toBe('+ 33.33%');
      });

      test('should handle decimal buy prices', () => {
        const result = calculateChange(0.001, 0.002);
        expect(result).toBe('+ 100.00%');
      });

      test('should handle very small numbers', () => {
        const result = calculateChange(0.0001, 0.0002);
        expect(result).toBe('+ 100.00%');
      });
    });

    describe('Edge Cases and Invalid Inputs', () => {
      test('should return N/A when buyPrice is null', () => {
        const result = calculateChange(null, 45000);
        expect(result).toBe('N/A');
      });

      test('should return N/A when currentPrice is null', () => {
        const result = calculateChange(40000, null);
        expect(result).toBe('N/A');
      });

      test('should return N/A when both prices are null', () => {
        const result = calculateChange(null, null);
        expect(result).toBe('N/A');
      });

      test('should return N/A when buyPrice is undefined', () => {
        const result = calculateChange(undefined, 45000);
        expect(result).toBe('N/A');
      });

      test('should return N/A when currentPrice is undefined', () => {
        const result = calculateChange(40000, undefined);
        expect(result).toBe('N/A');
      });

      test('should return N/A when buyPrice is 0', () => {
        const result = calculateChange(0, 45000);
        expect(result).toBe('N/A');
      });

      test('should return N/A when buyPrice is empty string', () => {
        const result = calculateChange('', 45000);
        expect(result).toBe('N/A');
      });

      test('should return N/A when currentPrice is empty string', () => {
        const result = calculateChange(40000, '');
        expect(result).toBe('N/A');
      });

      test('should handle NaN values', () => {
        const result = calculateChange(NaN, 45000);
        expect(result).toBe('N/A');
      });

      test('should handle negative prices', () => {
        const result = calculateChange(-100, -50);
        expect(result).toBe('- -50.00%');
      });
    });

    describe('Format Verification', () => {
      test('should include + sign for positive change', () => {
        const result = calculateChange(100, 150);
        expect(result).toMatch(/^\+ /);
      });

      test('should include - sign for negative change', () => {
        const result = calculateChange(150, 100);
        expect(result).toMatch(/^- /);
      });

      test('should include % symbol', () => {
        const result = calculateChange(100, 150);
        expect(result).toMatch(/%$/);
      });

      test('should have correct format: sign + space + number + %', () => {
        const result = calculateChange(100, 150);
        expect(result).toMatch(/^[+-] \d+\.\d{2}%$/);
      });
    });
  });

  describe('calculateTotalValue', () => {
    describe('Valid Inputs', () => {
      test('should calculate total value for multiple assets', () => {
        const result = calculateTotalValue(mockAssets);
        // BTC: 0.5 * 45000 = 22500
        // ETH: 2.0 * 2500 = 5000
        // ADA: 1000 * 0.5 = 500
        // Total: 28000
        expect(result).toBe(28000);
      });

      test('should calculate total value for single asset', () => {
        const singleAsset = [mockAssets[0]];
        const result = calculateTotalValue(singleAsset);
        expect(result).toBe(22500);
      });

      test('should handle empty array', () => {
        const result = calculateTotalValue([]);
        expect(result).toBe(0);
      });

      test('should handle assets with decimal amounts', () => {
        const assets = [
          { amount: 0.123, currentPriceUsd: 1000 }
        ];
        const result = calculateTotalValue(assets);
        expect(result).toBe(123);
      });

      test('should handle assets with decimal prices', () => {
        const assets = [
          { amount: 100, currentPriceUsd: 0.456 }
        ];
        const result = calculateTotalValue(assets);
        expect(result).toBe(45.6);
      });

      test('should handle string numbers that can be parsed', () => {
        const assets = [
          { amount: '5', currentPriceUsd: '100' }
        ];
        const result = calculateTotalValue(assets);
        expect(result).toBe(500);
      });
    });

    describe('Invalid and Edge Cases', () => {
      test('should skip assets with NaN amount', () => {
        const assets = [
          { amount: NaN, currentPriceUsd: 100 },
          { amount: 5, currentPriceUsd: 100 }
        ];
        const result = calculateTotalValue(assets);
        expect(result).toBe(500);
      });

      test('should skip assets with NaN price', () => {
        const assets = [
          { amount: 5, currentPriceUsd: NaN },
          { amount: 5, currentPriceUsd: 100 }
        ];
        const result = calculateTotalValue(assets);
        expect(result).toBe(500);
      });

      test('should skip assets with null values', () => {
        const assets = [
          { amount: null, currentPriceUsd: 100 },
          { amount: 5, currentPriceUsd: null },
          { amount: 5, currentPriceUsd: 100 }
        ];
        const result = calculateTotalValue(assets);
        expect(result).toBe(500);
      });

      test('should skip assets with undefined values', () => {
        const assets = [
          { amount: undefined, currentPriceUsd: 100 },
          { amount: 5, currentPriceUsd: undefined },
          { amount: 5, currentPriceUsd: 100 }
        ];
        const result = calculateTotalValue(assets);
        expect(result).toBe(500);
      });

      test('should skip assets with empty string values', () => {
        const assets = [
          { amount: '', currentPriceUsd: 100 },
          { amount: 5, currentPriceUsd: '' },
          { amount: 5, currentPriceUsd: 100 }
        ];
        const result = calculateTotalValue(assets);
        expect(result).toBe(500);
      });

      test('should skip assets with non-numeric strings', () => {
        const assets = [
          { amount: 'abc', currentPriceUsd: 100 },
          { amount: 5, currentPriceUsd: 'xyz' },
          { amount: 5, currentPriceUsd: 100 }
        ];
        const result = calculateTotalValue(assets);
        expect(result).toBe(500);
      });

      test('should handle zero amounts', () => {
        const assets = [
          { amount: 0, currentPriceUsd: 100 },
          { amount: 5, currentPriceUsd: 100 }
        ];
        const result = calculateTotalValue(assets);
        expect(result).toBe(500);
      });

      test('should handle zero prices', () => {
        const assets = [
          { amount: 5, currentPriceUsd: 0 },
          { amount: 5, currentPriceUsd: 100 }
        ];
        const result = calculateTotalValue(assets);
        expect(result).toBe(500);
      });

      test('should handle negative values', () => {
        const assets = [
          { amount: -5, currentPriceUsd: 100 }
        ];
        const result = calculateTotalValue(assets);
        expect(result).toBe(-500);
      });
    });
  });

  describe('calculateTotalBuyValue', () => {
    describe('Valid Inputs', () => {
      test('should calculate total buy value for multiple assets', () => {
        const result = calculateTotalBuyValue(mockAssets);
        // BTC: 0.5 * 40000 = 20000
        // ETH: 2.0 * 2000 = 4000
        // ADA: 1000 * 0.4 = 400
        // Total: 24400
        expect(result).toBe(24400);
      });

      test('should calculate total buy value for single asset', () => {
        const singleAsset = [mockAssets[0]];
        const result = calculateTotalBuyValue(singleAsset);
        expect(result).toBe(20000);
      });

      test('should handle empty array', () => {
        const result = calculateTotalBuyValue([]);
        expect(result).toBe(0);
      });

      test('should handle assets with decimal amounts', () => {
        const assets = [
          { amount: 0.123, buyPriceUsd: 1000 }
        ];
        const result = calculateTotalBuyValue(assets);
        expect(result).toBe(123);
      });

      test('should handle string numbers that can be parsed', () => {
        const assets = [
          { amount: '5', buyPriceUsd: '100' }
        ];
        const result = calculateTotalBuyValue(assets);
        expect(result).toBe(500);
      });
    });

    describe('Invalid and Edge Cases', () => {
      test('should skip assets with NaN amount', () => {
        const assets = [
          { amount: NaN, buyPriceUsd: 100 },
          { amount: 5, buyPriceUsd: 100 }
        ];
        const result = calculateTotalBuyValue(assets);
        expect(result).toBe(500);
      });

      test('should skip assets with NaN price', () => {
        const assets = [
          { amount: 5, buyPriceUsd: NaN },
          { amount: 5, buyPriceUsd: 100 }
        ];
        const result = calculateTotalBuyValue(assets);
        expect(result).toBe(500);
      });

      test('should skip assets with null values', () => {
        const assets = [
          { amount: null, buyPriceUsd: 100 },
          { amount: 5, buyPriceUsd: null },
          { amount: 5, buyPriceUsd: 100 }
        ];
        const result = calculateTotalBuyValue(assets);
        expect(result).toBe(500);
      });

      test('should skip assets with undefined values', () => {
        const assets = [
          { amount: undefined, buyPriceUsd: 100 },
          { amount: 5, buyPriceUsd: undefined },
          { amount: 5, buyPriceUsd: 100 }
        ];
        const result = calculateTotalBuyValue(assets);
        expect(result).toBe(500);
      });

      test('should handle zero amounts', () => {
        const assets = [
          { amount: 0, buyPriceUsd: 100 },
          { amount: 5, buyPriceUsd: 100 }
        ];
        const result = calculateTotalBuyValue(assets);
        expect(result).toBe(500);
      });

      test('should handle zero prices', () => {
        const assets = [
          { amount: 5, buyPriceUsd: 0 },
          { amount: 5, buyPriceUsd: 100 }
        ];
        const result = calculateTotalBuyValue(assets);
        expect(result).toBe(500);
      });
    });
  });

  describe('calculateOverallChange', () => {
    describe('Valid Inputs', () => {
      test('should calculate overall change for portfolio', () => {
        const result = calculateOverallChange(mockAssets);
        // Total current: 28000
        // Total buy: 24400
        // Change: ((28000 - 24400) / 24400) * 100 = 14.75%
        expect(result).toBeCloseTo(14.75, 2);
      });

      test('should calculate positive overall change', () => {
        const assets = [
          { amount: 1, currentPriceUsd: 150, buyPriceUsd: 100 }
        ];
        const result = calculateOverallChange(assets);
        expect(result).toBe(50);
      });

      test('should calculate negative overall change', () => {
        const assets = [
          { amount: 1, currentPriceUsd: 75, buyPriceUsd: 100 }
        ];
        const result = calculateOverallChange(assets);
        expect(result).toBe(-25);
      });

      test('should calculate zero change when prices are same', () => {
        const assets = [
          { amount: 1, currentPriceUsd: 100, buyPriceUsd: 100 }
        ];
        const result = calculateOverallChange(assets);
        expect(result).toBe(0);
      });

      test('should handle multiple assets with mixed changes', () => {
        const assets = [
          { amount: 1, currentPriceUsd: 150, buyPriceUsd: 100 }, // +50
          { amount: 1, currentPriceUsd: 75, buyPriceUsd: 100 }   // -25
        ];
        const result = calculateOverallChange(assets);
        // Total current: 225, Total buy: 200
        // Change: ((225 - 200) / 200) * 100 = 12.5%
        expect(result).toBe(12.5);
      });

      test('should handle empty array', () => {
        const result = calculateOverallChange([]);
        expect(result).toBe('N/A');
      });
    });

    describe('Invalid and Edge Cases', () => {
      test('should return N/A when total buy value is zero', () => {
        const assets = [
          { amount: 1, currentPriceUsd: 100, buyPriceUsd: 0 }
        ];
        const result = calculateOverallChange(assets);
        expect(result).toBe('N/A');
      });

      test('should return 0 when assets is not an array', () => {
        const result = calculateOverallChange(null);
        expect(result).toBe(0);
      });

      test('should return 0 when assets is undefined', () => {
        const result = calculateOverallChange(undefined);
        expect(result).toBe(0);
      });

      test('should return 0 when assets is a string', () => {
        const result = calculateOverallChange('not an array');
        expect(result).toBe(0);
      });

      test('should return 0 when assets is a number', () => {
        const result = calculateOverallChange(123);
        expect(result).toBe(0);
      });

      test('should return 0 when assets is an object', () => {
        const result = calculateOverallChange({ amount: 1 });
        expect(result).toBe(0);
      });

      test('should handle assets with invalid data', () => {
        const assets = [
          { amount: null, currentPriceUsd: 100, buyPriceUsd: 100 },
          { amount: 1, currentPriceUsd: 150, buyPriceUsd: 100 }
        ];
        const result = calculateOverallChange(assets);
        expect(result).toBe(50);
      });

      test('should handle very large numbers', () => {
        const assets = [
          { amount: 1000000, currentPriceUsd: 50000, buyPriceUsd: 40000 }
        ];
        const result = calculateOverallChange(assets);
        expect(result).toBe(25);
      });

      test('should handle very small numbers', () => {
        const assets = [
          { amount: 0.0001, currentPriceUsd: 0.002, buyPriceUsd: 0.001 }
        ];
        const result = calculateOverallChange(assets);
        expect(result).toBe(100);
      });
    });

    describe('Integration with other functions', () => {
      test('should use calculateTotalValue correctly', () => {
        const assets = [mockAssets[0]];
        const totalValue = calculateTotalValue(assets);
        const totalBuyValue = calculateTotalBuyValue(assets);
        const overallChange = calculateOverallChange(assets);
        
        const expectedChange = ((totalValue - totalBuyValue) / totalBuyValue) * 100;
        expect(overallChange).toBeCloseTo(expectedChange, 2);
      });

      test('should use calculateTotalBuyValue correctly', () => {
        const assets = mockAssets;
        const result = calculateOverallChange(assets);
        
        const totalValue = calculateTotalValue(assets);
        const totalBuyValue = calculateTotalBuyValue(assets);
        const expectedChange = ((totalValue - totalBuyValue) / totalBuyValue) * 100;
        
        expect(result).toBeCloseTo(expectedChange, 2);
      });
    });
  });

  describe('Function Integration Tests', () => {
    test('all functions should work together for a complete portfolio calculation', () => {
      const assets = mockAssets;
      
      const totalValue = calculateTotalValue(assets);
      const totalBuyValue = calculateTotalBuyValue(assets);
      const overallChange = calculateOverallChange(assets);
      
      expect(totalValue).toBe(28000);
      expect(totalBuyValue).toBe(24400);
      expect(overallChange).toBeCloseTo(14.75, 2);
      
      // Verify the calculation manually
      const manualChange = ((totalValue - totalBuyValue) / totalBuyValue) * 100;
      expect(overallChange).toBeCloseTo(manualChange, 2);
    });

    test('calculateChange should work with results from other functions', () => {
      const assets = [mockAssets[0]];
      
      const totalValue = calculateTotalValue(assets);
      const totalBuyValue = calculateTotalBuyValue(assets);
      const changeString = calculateChange(totalBuyValue, totalValue);
      
      expect(changeString).toBe('+ 12.50%');
    });
  });

  describe('Performance Tests', () => {
    test('should handle large arrays efficiently', () => {
      const largeArray = Array(10000).fill({
        amount: 1,
        currentPriceUsd: 100,
        buyPriceUsd: 90
      });
      
      const startTime = performance.now();
      calculateTotalValue(largeArray);
      calculateTotalBuyValue(largeArray);
      calculateOverallChange(largeArray);
      const endTime = performance.now();
      
      // Should complete in less than 100ms
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});