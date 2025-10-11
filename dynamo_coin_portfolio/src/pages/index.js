import React, { useEffect } from 'react';
import { formatChange, formatCurrency, formatNumber } from '../utils/formatHelper';
import PortfolioApi from '../portfolioApi';
import PortfolioList from '../components/PortfolioList';
import { calculateTotalBuyValue, calculateTotalValue } from '../utils/mathHelper';
import Header from '../components/Header';
import SummaryCard from '../components/SummaryCard'
import PortfolioUpload from '../components/PortfolioUpload';
import styles from '../globalStyles'

//Redux
import { useSelector, useDispatch } from 'react-redux';
import {
  setPortfolio,
  setFileUploaded,
  setUploadError,
  setRefreshRate,
  setAnalyzingCoin,
} from '../state/redux/portfolioSlice';


// Zustand
//import usePortfolioStore from './state/zustand/usePortfolioStore';


const CryptoPortfolioCalculator = () => {
  //Redux
  const dispatch = useDispatch();
  const {
    portfolio,
    fileUploaded,
    uploadError,
    refreshRate,
    analyzingCoin,
  } = useSelector((state) => state.portfolio);

  //zustand
  /* const {
    portfolio, 
    fileUploaded, 
    uploadError, 
    refreshRate, 
    analyzingCoin,
    setPortfolio,
    setFileUploaded,
    setAnalyzingCoin,
    setUploadError,
  } = usePortfolioStore();
 */
  useEffect(() => {
    const savedPortfolio = localStorage.getItem('portfolio');
    if (savedPortfolio) {
      const portfolioData = JSON.parse(savedPortfolio);
      //Redux
      dispatch(setPortfolio(portfolioData));
      dispatch(setFileUploaded(true));

      //Zustand
      //setPortfolio(portfolioData)
      //setFileUploaded(true)
    }
  }, []);

  useEffect(() => {
    async function onRefresh() {
      const portfolio = await PortfolioApi.refresh();
      //console.log("onUdate(): ", portfolio);
      localStorage.setItem('portfolio', JSON.stringify(portfolio));
      //Redux
      dispatch(setPortfolio(portfolio));

      //Zustand
      //setPortfolio(portfolio)
    }
    const interval = setInterval(onRefresh, refreshRate * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshRate]);
 
  const onSentimentAnalyze = async (asset) => {
    try {
      console.log("Portfolio for sentiment analysis: ", portfolio);
      
      if (!analyzingCoin) {
        //Redux
        dispatch(setAnalyzingCoin(asset.id))

        // zustand
        //setAnalyzingCoin(asset.id)

        const sentiment = await PortfolioApi.analyseCoin(asset.name);
        console.log("Sentiment analysis result: ", sentiment);
        asset.sentiment = sentiment;
      }
      
    } catch (err) {
      console.error(err);
      alert("Sentiment analysis failed: " + (err?.response?.data ?? err.message));
    } finally {
      //Redux
      dispatch(setAnalyzingCoin(null))

      // zustand
      //setAnalyzingCoin(null)
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    //Redux
    dispatch(setUploadError(''));

    // zustand
    //setUploadError('')

    let coinList = [];

    try {
      const portfolio = await PortfolioApi.upload(file);
      console.log("response: ", portfolio);
      coinList = portfolio.coins;
      if (!coinList || coinList.length === 0) {
         //Redux
        dispatch(setUploadError('Failed to fetch coin data. Please try again later.'));
        return;
      }

      localStorage.setItem('portfolio', JSON.stringify(portfolio));
       //Redux
      dispatch(setPortfolio(portfolio));
      dispatch(setFileUploaded(true));

    } catch (err) {
      console.error(err);
      alert("Upload failed: " + (err?.response?.data ?? err.message));
    }
  }; 
 

  const calculateTotalChangeForPortfolio = portfolio.coins ? calculateTotalValue(portfolio.coins) - calculateTotalBuyValue(portfolio.coins) : 0;

  return (
    <div style={styles.container}>
      {/* Header */}
     <Header 
        styles={styles} 
        fileUploaded={fileUploaded}
        refreshRate={refreshRate}
        setRefreshRate={setRefreshRate}
        />
      {/* Show upload section if no file uploaded */}
      {!fileUploaded && (
          <PortfolioUpload
                handleFileUpload={handleFileUpload}
                uploadError={uploadError}
                styles={styles}
              />
        )}
      {fileUploaded && portfolio.coins.length > 0 && (
          <div style={styles.mainContent}>
            {/* Portfolio Summary Cards */}
            <div style={styles.summaryGrid}>
              <SummaryCard
                styles={styles}
                label="Total Portfolio Value"
                value={formatCurrency(portfolio.totalValueUsd)}
                changePercent={portfolio.totalChangeUsd}
                changeValue={calculateTotalChangeForPortfolio}
                formatCurrency={formatCurrency}
              />

              <SummaryCard
                styles={styles}
                label="Total Assets"
                value={portfolio.coins.length}
                subtext="Cryptocurrencies"
              />
            </div>

        {/* Portfolio Table */}
        <PortfolioList 
            coins={portfolio.coins} 
            formatChange={formatChange} 
            formatCurrency={formatCurrency} 
            formatNumber={formatNumber} 
            onSentimentAnalyze={onSentimentAnalyze} 
            styles={styles} 
            analyzingCoin={analyzingCoin}
            />
      </div>
  )}
  </div>
  )
}

export default CryptoPortfolioCalculator;