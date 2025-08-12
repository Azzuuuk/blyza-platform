import React from 'react'
import { motion } from 'framer-motion'
import { MISSION_THEME } from './MissionTheme'

// 🖥️ Terminal Window Component
export const TerminalWindow = ({ title, children, className = '', status = 'online', ...props }) => {
  const statusColors = {
    online: MISSION_THEME.colors.status.online,
    offline: MISSION_THEME.colors.status.offline,
    pending: MISSION_THEME.colors.status.pending,
    classified: MISSION_THEME.colors.status.classified,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`glass-panel neon-border hologram ${className}`}
      style={{
        background: MISSION_THEME.colors.background.panel,
        border: `1px solid ${statusColors[status]}30`,
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: MISSION_THEME.shadows.panel,
        ...props.style
      }}
      {...props}
    >
      {/* Terminal Header */}
      <div
        style={{
          background: `linear-gradient(90deg, ${statusColors[status]}20, transparent)`,
          borderBottom: `1px solid ${statusColors[status]}30`,
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div 
            className={`status-indicator status-${status}`}
            style={{ background: statusColors[status] }}
          />
          <span
            style={{
              color: MISSION_THEME.colors.text.primary,
              fontFamily: MISSION_THEME.typography.primary,
              fontSize: '14px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            {title}
          </span>
        </div>
        
        {/* Terminal Controls */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff4444' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffaa00' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColors[status] }} />
        </div>
      </div>
      
      {/* Terminal Content */}
      <div style={{ padding: '20px' }}>
        {children}
      </div>
      
      {/* Scanning Line Effect */}
      <div className="scan-line" />
    </motion.div>
  )
}

// 🎯 Mission Progress Bar
export const MissionProgress = ({ current, total, label, className = '' }) => {
  const percentage = (current / total) * 100

  return (
    <div className={className} style={{ marginBottom: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px',
          fontFamily: MISSION_THEME.typography.primary,
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}
      >
        <span style={{ color: MISSION_THEME.colors.text.secondary }}>{label}</span>
        <span style={{ color: MISSION_THEME.colors.primary }}>{current}/{total}</span>
      </div>
      
      <div
        style={{
          background: MISSION_THEME.colors.background.terminal,
          border: `1px solid ${MISSION_THEME.colors.primary}30`,
          borderRadius: '4px',
          height: '8px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${MISSION_THEME.colors.primary}, ${MISSION_THEME.colors.secondary})`,
            boxShadow: `0 0 10px ${MISSION_THEME.colors.primary}50`,
          }}
        />
        
        {/* Progress glow effect */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(90deg, transparent, ${MISSION_THEME.colors.primary}30, transparent)`,
            animation: 'scan 2s linear infinite'
          }}
        />
      </div>
    </div>
  )
}

// 🕒 Mission Timer
export const MissionTimer = ({ timeLeft, className = '' }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const isUrgent = timeLeft < 300 // Last 5 minutes
  const isCritical = timeLeft < 60 // Last minute

  return (
    <motion.div
      className={className}
      animate={isCritical ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 1, repeat: Infinity }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isCritical 
          ? `linear-gradient(135deg, ${MISSION_THEME.colors.danger}20, transparent)`
          : isUrgent 
          ? `linear-gradient(135deg, ${MISSION_THEME.colors.warning}20, transparent)`
          : `linear-gradient(135deg, ${MISSION_THEME.colors.primary}20, transparent)`,
        border: `2px solid ${
          isCritical ? MISSION_THEME.colors.danger : 
          isUrgent ? MISSION_THEME.colors.warning : 
          MISSION_THEME.colors.primary
        }`,
        borderRadius: '8px',
        padding: '16px 24px',
        boxShadow: isCritical 
          ? MISSION_THEME.shadows.glow.danger
          : isUrgent 
          ? MISSION_THEME.shadows.glow.warning
          : MISSION_THEME.shadows.glow.primary,
      }}
    >
      <span
        style={{
          fontFamily: MISSION_THEME.typography.display,
          fontSize: '32px',
          fontWeight: '700',
          color: isCritical 
            ? MISSION_THEME.colors.danger 
            : isUrgent 
            ? MISSION_THEME.colors.warning 
            : MISSION_THEME.colors.primary,
          textShadow: `0 0 10px ${
            isCritical ? MISSION_THEME.colors.danger : 
            isUrgent ? MISSION_THEME.colors.warning : 
            MISSION_THEME.colors.primary
          }50`,
          letterSpacing: '2px'
        }}
      >
        {formatTime(timeLeft)}
      </span>
    </motion.div>
  )
}

// 🎭 Role Badge
export const RoleBadge = ({ role, active = false, className = '' }) => {
  const roleColors = MISSION_THEME.colors.roles
  const roleColor = roleColors[role] || MISSION_THEME.colors.text.secondary

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '8px 16px',
        background: active 
          ? `linear-gradient(135deg, ${roleColor}20, ${roleColor}10)`
          : `linear-gradient(135deg, ${MISSION_THEME.colors.background.glass}, transparent)`,
        border: `1px solid ${active ? roleColor : MISSION_THEME.borders.glass}`,
        borderRadius: '20px',
        fontFamily: MISSION_THEME.typography.primary,
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        color: active ? roleColor : MISSION_THEME.colors.text.secondary,
        boxShadow: active ? `0 0 15px ${roleColor}30` : 'none',
        transition: 'all 0.3s ease'
      }}
    >
      <div
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: roleColor,
          marginRight: '8px',
          animation: active ? 'pulse 2s infinite' : 'none'
        }}
      />
      {role.replace(/([A-Z])/g, ' $1').trim()}
    </motion.div>
  )
}

// 🔘 Mission Button
export const MissionButton = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  loading = false,
  className = '',
  ...props 
}) => {
  const variants = {
    primary: {
      background: `linear-gradient(135deg, ${MISSION_THEME.colors.primary}20, ${MISSION_THEME.colors.secondary}20)`,
      border: `1px solid ${MISSION_THEME.colors.primary}`,
      color: MISSION_THEME.colors.primary,
      boxShadow: MISSION_THEME.shadows.glow.primary
    },
    secondary: {
      background: `linear-gradient(135deg, ${MISSION_THEME.colors.background.glass}, transparent)`,
      border: MISSION_THEME.borders.glass,
      color: MISSION_THEME.colors.text.secondary,
      boxShadow: 'none'
    },
    danger: {
      background: `linear-gradient(135deg, ${MISSION_THEME.colors.danger}20, transparent)`,
      border: `1px solid ${MISSION_THEME.colors.danger}`,
      color: MISSION_THEME.colors.danger,
      boxShadow: MISSION_THEME.shadows.glow.danger
    }
  }

  const sizes = {
    small: { padding: '8px 16px', fontSize: '12px' },
    medium: { padding: '12px 24px', fontSize: '14px' },
    large: { padding: '16px 32px', fontSize: '16px' }
  }

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={`mission-button ${className}`}
      disabled={disabled || loading}
      style={{
        ...variants[variant],
        ...sizes[size],
        fontFamily: MISSION_THEME.typography.primary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        borderRadius: '6px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
      {...props}
    >
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '16px',
            height: '16px',
            border: `2px solid ${MISSION_THEME.colors.primary}30`,
            borderTop: `2px solid ${MISSION_THEME.colors.primary}`,
            borderRadius: '50%',
            marginRight: '8px',
            display: 'inline-block'
          }}
        />
      )}
      {children}
    </motion.button>
  )
}

// 💬 Chat Message
export const ChatMessage = ({ message, className = '' }) => {
  const isSystem = message.type === 'system'
  const isTeamInput = message.type === 'team-input'
  
  const messageColors = {
    system: MISSION_THEME.colors.text.system,
    'team-input': MISSION_THEME.colors.secondary,
    player: MISSION_THEME.colors.text.primary
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
      style={{
        background: isSystem 
          ? `linear-gradient(90deg, ${MISSION_THEME.colors.primary}10, transparent)`
          : isTeamInput
          ? `linear-gradient(90deg, ${MISSION_THEME.colors.secondary}10, transparent)`
          : `linear-gradient(90deg, ${MISSION_THEME.colors.background.glass}, transparent)`,
        border: `1px solid ${
          isSystem ? MISSION_THEME.colors.primary + '30' :
          isTeamInput ? MISSION_THEME.colors.secondary + '30' :
          MISSION_THEME.borders.glass
        }`,
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '8px',
        fontFamily: MISSION_THEME.typography.primary,
        fontSize: '13px'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '4px'
        }}
      >
        <span
          style={{
            color: messageColors[message.type],
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontSize: '11px'
          }}
        >
          {message.role}
        </span>
        <span
          style={{
            color: MISSION_THEME.colors.text.muted,
            fontSize: '10px'
          }}
        >
          {message.timestamp}
        </span>
      </div>
      <div style={{ color: MISSION_THEME.colors.text.primary }}>
        {message.content}
      </div>
    </motion.div>
  )
}
