import React, { useState, useEffect } from 'react';
import { getLogs, clearLogs } from '../lib/logger';

const LogViewer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setLogs(getLogs());
      const interval = setInterval(() => setLogs(getLogs()), 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: '10px', left: '10px', zIndex: 9999,
          background: 'rgba(231, 76, 60, 0.4)', color: 'white', padding: '5px 10px',
          borderRadius: '4px', fontSize: '0.7rem', border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        Show Debug Logs
      </button>
    );
  }

  return (
    <div className="glass-panel" style={{
      position: 'fixed', bottom: 0, left: 0, width: '100%', height: '300px',
      zIndex: 10000, display: 'flex', flexDirection: 'column', 
      borderRadius: '16px 16px 0 0', borderBottom: 'none'
    }}>
      <div style={{ padding: '10px 20px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)' }}>
        <h4 style={{ margin: 0 }}>Temp Debug Terminal</h4>
        <div>
          <button onClick={() => { clearLogs(); setLogs([]); }} className="small-btn" style={{ marginRight: '10px', background: 'transparent' }}>Clear</button>
          <button onClick={() => setIsOpen(false)} className="small-btn" style={{ background: 'var(--accent)' }}>Close</button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', fontFamily: 'monospace', fontSize: '0.8rem' }}>
        {logs.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No logs yet...</p> : logs.map((log, i) => (
          <div key={i} style={{ marginBottom: '5px', color: log.type === 'ERROR' ? '#ff7675' : '#ffeaaa' }}>
            [{log.timestamp}] {log.type}: {log.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogViewer;
