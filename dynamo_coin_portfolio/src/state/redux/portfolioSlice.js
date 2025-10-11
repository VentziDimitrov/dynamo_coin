import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  portfolio: {},
  fileUploaded: false,
  uploadError: '',
  refreshRate: 5,
  analyzingCoin: null,
};

export const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    setPortfolio: (state, action) => {
      state.portfolio = action.payload;
    },
    setFileUploaded: (state, action) => {
      state.fileUploaded = action.payload;
    },
    setUploadError: (state, action) => {
      state.uploadError = action.payload;
    },
    setRefreshRate: (state, action) => {
      state.refreshRate = action.payload;
    },
    setAnalyzingCoin: (state, action) => {
      state.analyzingCoin = action.payload;
    },
  },
});

export const {
  setPortfolio,
  setFileUploaded,
  setUploadError,
  setRefreshRate,
  setAnalyzingCoin,
} = portfolioSlice.actions;

export default portfolioSlice.reducer;