const globalStyles = {
  
  wrapper: {
    maxWidth: '1152px',
    margin: '0 auto'
  },
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
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px'
  },
  headerIcon: {
    width: '48px',
    height: '48px',
    color: '#c084fc',
    marginRight: '12px'
  },
  subtitle: {
    color: '#d1d5db',
    fontSize: '18px',
    margin: 0
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
};

export default globalStyles;