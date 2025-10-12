const config = {
  appName: process.env.REACT_APP_APP_NAME || "test",
  coinloreBaseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  version: process.env.REACT_APP_VERSION || '1.0.0',
  
  // Helper methods
  isDevelopment: () => process.env.NODE_ENV === 'development',
  isProduction: () => process.env.NODE_ENV === 'production',
  isTest: () => process.env.NODE_ENV === 'test',
};

export default config;