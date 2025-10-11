import {create} from 'zustand'

const usePortfolioStore = create((set) => ({
    portfolio: {},
    fileUploaded: false,
    uploadError: '',
    refreshRate: 5,
    analyzingCoin: null,
    setPortfolio: (value) => set((state) => ({ portfolio: value })),
    setFileUploaded: (value) => set((state) => ({ fileUploaded: value })),
    setUploadError: (value) => set((state) => ({ uploadError: value })),
    setRefreshRate: (value) => set((state) => ({ refreshRate: value })),
    setAnalyzingCoin: (value) => set((state) => ({ analyzingCoin: value }))
}));

export default usePortfolioStore;