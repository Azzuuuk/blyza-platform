// 🎨 Mission Control Theme System
export const MISSION_THEME = {
  colors: {
    // Primary Mission Colors
    primary: '#00ff88',      // Neon green
    secondary: '#0080ff',    // Electric blue
    accent: '#ff6b35',       // Orange alert
    danger: '#ff0080',       // Magenta danger
    success: '#00ff88',      // Success green
    warning: '#ffaa00',      // Warning amber
    
    // Background System
    background: {
      primary: 'linear-gradient(135deg, #0a0f1c 0%, #1a1f2e 50%, #2d1b69 100%)',
      secondary: 'linear-gradient(45deg, #0d1117 0%, #1c2128 100%)',
      panel: 'rgba(0, 30, 60, 0.95)',
      overlay: 'rgba(0, 20, 40, 0.98)',
      glass: 'rgba(255, 255, 255, 0.05)',
      terminal: 'rgba(0, 0, 0, 0.8)',
    },
    
    // Text Colors
    text: {
      primary: '#ffffff',
      secondary: '#b8c5d6',
      muted: '#8b949e',
      classified: '#ff0080',
      system: '#00ff88',
    },
    
    // Status Colors
    status: {
      online: '#00ff88',
      offline: '#ff4444',
      pending: '#ffaa00',
      classified: '#ff0080',
    },
    
    // Role Colors
    roles: {
      technician: '#00ff88',
      intelligence: '#0080ff',
      communications: '#ff6b35',
      fieldAgent: '#ff0080',
    }
  },
  
  typography: {
    primary: "'JetBrains Mono', 'Courier New', monospace",
    secondary: "'Inter', 'Segoe UI', sans-serif",
    display: "'Orbitron', 'Roboto', sans-serif",
  },
  
  shadows: {
    glow: {
      primary: '0 0 20px rgba(0, 255, 136, 0.3)',
      secondary: '0 0 20px rgba(0, 128, 255, 0.3)',
      danger: '0 0 20px rgba(255, 0, 128, 0.3)',
      warning: '0 0 20px rgba(255, 170, 0, 0.3)',
    },
    panel: '0 8px 32px rgba(0, 0, 0, 0.6)',
    inset: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  },
  
  borders: {
    primary: '1px solid rgba(0, 255, 136, 0.3)',
    secondary: '1px solid rgba(0, 128, 255, 0.3)',
    glass: '1px solid rgba(255, 255, 255, 0.1)',
    glow: '2px solid rgba(0, 255, 136, 0.5)',
  },
  
  animations: {
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    glow: 'glow 3s ease-in-out infinite alternate',
    scan: 'scan 4s linear infinite',
    typing: 'typing 0.5s steps(20) infinite',
    fadeIn: 'fadeIn 0.5s ease-out',
    slideIn: 'slideIn 0.3s ease-out',
  }
}

export const MISSION_ANIMATIONS = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  @keyframes glow {
    from { box-shadow: 0 0 5px rgba(0, 255, 136, 0.2); }
    to { box-shadow: 0 0 20px rgba(0, 255, 136, 0.6); }
  }
  
  @keyframes scan {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100vw); }
  }
  
  @keyframes typing {
    0%, 50% { border-color: transparent; }
    51%, 100% { border-color: #00ff88; }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideIn {
    from { transform: translateX(-20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  .scan-line {
    position: absolute;
    top: 0;
    left: 0;
    width: 2px;
    height: 100%;
    background: linear-gradient(90deg, transparent, #00ff88, transparent);
    animation: scan 4s linear infinite;
    pointer-events: none;
  }
  
  .typing-cursor::after {
    content: '|';
    animation: typing 1s infinite;
  }
  
  .glass-panel {
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
  }
  
  .neon-border {
    position: relative;
    border: 2px solid transparent;
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 128, 255, 0.1));
    background-clip: padding-box;
  }
  
  .neon-border::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #00ff88, #0080ff, #ff6b35, #ff0080);
    border-radius: inherit;
    z-index: -1;
    opacity: 0.7;
  }
  
  .hologram {
    position: relative;
    overflow: hidden;
  }
  
  .hologram::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(0, 255, 136, 0.1), 
      transparent
    );
    animation: scan 3s linear infinite;
  }
  
  .mission-button {
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 128, 255, 0.1));
    border: 1px solid rgba(0, 255, 136, 0.3);
    color: #00ff88;
    padding: 12px 24px;
    border-radius: 6px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  
  .mission-button:hover {
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 128, 255, 0.2));
    border-color: #00ff88;
    box-shadow: 0 0 20px rgba(0, 255, 136, 0.4);
    transform: translateY(-2px);
  }
  
  .mission-button:active {
    transform: translateY(0);
  }
  
  .status-indicator {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 8px;
    animation: pulse 2s infinite;
  }
  
  .status-online { background: #00ff88; }
  .status-offline { background: #ff4444; }
  .status-pending { background: #ffaa00; }
  .status-classified { background: #ff0080; }
`
