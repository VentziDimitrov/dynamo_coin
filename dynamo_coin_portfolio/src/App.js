import React, { useState, useEffect } from 'react';
import { Upload, TrendingUp, TrendingDown, DollarSign, Coins, FileText } from 'lucide-react';
import globalStyles from './globalStyles';
import { formatChange, formatCurrency, formatNumber } from './utils/formatHelper';
import PortfolioApi from './portfolioApi';
import PortfolioList from './components/PortfolioList';

const CryptoPortfolioCalculator = () => {
  const [portfolio, setPortfolio] = useState({});
  const [fileUploaded, setFileUploaded] = useState(false);
  const [uploadError, setUploadError] = useState('');  
  const [refreshRate, setRefreshRate] = useState(5); 
  const [sentimentRunning, setSentimentRunning] = useState(false);

  const REFRESH_OPTIONS = [
    { label: '1 min', value: 1 },
    { label: '5 min', value: 5 },
    { label: '15 min', value: 15 },
    { label: '1 hr', value: 60 }
  ];

  useEffect(() => {
    const savedPortfolio = localStorage.getItem('portfolio');
    if (savedPortfolio) {
      const portfolioData = JSON.parse(savedPortfolio);
      setPortfolio(portfolioData);
      setFileUploaded(true);
    }
  }, []);

  useEffect(() => {
    async function onUpdate() {
      const portfolio = await PortfolioApi.refresh();
      //console.log("onUdate(): ", portfolio);
      localStorage.setItem('portfolio', JSON.stringify(portfolio));
      setPortfolio(portfolio);
    }
    const interval = setInterval(onUpdate, refreshRate * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshRate]);
 
  const getChangeIcon = (change) => {
    return change >= 0 ? <TrendingUp style={{ width: 16, height: 16, color: '#4ade80', marginLeft: 10 }} /> : <TrendingDown style={{ width: 16, height: 16, color: '#f87171', marginLeft: 10 }} />;
  }

  const onSentimentAnalyze = async (asset) => {
    try {
      console.log("Portfolio for sentiment analysis: ", portfolio);
      
      if (!sentimentRunning) {
        setSentimentRunning(true);
        const sentiment = await PortfolioApi.analyseCoin(asset.name);
        setSentimentRunning(false);
        console.log("Sentiment analysis result: ", sentiment);
        asset.sentiment = sentiment;
      }
      
    } catch (err) {
      console.error(err);
      setSentimentRunning(false);
      alert("Sentiment analysis failed: " + (err?.response?.data ?? err.message));
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadError('');

    let coinList = [];

    try {
      const portfolio = await PortfolioApi.upload(file);
      console.log("response: ", portfolio);
      coinList = portfolio.coins;
      if (!coinList || coinList.length === 0) {
        setUploadError('Failed to fetch coin data. Please try again later.');
        return;
      }

      localStorage.setItem('portfolio', JSON.stringify(portfolio));
      setPortfolio(portfolio);
      setFileUploaded(true);

    } catch (err) {
      console.error(err);
      alert("Upload failed: " + (err?.response?.data ?? err.message));
    }
  }; 

  const overallIcon = portfolio.totalChangeUsd >= 0 ? <TrendingUp style={{ width: 48, height: 48, color: '#4ade80', marginLeft: 14}} /> : <TrendingDown style={{ width: 48, height: 48, color: '#f87171', marginLeft: 14 }} />;

  return (
    <div style={globalStyles.container}>
      <div style={globalStyles.wrapper}>
        {/* Header */}
        <div style={globalStyles.header}>
          <div style={globalStyles.headerTitle}>
            <Coins style={globalStyles.headerIcon} />
            <h1 style={globalStyles.title}>DynamoCoin Portfolio</h1>
          </div>
          <p style={globalStyles.subtitle}>Upload a text file with your cryptocurrency holdings to calculate portfolio value</p>
        </div>

        <div style={styles.refreshContainer}>
          <label htmlFor="refresh-rate" style={styles.refreshLabel}>
            Refresh rate:
          </label>
          <select
            id="refresh-rate"
            value={refreshRate}
            onChange={e => {
              setRefreshRate(Number(e.target.value));
            }}
            style={styles.refreshSelect}>
            {REFRESH_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* File Upload Section */}
        {!fileUploaded && (
          <div style={styles.uploadCard}>
            <div style={styles.uploadContent}>
              <FileText style={styles.uploadIcon} />
              <h3 style={styles.uploadTitle}>Upload Portfolio File</h3>
              <p style={styles.uploadDescription}>
                Upload a text file with your crypto assets. Each line should contain:
                <br />
                <code style={styles.formatExample}> AMOUNT|SYMBOL|PRICE</code>
                <br />
                Example: <code style={styles.formatExample}> 0.5|BTC|43000</code>
              </p>
              
              <input
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                style={styles.fileInput}
                id="file-upload"
              />
              <label htmlFor="file-upload" style={styles.uploadButton}>
                <Upload style={styles.uploadButtonIcon} />
                Choose File
              </label>
              
              {uploadError && (
                <div style={styles.errorMessage}>
                  {uploadError}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Portfolio Summary */}
        {fileUploaded && portfolio.coins.length > 0 && (
          <>
            <div style={styles.summaryCard}>
              <div style={styles.summaryHeader}>
                <h2 style={styles.summaryTitle}>
                  <DollarSign style={styles.summaryIcon} />
                  Portfolio Value
                </h2>
                <button 
                  onClick={() => {setFileUploaded(false); setPortfolio({coins: []})}}
                  style={styles.reloadButton}
                >
                  Upload New File
                </button>
              </div>
              <div style={styles.summaryContent}>
                <div style={styles.totalValue}>
                  {formatCurrency(portfolio.totalValueUsd)}
                </div>
                <div style={styles.totalValue}>
                  {formatChange(portfolio.totalChangeUsd)}
                  {overallIcon}
                </div>
                <div style={styles.assetCount}>
                  {portfolio.coins.length} assets in portfolio
                </div>
              </div>
            </div>

            <div style={styles.mainGrid}>
              {/* Portfolio Assets */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>
                  <Coins style={styles.cardTitleIcon} />
                  Your Assets
                </h3>
                <PortfolioList
                  coins={portfolio.coins}
                  styles={styles}
                  formatNumber={formatNumber}
                  formatCurrency={formatCurrency}
                  formatChange={formatChange}
                  getChangeIcon={getChangeIcon}
                  onSentimentAnalyze={onSentimentAnalyze}
                />
              </div>   
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {  
  uploadCard: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(16px)',
    borderRadius: '16px',
    padding: '48px 24px',
    marginBottom: '32px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    textAlign: 'center'
  },
  uploadContent: {
    maxWidth: '500px',
    margin: '0 auto'
  },
  uploadIcon: {
    width: '64px',
    height: '64px',
    color: '#c084fc',
    marginBottom: '16px'
  },
  uploadTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '16px',
    margin: '0 0 16px 0'
  },
  uploadDescription: {
    color: '#d1d5db',
    fontSize: '16px',
    lineHeight: '1.6',
    marginBottom: '24px'
  },
  formatExample: {
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#fbbf24'
  },
  fileInput: {
    display: 'none'
  },
  refreshContainer:
  { 
    marginBottom: 24, 
    display: 'flex', 
    alignItems: 'center', 
    gap: 12 
  },
  refreshLabel: { color: '#fff', fontWeight: 500, fontSize: 16 },
  refreshSelect: 
  {
    padding: '8px 16px',
    borderRadius: 6,
    border: '1px solid #a78bfa',
    background: '#18181b',
    color: '#fff',
    fontSize: 16,
    fontWeight: 500,
    outline: 'none'
  },
  uploadButton: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)',
    color: '#ffffff',
    fontWeight: '600',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s',
    textDecoration: 'none'
  },
  uploadButtonIcon: {
    width: '20px',
    height: '20px',
    marginRight: '8px'
  },
  errorMessage: {
    marginTop: '16px',
    padding: '12px',
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.5)',
    borderRadius: '8px',
    color: '#fca5a5',
    fontSize: '14px'
  },
  summaryCard: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(16px)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '32px',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  summaryHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px'
  },
  summaryTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    margin: 0
  },
  summaryIcon: {
    width: '24px',
    height: '24px',
    color: '#4ade80',
    marginRight: '8px'
  },
  reloadButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  summaryContent: {
    textAlign: 'center'
  },
  totalValue: {
    fontSize: '40px',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '8px'
  },
  assetCount: {
    color: '#d1d5db',
    fontSize: '18px'
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '32px',
    '@media (min-width: 1024px)': {
      gridTemplateColumns: '1fr 1fr'
    }
  },
  card: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(16px)',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    margin: '0 0 24px 0'
  },
  cardTitleIcon: {
    width: '20px',
    height: '20px',
    color: '#c084fc',
    marginRight: '8px'
  },
  addIcon: {
    width: '20px',
    height: '20px',
    color: '#4ade80',
    marginRight: '8px'
  },
  assetsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  assetCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  assetHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px'
  },
  assetInfo: {
    display: 'flex',
    alignItems: 'center'
  },
  assetAvatar: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12px'
  },
  assetAvatarText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  assetName: {
    color: '#ffffff',
    fontWeight: '600'
  },
  assetSymbol: {
    color: '#9ca3af',
    fontSize: '14px'
  },
  assetInputs: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '12px'
  },
  inputWrapper: { display: 'flex', justifyContent: 'space-between', marginBottom: 12 },
  inputGroup: {
    display: 'inline-grid',
    flexDirection: 'column',
    width: '25%',
    justifyContent: 'start'
  },
  inputLabel: {
    color: '#9ea1a7ff',
    fontSize: '22px',
    marginBottom: '14px'
  },
  input: {
    width: '100%',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    padding: '8px 12px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  },
  santimentParent: {
    display: 'block',
    alignItems: 'center'
  },
  sentimentButton: {
            padding: '6px 16px',
            borderRadius: 6,
            background: '#a78bfa',
            color: '#18181b',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            marginTop: 8
          },
  assetFooter: {
    display: 'block',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  assetAmount: {
    color: '#9ca3af',
    fontSize: '18px'
  },
  assetValueContainer: {
    textAlign: 'right'
  },
  assetValue: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 24
  },
  priceChange: {
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    marginTop: '2px'
  },
  trendIcon: {
    width: '12px',
    height: '12px',
    marginRight: '4px'
  },
  breakdown: {
    marginBottom: '24px'
  },
  breakdownList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  breakdownItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 0'
  },
  breakdownAssetInfo: {
    display: 'flex',
    alignItems: 'center'
  },
  breakdownAvatar: {
    width: '24px',
    height: '24px',
    background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12px'
  },
  breakdownAvatarText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: '12px'
  },
  breakdownSymbol: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '500'
  },
  breakdownName: {
    color: '#9ca3af',
    fontSize: '12px'
  },
  breakdownValues: {
    textAlign: 'right'
  },
  breakdownPercentage: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '500'
  },
  breakdownValue: {
    color: '#9ca3af',
    fontSize: '12px'
  },
  helpSection: {
    marginTop: '24px',
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  helpTitle: {
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '8px',
    margin: '0 0 8px 0'
  },
  helpContent: {
    color: '#d1d5db'
  },
  helpText: {
    fontSize: '14px',
    marginBottom: '12px',
    margin: '0 0 12px 0'
  },
  exampleContainer: {
    background: 'rgba(0, 0, 0, 0.2)',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontFamily: 'monospace'
  },
  exampleLine: {
    color: '#fbbf24',
    marginBottom: '4px'
  }
};

export default CryptoPortfolioCalculator;