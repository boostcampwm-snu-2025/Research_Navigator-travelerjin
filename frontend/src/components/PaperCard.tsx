import { Paper } from '../types'

interface PaperCardProps {
  paper: Paper
  onClick?: () => void
}

function PaperCard({ paper, onClick }: PaperCardProps) {
  const hasSummary = !!paper.summary

  return (
    <div
      onClick={onClick}
      style={{
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '0',
        backgroundColor: 'white',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.borderColor = '#007bff'
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.borderColor = '#e0e0e0'
        }
      }}
    >
      {/* Image placeholder - for future implementation */}
      <div style={{
        width: '100%',
        height: '140px',
        backgroundColor: hasSummary ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f0f0f0',
        background: hasSummary
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{
          fontSize: '48px',
          opacity: 0.3,
          color: 'white',
        }}>
          {hasSummary ? '🤖' : '📄'}
        </div>
        {/* Relevance badge */}
        {hasSummary && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#667eea',
          }}>
            {(paper.summary.relevanceScore * 100).toFixed(0)}% match
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Categories */}
        <div style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '12px',
          flexWrap: 'wrap',
        }}>
          {paper.categories.slice(0, 2).map((cat) => (
            <span
              key={cat}
              style={{
                backgroundColor: '#f0f7ff',
                color: '#0066cc',
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '600',
              }}
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 style={{
          margin: '0 0 12px 0',
          fontSize: '16px',
          fontWeight: '700',
          color: '#1a1a1a',
          lineHeight: '1.4',
          wordBreak: 'break-word',
          overflow: 'visible',
        }}>
          {paper.title}
        </h3>

        {/* Authors */}
        <div style={{
          fontSize: '12px',
          color: '#888',
          marginBottom: '12px',
        }}>
          {paper.authors.slice(0, 2).join(', ')}
          {paper.authors.length > 2 && ` +${paper.authors.length - 2}`}
        </div>

        {/* Hook or Abstract snippet */}
        <div style={{
          fontSize: '14px',
          color: hasSummary ? '#0066cc' : '#555',
          lineHeight: '1.5',
          marginBottom: '12px',
          flex: 1,
          fontStyle: hasSummary ? 'italic' : 'normal',
          wordBreak: 'break-word',
          overflow: 'visible',
        }}>
          {hasSummary ? `"${paper.summary.hook}"` : paper.abstract.substring(0, 150) + '...'}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: '12px',
          borderTop: '1px solid #f0f0f0',
          marginTop: 'auto',
        }}>
          <span style={{
            fontSize: '12px',
            color: '#999',
          }}>
            {new Date(paper.publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  )
}

export default PaperCard
