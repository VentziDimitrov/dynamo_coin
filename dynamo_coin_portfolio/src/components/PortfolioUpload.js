import React from 'react';
import { Upload, FileText } from 'lucide-react';

const PortfolioUpload = ({ handleFileUpload, uploadError, styles }) => (
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
);

export default PortfolioUpload;