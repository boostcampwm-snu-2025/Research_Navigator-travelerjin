import { ExternalSignal } from '../types'

interface SignalCardProps {
  signal: ExternalSignal
  onClick?: () => void
}

function SignalCard({ signal, onClick }: SignalCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'twitter': return '#000000'        // X black
      case 'news': return '#0D9488'           // News teal
      case 'youtube': return '#FF0000'        // YouTube red
      case 'reddit': return '#FF4500'         // Reddit orange-red
      case 'hackernews': return '#FF6600'     // HN orange
      case 'stackoverflow': return '#F48024'  // SO orange
      default: return '#6c757d'
    }
  }

  const getTypeBackgroundColor = (type: string) => {
    switch (type) {
      case 'twitter': return 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)'
      case 'news': return 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)'
      case 'youtube': return 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)'
      case 'reddit': return 'linear-gradient(135deg, #FF4500 0%, #FF5722 100%)'
      case 'hackernews': return 'linear-gradient(135deg, #FF6600 0%, #FF8833 100%)'
      case 'stackoverflow': return 'linear-gradient(135deg, #F48024 0%, #F59033 100%)'
      default: return 'linear-gradient(135deg, #6c757d 0%, #868e96 100%)'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'twitter': return '𝕏'
      case 'news': return '📰'
      case 'youtube': return '▶️'
      case 'reddit': return '🔴'
      case 'hackernews': return 'Y'
      case 'stackoverflow': return '📚'
      default: return '🔗'
    }
  }

  const getTypeBorderColor = (type: string) => {
    switch (type) {
      case 'twitter': return 'rgba(0, 0, 0, 0.2)'
      case 'news': return 'rgba(13, 148, 136, 0.25)'
      case 'youtube': return 'rgba(255, 0, 0, 0.2)'
      case 'reddit': return 'rgba(255, 69, 0, 0.2)'
      case 'hackernews': return 'rgba(255, 102, 0, 0.2)'
      case 'stackoverflow': return 'rgba(244, 128, 36, 0.2)'
      default: return 'rgba(108, 117, 125, 0.2)'
    }
  }

  const getRelevanceColor = (score: number) => {
    if (score >= 0.7) return '#28a745'
    if (score >= 0.5) return '#ffc107'
    return '#6c757d'
  }

  return (
    <div
      onClick={onClick}
      style={{
        border: `2px solid ${getTypeBorderColor(signal.type)}`,
        borderRadius: '12px',
        padding: '0',
        backgroundColor: 'white',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        boxShadow: `0 2px 8px ${getTypeBorderColor(signal.type)}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = `0 8px 24px ${getTypeBorderColor(signal.type)}`
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.borderColor = getTypeColor(signal.type)
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = `0 2px 8px ${getTypeBorderColor(signal.type)}`
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.borderColor = getTypeBorderColor(signal.type)
        }
      }}
    >
      {/* Colored header bar with source type */}
      <div style={{
        background: getTypeBackgroundColor(signal.type),
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {getTypeIcon(signal.type)} {signal.type}
        </span>
        <span style={{
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.9)',
          fontWeight: '500',
        }}>
          {new Date(signal.publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Card content */}
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>

      {/* Title */}
      <h4 style={{
        margin: '0 0 12px 0',
        fontSize: '15px',
        fontWeight: '600',
        color: '#1a1a1a',
        lineHeight: '1.4',
        wordBreak: 'break-word',
      }}>
        {signal.title}
      </h4>

      {/* Content preview */}
      <p style={{
        fontSize: '13px',
        color: '#555',
        lineHeight: '1.5',
        marginBottom: '12px',
        flex: 1,
        wordBreak: 'break-word',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
      }}>
        {signal.content}
      </p>

      {/* Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '12px',
        borderTop: '1px solid #f0f0f0',
        marginTop: 'auto',
      }}>
        <span style={{
          fontSize: '12px',
          color: '#888',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
          marginRight: '8px',
        }}>
          {signal.authorHandle || signal.author}
        </span>
        <span style={{
          fontSize: '11px',
          fontWeight: 'bold',
          color: getRelevanceColor(signal.relevanceScore),
          whiteSpace: 'nowrap',
        }}>
          {(signal.relevanceScore * 100).toFixed(0)}% relevant
        </span>
      </div>
      </div>
    </div>
  )
}

export default SignalCard
