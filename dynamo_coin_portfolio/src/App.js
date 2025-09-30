import React, { useState, useEffect } from 'react';
import { Upload, TrendingUp, TrendingDown, FileText, Wallet } from 'lucide-react';
import { formatChange, formatCurrency, formatNumber } from './utils/formatHelper';
import PortfolioApi from './portfolioApi';
import PortfolioList from './components/PortfolioList';
import { calculateTotalBuyValue, calculateTotalValue } from './utils/mathHelper';

const CryptoPortfolioCalculator = () => {
  const [portfolio, setPortfolio] = useState({});
  const [fileUploaded, setFileUploaded] = useState(false);
  const [uploadError, setUploadError] = useState('');  
  const [refreshRate, setRefreshRate] = useState(5); 
  const [analyzingCoin, setAnalyzingCoin] = useState(null);

  useEffect(() => {
    //localStorage.setItem('portfolio', null);
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
 
  const onSentimentAnalyze = async (asset) => {
    try {
      console.log("Portfolio for sentiment analysis: ", portfolio);
      
      if (!analyzingCoin) {
        setAnalyzingCoin(asset.id)
        const sentiment = await PortfolioApi.analyseCoin(asset.name);
        console.log("Sentiment analysis result: ", sentiment);
        asset.sentiment = sentiment;
      }
      
    } catch (err) {
      console.error(err);
      alert("Sentiment analysis failed: " + (err?.response?.data ?? err.message));
    } finally {
      setAnalyzingCoin(null)
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
 

  const calculateTotalChangeForPortfolio = portfolio.coins ? calculateTotalValue(portfolio.coins) - calculateTotalBuyValue(portfolio.coins) : 0;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoSection}>
            <div style={styles.logo}>
              <Wallet style={styles.logoIcon} />
            </div>
            <h1 style={styles.title}>Dynamo Coin Portfolio Calculator</h1>
          </div>
          {fileUploaded && <div style={styles.refreshContainer}>
            <label style={styles.refreshLabel}>Auto-refresh:</label>
            <select 
              value={refreshRate}
              onChange={(e) => setRefreshRate(e.target.value)}
              style={styles.refreshSelect}
            >
              <option value="1 min">1 min</option>
              <option value="5 min">5 min</option>
              <option value="15 min">15 min</option>
              <option value="30 min">30 min</option>
              <option value="1 h">1 h</option>
            </select>
          </div>}
        </div>
      </div>

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
{fileUploaded && portfolio.coins.length > 0 && (
      <div style={styles.mainContent}>
        {/* Portfolio Summary Cards */}
        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Total Portfolio Value</div>
            <div style={styles.summaryValue}>{formatCurrency(portfolio.totalValueUsd)}</div>
            <div style={styles.summaryChange}>
              <div style={{
                ...styles.changeIndicator,
                color: portfolio.totalChangeUsd >= 0 ? '#10b981' : '#ef4444'
              }}>
                {portfolio.totalChangeUsd >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span style={styles.summarySubTotalValue}>{portfolio.totalChangeUsd >= 0 ? '+' : ''}{portfolio.totalChangeUsd.toFixed(2)}%</span>
              </div>
              <span style={styles.summarySubTotalChange}>
                {portfolio.totalChangeUsd >= 0 ? '+' : ''}{formatCurrency(calculateTotalChangeForPortfolio)}
              </span>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Total Assets</div>
            <div style={styles.summaryValue}>{portfolio.coins.length}</div>
            <div style={styles.summarySubtext}>Cryptocurrencies</div>
          </div>
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

const styles = {  
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '0',
    margin: '0'
  },
  header: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logo: {
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
  },
  logoIcon: {
    color: '#ffffff',
    width: '28px',
    height: '28px'
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  refreshContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  refreshLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#64748b'
  },
  refreshSelect: {
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#667eea',
    background: 'rgba(102, 126, 234, 0.1)',
    border: '2px solid rgba(102, 126, 234, 0.2)',
    borderRadius: '8px',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.2s'
  },
  mainContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '32px 24px'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  summarySubTotalValue: {fontSize: 16},
  summarySubTotalChange: {fontSize: 16},
  summaryCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    border: '1px solid rgba(255,255,255,0.8)'
  },
  summaryLabel: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  summaryValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '8px'
  },
  summaryChange: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  changeIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '14px',
    fontWeight: '600'
  },
  changeValue: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500'
  },
  summarySubtext: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '4px'
  },
  tableContainer: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    border: '1px solid rgba(255,255,255,0.8)'
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1.5fr 1.5fr 1.5fr 1.2fr 1.2fr 1.2fr 1.2fr',
    gap: '16px',
    padding: '20px 24px',
    background: '#f8fafc',
    borderBottom: '2px solid #e2e8f0',
    fontWeight: '600',
    fontSize: '13px',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  headerCell1: { display: 'flex', alignItems: 'center' },
  headerCell2: { display: 'flex', alignItems: 'center' },
  headerCell3: { display: 'flex', alignItems: 'center' },
  headerCell4: { display: 'flex', alignItems: 'center' },
  headerCell5: { display: 'flex', alignItems: 'center' },
  headerCell6: { display: 'flex', alignItems: 'center' },
  headerCell7: { display: 'flex', alignItems: 'center' },
  headerCell8: { display: 'flex', alignItems: 'center' },
  tableBody: {
    maxHeight: '600px',
    overflowY: 'auto'
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1.5fr 1.5fr 1.5fr 1.2fr 1.2fr 1.2fr 1.2fr',
    gap: '16px',
    padding: '20px 24px',
    borderBottom: '1px solid #f1f5f9',
    transition: 'all 0.2s',
    alignItems: 'center'
  },
  cell1: {},
  cell2: {},
  cell3: {},
  cell4: {},
  cell5: {},
  cell6: {},
  cell7: {},
  cell8: {},
  coinInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  coinIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '700'
  },
  coinSymbol: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1e293b'
  },
  coinName: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '2px'
  },
  holdingAmount: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1e293b'
  },
  holdingValue: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '2px'
  },
  portfolioValue: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1e293b'
  },
  changeChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 10px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600'
  },
  changeText: {
    fontWeight: '600'

  },
  changeSubtext: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '4px',
  },
  analyzeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
  },
  spinningIcon: {
    animation: 'spin 1s linear infinite'
  },
  sentimentBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.5px'
  },
  noSentiment: {
    fontSize: '16px',
    color: '#cbd5e1',
    fontWeight: '300'
  },
  uploadCard: {
    backdropFilter: 'blur(16px)',
    padding: '48px 24px',
    marginBottom: '32px',
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
  /* refreshContainer:
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
  } */
};

export default CryptoPortfolioCalculator;