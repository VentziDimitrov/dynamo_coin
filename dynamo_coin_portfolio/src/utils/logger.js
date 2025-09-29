class Logger {
  constructor(filename = 'app.log') {
    this.filename = filename;
    this.logs = [];
    this.isInitialized = false;
    this.init();
  }

  // Initialize the logger
  init() {
    try {
      // Try to load existing logs from localStorage
      const savedLogs = localStorage.getItem(`logger_${this.filename}`);
      if (savedLogs) {
        this.logs = JSON.parse(savedLogs);
        console.log(`Logger initialized: Loaded ${this.logs.length} existing log entries`);
      } else {
        this.logs = [];
        console.log('Logger initialized: Created new log file');
      }
      this.isInitialized = true;
      this.log('INFO', 'Logger initialized successfully');
    } catch (error) {
      console.error('Failed to initialize logger:', error);
      this.logs = [];
      this.isInitialized = true;
    }
  }

  // Format timestamp
  getTimestamp() {
    return new Date().toISOString();
  }

  // Core logging method
  log(level = 'INFO', message) {
    if (!this.isInitialized) {
      console.warn('Logger not initialized');
      return;
    }

    const timestamp = this.getTimestamp();
    const logEntry = `[${timestamp}] [${level}] ${message}`;
    
    // Add to memory array
    this.logs.push(logEntry);
    
    // Save to localStorage
    try {
      localStorage.setItem(`logger_${this.filename}`, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to save logs to localStorage:', error);
    }
    
    // Also log to console for development
    console.log(logEntry);
  }

  // Convenience methods for different log levels
  info(message) {
    this.log('INFO', message);
  }

  warn(message) {
    this.log('WARN', message);
  }

  error(message) {
    this.log('ERROR', message);
  }

  debug(message) {
    this.log('DEBUG', message);
  }

  // Get all logs as string
  getAllLogs() {
    return this.logs.join('\n');
  }

  // Get logs by level
  getLogsByLevel(level) {
    return this.logs.filter(log => log.includes(`[${level}]`));
  }

  // Clear all logs
  clearLogs() {
    this.logs = [];
    localStorage.removeItem(`logger_${this.filename}`);
    this.log('INFO', 'Logs cleared');
  }

  // Download logs as a file
  downloadLogs() {
    try {
      const logContent = this.getAllLogs();
      const blob = new Blob([logContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = this.filename;
      link.style.display = 'none';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      this.log('INFO', 'Logs downloaded successfully');
    } catch (error) {
      console.error('Failed to download logs:', error);
      this.log('ERROR', 'Failed to download logs: ' + error.message);
    }
  }

  // Export logs as JSON
  exportLogsAsJson() {
    try {
      const logData = {
        filename: this.filename,
        created: new Date().toISOString(),
        totalLogs: this.logs.length,
        logs: this.logs
      };
      
      const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = this.filename.replace('.log', '.json');
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      this.log('INFO', 'Logs exported as JSON successfully');
    } catch (error) {
      console.error('Failed to export logs as JSON:', error);
      this.log('ERROR', 'Failed to export logs as JSON: ' + error.message);
    }
  }

  // Get log statistics
  getStats() {
    const stats = {
      total: this.logs.length,
      info: this.getLogsByLevel('INFO').length,
      warn: this.getLogsByLevel('WARN').length,
      error: this.getLogsByLevel('ERROR').length,
      debug: this.getLogsByLevel('DEBUG').length
    };
    
    return stats;
  }
}

// Create singleton instance
const logger = new Logger('crypto-portfolio.log');

export default logger;