import { Paper } from '../types'

interface PaperCardProps {
  paper: Paper
  index: number
  onClick?: () => void
}

function PaperCard({ paper, index, onClick }: PaperCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        backgroundColor: 'white',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
          e.currentTarget.style.transform = 'translateY(-2px)'
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
          e.currentTarget.style.transform = 'translateY(0)'
        }
      }}
    >
      <div style={{
        fontSize: '12px',
        color: '#666',
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{
          backgroundColor: '#f0f0f0',
          padding: '2px 8px',
          borderRadius: '4px',
          fontWeight: 'bold'
        }}>
          #{index + 1}
        </span>
        <span>{paper.categories.join(', ')}</span>
        <span>•</span>
        <span>{new Date(paper.publishedDate).toLocaleDateString()}</span>
      </div>

      <h3 style={{
        marginTop: '0',
        marginBottom: '10px',
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1a1a1a',
        lineHeight: '1.4'
      }}>
        {paper.title}
      </h3>

      <div style={{
        fontSize: '14px',
        color: '#555',
        marginBottom: '15px'
      }}>
        <strong>Authors:</strong> {paper.authors.slice(0, 3).join(', ')}
        {paper.authors.length > 3 && ` +${paper.authors.length - 3} more`}
      </div>

      {paper.summary ? (
        <div style={{
          backgroundColor: '#f0f7ff',
          padding: '15px',
          borderRadius: '6px',
          marginBottom: '15px',
          border: '1px solid #d0e7ff'
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#0066cc',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>🤖</span>
            <span>AI SUMMARY</span>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong style={{ color: '#0066cc' }}>Why Read:</strong><br />
            <span style={{ fontSize: '14px', color: '#333', lineHeight: '1.5' }}>
              {paper.summary.why}
            </span>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong style={{ color: '#0066cc' }}>Motivation:</strong><br />
            <span style={{ fontSize: '14px', color: '#333', lineHeight: '1.5' }}>
              {paper.summary.motivation}
            </span>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong style={{ color: '#0066cc' }}>Key Contributions:</strong>
            <ul style={{
              marginTop: '5px',
              marginBottom: '0',
              paddingLeft: '20px',
              fontSize: '14px',
              color: '#333',
              lineHeight: '1.5'
            }}>
              {paper.summary.keyContributions.map((contrib, idx) => (
                <li key={idx} style={{ marginBottom: '4px' }}>{contrib}</li>
              ))}
            </ul>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '12px',
            paddingTop: '10px',
            borderTop: '1px solid #d0e7ff'
          }}>
            <span style={{ fontSize: '12px', color: '#666' }}>
              Relevance Score: <strong style={{ color: '#0066cc' }}>
                {(paper.summary.relevanceScore * 100).toFixed(0)}%
              </strong>
            </span>
            {onClick && (
              <span style={{ fontSize: '12px', color: '#0066cc', fontWeight: 'bold' }}>
                Click for details →
              </span>
            )}
          </div>
        </div>
      ) : (
        <div style={{
          fontSize: '14px',
          color: '#333',
          lineHeight: '1.6',
          marginBottom: '15px',
          maxHeight: '100px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <strong>Abstract:</strong><br />
          {paper.abstract.substring(0, 300)}...
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '30px',
            background: 'linear-gradient(to bottom, transparent, white)',
          }} />
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <a
          href={paper.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            color: '#007bff',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          📄 View PDF
        </a>
        {onClick && (
          <span style={{
            color: '#666',
            fontSize: '14px'
          }}>
            |
          </span>
        )}
      </div>
    </div>
  )
}

export default PaperCard
