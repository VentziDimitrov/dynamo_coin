import React from 'react';
import { Wallet } from 'lucide-react';
import RefreshRateSelect from './RefreshRateSelect';
import config from '../config/config'

const Header = ({styles, fileUploaded, refreshRate, setRefreshRate}) => (
     <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoSection}>
            <div style={styles.logo}>
              <Wallet style={styles.logoIcon} />
            </div>
            <h1 style={styles.title}>{config.appName}</h1>
          </div>
          {fileUploaded &&  <RefreshRateSelect 
                              refreshRate={refreshRate}
                              setRefreshRate={setRefreshRate}
                              styles={styles}
                            />}
        </div>
      </div>
);

export default Header;