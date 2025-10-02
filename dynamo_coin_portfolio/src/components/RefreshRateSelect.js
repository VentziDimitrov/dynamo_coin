const RefreshRateSelect = ({ refreshRate, setRefreshRate, styles }) => {
  const REFRESH_OPTIONS = [
      { label: '1 min', value: 1 },
      { label: '5 min', value: 5 },
      { label: '15 min', value: 15 },
      { label: '1 hr', value: 60 }
    ];
  return (
    <div style={styles.refreshContainer}>
            <label style={styles.refreshLabel}>Auto-refresh:</label>
            <select 
              value={refreshRate}
              onChange={(e) => setRefreshRate(e.target.value)}
              style={styles.refreshSelect}
            >
              {REFRESH_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
            </select>
          </div>
  );
};

export default RefreshRateSelect;