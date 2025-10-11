// src/redux/slices/portfolioSlice.test.js
import portfolioReducer, {
  setPortfolio,
  setFileUploaded,
  setUploadError,
  setRefreshRate,
  setAnalyzingCoin,
} from './portfolioSlice';

describe('portfolioSlice', () => {
  const initialState = {
    portfolio: {},
    fileUploaded: false,
    uploadError: '',
    refreshRate: 5,
    analyzingCoin: null,
  };

  // Mock portfolio data
  const mockPortfolio = {
    coins: [
      {
        id: 1,
        symbol: 'BTC',
        name: 'Bitcoin',
        amount: 0.5,
        currentPriceUsd: 45000,
        buyPriceUsd: 40000,
        changePercent24h: 2.34,
        changePercent7d: 5.67,
        sentiment: null,
      },
      {
        id: 2,
        symbol: 'ETH',
        name: 'Ethereum',
        amount: 2.0,
        currentPriceUsd: 2500,
        buyPriceUsd: 2000,
        changePercent24h: -1.23,
        changePercent7d: 8.45,
        sentiment: 'positive',
      },
    ],
    totalValueUsd: 27500,
    totalChangeUsd: 5.8,
  };

  describe('Initial State', () => {
    test('should return the initial state when passed an undefined state', () => {
      const result = portfolioReducer(undefined, { type: 'unknown' });
      expect(result).toEqual(initialState);
    });

    test('should have correct initial values', () => {
      const state = portfolioReducer(undefined, { type: 'unknown' });
      
      expect(state.portfolio).toEqual({});
      expect(state.fileUploaded).toBe(false);
      expect(state.uploadError).toBe('');
      expect(state.refreshRate).toBe(5);
      expect(state.analyzingCoin).toBeNull();
    });
  });

  describe('setPortfolio', () => {
    test('should set portfolio with valid data', () => {
      const result = portfolioReducer(initialState, setPortfolio(mockPortfolio));
      
      expect(result.portfolio).toEqual(mockPortfolio);
      expect(result.portfolio.coins).toHaveLength(2);
      expect(result.portfolio.totalValueUsd).toBe(27500);
    });

    test('should replace existing portfolio data', () => {
      const stateWithPortfolio = {
        ...initialState,
        portfolio: { coins: [{ id: 1, symbol: 'OLD' }] },
      };
      
      const result = portfolioReducer(stateWithPortfolio, setPortfolio(mockPortfolio));
      
      expect(result.portfolio).toEqual(mockPortfolio);
      expect(result.portfolio.coins[0].symbol).toBe('BTC');
    });

    test('should set portfolio to empty object', () => {
      const stateWithPortfolio = {
        ...initialState,
        portfolio: mockPortfolio,
      };
      
      const result = portfolioReducer(stateWithPortfolio, setPortfolio({}));
      
      expect(result.portfolio).toEqual({});
    });

    test('should handle portfolio with single coin', () => {
      const singleCoinPortfolio = {
        coins: [mockPortfolio.coins[0]],
        totalValueUsd: 22500,
      };
      
      const result = portfolioReducer(initialState, setPortfolio(singleCoinPortfolio));
      
      expect(result.portfolio.coins).toHaveLength(1);
      expect(result.portfolio.coins[0].symbol).toBe('BTC');
    });

    test('should not affect other state properties when setting portfolio', () => {
      const customState = {
        ...initialState,
        fileUploaded: true,
        uploadError: 'Some error',
        refreshRate: 10,
        analyzingCoin: 1,
      };
      
      const result = portfolioReducer(customState, setPortfolio(mockPortfolio));
      
      expect(result.portfolio).toEqual(mockPortfolio);
      expect(result.fileUploaded).toBe(true);
      expect(result.uploadError).toBe('Some error');
      expect(result.refreshRate).toBe(10);
      expect(result.analyzingCoin).toBe(1);
    });
  });

  describe('setFileUploaded', () => {
    test('should set fileUploaded to true', () => {
      const result = portfolioReducer(initialState, setFileUploaded(true));
      
      expect(result.fileUploaded).toBe(true);
    });

    test('should set fileUploaded to false', () => {
      const stateWithUpload = {
        ...initialState,
        fileUploaded: true,
      };
      
      const result = portfolioReducer(stateWithUpload, setFileUploaded(false));
      
      expect(result.fileUploaded).toBe(false);
    });

    test('should toggle fileUploaded status', () => {
      let state = portfolioReducer(initialState, setFileUploaded(true));
      expect(state.fileUploaded).toBe(true);
      
      state = portfolioReducer(state, setFileUploaded(false));
      expect(state.fileUploaded).toBe(false);
      
      state = portfolioReducer(state, setFileUploaded(true));
      expect(state.fileUploaded).toBe(true);
    });

    test('should not affect other state properties', () => {
      const customState = {
        ...initialState,
        portfolio: mockPortfolio,
        uploadError: 'Error',
      };
      
      const result = portfolioReducer(customState, setFileUploaded(true));
      
      expect(result.fileUploaded).toBe(true);
      expect(result.portfolio).toEqual(mockPortfolio);
      expect(result.uploadError).toBe('Error');
    });
  });

  describe('setUploadError', () => {
    test('should set upload error message', () => {
      const errorMessage = 'File upload failed';
      const result = portfolioReducer(initialState, setUploadError(errorMessage));
      
      expect(result.uploadError).toBe(errorMessage);
    });

    test('should clear upload error', () => {
      const stateWithError = {
        ...initialState,
        uploadError: 'Previous error',
      };
      
      const result = portfolioReducer(stateWithError, setUploadError(''));
      
      expect(result.uploadError).toBe('');
    });

    test('should replace existing error message', () => {
      const stateWithError = {
        ...initialState,
        uploadError: 'Old error',
      };
      
      const result = portfolioReducer(stateWithError, setUploadError('New error'));
      
      expect(result.uploadError).toBe('New error');
    });

    test('should handle various error messages', () => {
      const errorMessages = [
        'Invalid file format',
        'File size too large',
        'Network error occurred',
        'No valid data found',
      ];
      
      errorMessages.forEach(message => {
        const result = portfolioReducer(initialState, setUploadError(message));
        expect(result.uploadError).toBe(message);
      });
    });

    test('should not affect other state properties', () => {
      const customState = {
        ...initialState,
        portfolio: mockPortfolio,
        fileUploaded: true,
      };
      
      const result = portfolioReducer(customState, setUploadError('Error'));
      
      expect(result.uploadError).toBe('Error');
      expect(result.portfolio).toEqual(mockPortfolio);
      expect(result.fileUploaded).toBe(true);
    });
  });

  describe('setRefreshRate', () => {
    test('should set refresh rate to valid value', () => {
      const result = portfolioReducer(initialState, setRefreshRate(10));
      
      expect(result.refreshRate).toBe(10);
    });

    test('should update refresh rate from default', () => {
      const result = portfolioReducer(initialState, setRefreshRate(1));
      
      expect(result.refreshRate).toBe(1);
    });

    test('should handle different refresh rate values', () => {
      const rates = [1, 5, 15, 30, 60];
      
      rates.forEach(rate => {
        const result = portfolioReducer(initialState, setRefreshRate(rate));
        expect(result.refreshRate).toBe(rate);
      });
    });

    test('should replace existing refresh rate', () => {
      const stateWithRate = {
        ...initialState,
        refreshRate: 15,
      };
      
      const result = portfolioReducer(stateWithRate, setRefreshRate(30));
      
      expect(result.refreshRate).toBe(30);
    });

    test('should handle zero refresh rate', () => {
      const result = portfolioReducer(initialState, setRefreshRate(0));
      
      expect(result.refreshRate).toBe(0);
    });

    test('should handle large refresh rate values', () => {
      const result = portfolioReducer(initialState, setRefreshRate(3600));
      
      expect(result.refreshRate).toBe(3600);
    });

    test('should not affect other state properties', () => {
      const customState = {
        ...initialState,
        portfolio: mockPortfolio,
        fileUploaded: true,
      };
      
      const result = portfolioReducer(customState, setRefreshRate(20));
      
      expect(result.refreshRate).toBe(20);
      expect(result.portfolio).toEqual(mockPortfolio);
      expect(result.fileUploaded).toBe(true);
    });
  });

  describe('setAnalyzingCoin', () => {
    test('should set analyzing coin to valid ID', () => {
      const result = portfolioReducer(initialState, setAnalyzingCoin(1));
      
      expect(result.analyzingCoin).toBe(1);
    });

    test('should set analyzing coin to null', () => {
      const stateWithAnalyzing = {
        ...initialState,
        analyzingCoin: 1,
      };
      
      const result = portfolioReducer(stateWithAnalyzing, setAnalyzingCoin(null));
      
      expect(result.analyzingCoin).toBeNull();
    });

    test('should change analyzing coin from one to another', () => {
      const stateWithAnalyzing = {
        ...initialState,
        analyzingCoin: 1,
      };
      
      const result = portfolioReducer(stateWithAnalyzing, setAnalyzingCoin(2));
      
      expect(result.analyzingCoin).toBe(2);
    });

    test('should handle different coin ID types', () => {
      const coinIds = [1, 2, 100, 999];
      
      coinIds.forEach(id => {
        const result = portfolioReducer(initialState, setAnalyzingCoin(id));
        expect(result.analyzingCoin).toBe(id);
      });
    });

    test('should handle string coin ID', () => {
      const result = portfolioReducer(initialState, setAnalyzingCoin('btc-1'));
      
      expect(result.analyzingCoin).toBe('btc-1');
    });

    test('should not affect other state properties', () => {
      const customState = {
        ...initialState,
        portfolio: mockPortfolio,
        fileUploaded: true,
        uploadError: 'Error',
      };
      
      const result = portfolioReducer(customState, setAnalyzingCoin(5));
      
      expect(result.analyzingCoin).toBe(5);
      expect(result.portfolio).toEqual(mockPortfolio);
      expect(result.fileUploaded).toBe(true);
      expect(result.uploadError).toBe('Error');
    });
  });

  describe('Combined Actions', () => {
    test('should handle multiple actions in sequence', () => {
      let state = portfolioReducer(initialState, setPortfolio(mockPortfolio));
      state = portfolioReducer(state, setFileUploaded(true));
      state = portfolioReducer(state, setRefreshRate(10));
      state = portfolioReducer(state, setAnalyzingCoin(1));
      
      expect(state.portfolio).toEqual(mockPortfolio);
      expect(state.fileUploaded).toBe(true);
      expect(state.refreshRate).toBe(10);
      expect(state.analyzingCoin).toBe(1);
      expect(state.uploadError).toBe('');
    });

    test('should handle error scenario workflow', () => {
      let state = portfolioReducer(initialState, setUploadError('Invalid file format'));
      state = portfolioReducer(state, setFileUploaded(false));
      state = portfolioReducer(state, setPortfolio({}));
      
      expect(state.uploadError).toBe('Invalid file format');
      expect(state.fileUploaded).toBe(false);
      expect(state.portfolio).toEqual({});
    });

    test('should handle successful upload workflow', () => {
      let state = portfolioReducer(initialState, setUploadError(''));
      state = portfolioReducer(state, setPortfolio(mockPortfolio));
      state = portfolioReducer(state, setFileUploaded(true));
      
      expect(state.uploadError).toBe('');
      expect(state.portfolio).toEqual(mockPortfolio);
      expect(state.fileUploaded).toBe(true);
    });

    test('should handle analysis workflow', () => {
      let state = portfolioReducer(initialState, setPortfolio(mockPortfolio));
      state = portfolioReducer(state, setAnalyzingCoin(1));
      
      // Simulate analysis completion
      state = portfolioReducer(state, setAnalyzingCoin(null));
      
      expect(state.portfolio).toEqual(mockPortfolio);
      expect(state.analyzingCoin).toBeNull();
    });

    test('should handle reset workflow', () => {
      const stateWithData = {
        portfolio: mockPortfolio,
        fileUploaded: true,
        uploadError: '',
        refreshRate: 10,
        analyzingCoin: 1,
      };
      
      let state = portfolioReducer(stateWithData, setPortfolio({}));
      state = portfolioReducer(state, setFileUploaded(false));
      state = portfolioReducer(state, setUploadError(''));
      state = portfolioReducer(state, setAnalyzingCoin(null));
      state = portfolioReducer(state, setRefreshRate(5));
      
      expect(state).toEqual(initialState);
    });
  });

  describe('State Immutability', () => {
    test('should not mutate original state when setting portfolio', () => {
      const originalState = { ...initialState };
      portfolioReducer(initialState, setPortfolio(mockPortfolio));
      
      expect(initialState).toEqual(originalState);
    });

    test('should not mutate original state when setting fileUploaded', () => {
      const originalState = { ...initialState };
      portfolioReducer(initialState, setFileUploaded(true));
      
      expect(initialState).toEqual(originalState);
    });

    test('should return new state reference', () => {
      const state1 = portfolioReducer(initialState, setPortfolio(mockPortfolio));
      const state2 = portfolioReducer(state1, setFileUploaded(true));
      
      expect(state1).not.toBe(state2);
      expect(state1.fileUploaded).toBe(false);
      expect(state2.fileUploaded).toBe(true);
    });
  });

  describe('Action Creators', () => {
    test('setPortfolio action creator should create correct action', () => {
      const action = setPortfolio(mockPortfolio);
      
      expect(action).toEqual({
        type: 'portfolio/setPortfolio',
        payload: mockPortfolio,
      });
    });

    test('setFileUploaded action creator should create correct action', () => {
      const action = setFileUploaded(true);
      
      expect(action).toEqual({
        type: 'portfolio/setFileUploaded',
        payload: true,
      });
    });

    test('setUploadError action creator should create correct action', () => {
      const action = setUploadError('Error message');
      
      expect(action).toEqual({
        type: 'portfolio/setUploadError',
        payload: 'Error message',
      });
    });

    test('setRefreshRate action creator should create correct action', () => {
      const action = setRefreshRate(10);
      
      expect(action).toEqual({
        type: 'portfolio/setRefreshRate',
        payload: 10,
      });
    });

    test('setAnalyzingCoin action creator should create correct action', () => {
      const action = setAnalyzingCoin(1);
      
      expect(action).toEqual({
        type: 'portfolio/setAnalyzingCoin',
        payload: 1,
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle undefined payload for setPortfolio', () => {
      const result = portfolioReducer(initialState, setPortfolio(undefined));
      
      expect(result.portfolio).toBeUndefined();
    });

    test('should handle null payload for setPortfolio', () => {
      const result = portfolioReducer(initialState, setPortfolio(null));
      
      expect(result.portfolio).toBeNull();
    });

    test('should handle negative refresh rate', () => {
      const result = portfolioReducer(initialState, setRefreshRate(-5));
      
      expect(result.refreshRate).toBe(-5);
    });

    test('should handle very large numbers for refresh rate', () => {
      const result = portfolioReducer(initialState, setRefreshRate(999999));
      
      expect(result.refreshRate).toBe(999999);
    });

    test('should handle empty string for uploadError', () => {
      const result = portfolioReducer(initialState, setUploadError(''));
      
      expect(result.uploadError).toBe('');
    });

    test('should handle very long error message', () => {
      const longError = 'E'.repeat(1000);
      const result = portfolioReducer(initialState, setUploadError(longError));
      
      expect(result.uploadError).toBe(longError);
      expect(result.uploadError.length).toBe(1000);
    });
  });
});