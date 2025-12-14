import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Paper } from '../types'

function PaperDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [paper, setPaper] = useState<Paper | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`http://localhost:3001/api/papers/${id}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setPaper(data.paper)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch paper')
        console.error('Error fetching paper:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPaper()
    }
  }, [id])

  if (loading) {
    return (
      <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ fontSize: '16px', color: '#666' }}>Loading paper details...</div>
      </div>
    )
  }

  if (error || !paper) {
    return (
      <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          ← Back to Dashboard
        </button>
        <div style={{
          padding: '20px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderRadius: '8px'
        }}>
          Error: {error || 'Paper not found'}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <button
        onClick={() => navigate('/')}
        style={{
          padding: '10px 20px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '6px',
          cursor: 'pointer',
          marginBottom: '30px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#495057',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#e9ecef'
          e.currentTarget.style.borderColor = '#adb5bd'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#f8f9fa'
          e.currentTarget.style.borderColor = '#dee2e6'
        }}
      >
        ← Back to Dashboard
      </button>

      {/* Paper Header */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          {paper.categories.map((cat) => (
            <span
              key={cat}
              style={{
                backgroundColor: '#e3f2fd',
                color: '#1976d2',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              {cat}
            </span>
          ))}
          <span style={{ color: '#999' }}>•</span>
          <span style={{ fontSize: '14px', color: '#666' }}>
            {new Date(paper.publishedDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>

        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#1a1a1a',
          lineHeight: '1.3',
          marginTop: '0',
          marginBottom: '20px'
        }}>
          {paper.title}
        </h1>

        <div style={{
          fontSize: '16px',
          color: '#555',
          marginBottom: '20px'
        }}>
          <strong>Authors:</strong> {paper.authors.join(', ')}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <a
            href={paper.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0056b3'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#007bff'
            }}
          >
            📄 View PDF on arXiv
          </a>
        </div>
      </div>

      {/* AI Summary Section */}
      {paper.summary ? (
        <div style={{
          backgroundColor: '#f0f7ff',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '30px',
          border: '2px solid #d0e7ff'
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#0066cc',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '24px' }}>🤖</span>
            <span>AI-Generated Summary</span>
          </div>

          <div style={{
            display: 'grid',
            gap: '20px'
          }}>
            <div>
              <h3 style={{
                color: '#0066cc',
                fontSize: '16px',
                fontWeight: 'bold',
                marginTop: '0',
                marginBottom: '8px'
              }}>
                Why You Should Read This Paper
              </h3>
              <p style={{
                fontSize: '15px',
                color: '#333',
                lineHeight: '1.7',
                margin: '0'
              }}>
                {paper.summary.why}
              </p>
            </div>

            <div>
              <h3 style={{
                color: '#0066cc',
                fontSize: '16px',
                fontWeight: 'bold',
                marginTop: '0',
                marginBottom: '8px'
              }}>
                What This Paper Is About
              </h3>
              <p style={{
                fontSize: '15px',
                color: '#333',
                lineHeight: '1.7',
                margin: '0'
              }}>
                {paper.summary.what}
              </p>
            </div>

            <div>
              <h3 style={{
                color: '#0066cc',
                fontSize: '16px',
                fontWeight: 'bold',
                marginTop: '0',
                marginBottom: '8px'
              }}>
                Research Motivation
              </h3>
              <p style={{
                fontSize: '15px',
                color: '#333',
                lineHeight: '1.7',
                margin: '0'
              }}>
                {paper.summary.motivation}
              </p>
            </div>

            <div>
              <h3 style={{
                color: '#0066cc',
                fontSize: '16px',
                fontWeight: 'bold',
                marginTop: '0',
                marginBottom: '8px'
              }}>
                How It Fits in the Research Landscape
              </h3>
              <p style={{
                fontSize: '15px',
                color: '#333',
                lineHeight: '1.7',
                margin: '0'
              }}>
                {paper.summary.howItFits}
              </p>
            </div>

            <div>
              <h3 style={{
                color: '#0066cc',
                fontSize: '16px',
                fontWeight: 'bold',
                marginTop: '0',
                marginBottom: '8px'
              }}>
                Key Contributions
              </h3>
              <ul style={{
                margin: '0',
                paddingLeft: '24px',
                fontSize: '15px',
                color: '#333',
                lineHeight: '1.7'
              }}>
                {paper.summary.keyContributions.map((contrib, idx) => (
                  <li key={idx} style={{ marginBottom: '8px' }}>{contrib}</li>
                ))}
              </ul>
            </div>

            <div style={{
              marginTop: '10px',
              paddingTop: '20px',
              borderTop: '2px solid #d0e7ff',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>
                Relevance Score:
              </span>
              <div style={{
                position: 'relative',
                flex: 1,
                height: '24px',
                backgroundColor: '#fff',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #d0e7ff'
              }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${paper.summary.relevanceScore * 100}%`,
                  backgroundColor: '#0066cc',
                  transition: 'width 0.3s ease'
                }} />
                <span style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: paper.summary.relevanceScore > 0.5 ? '#fff' : '#333',
                  zIndex: 1
                }}>
                  {(paper.summary.relevanceScore * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#fff3cd',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
          border: '1px solid #ffc107',
          fontSize: '14px',
          color: '#856404'
        }}>
          ⚠️ AI summary not available for this paper yet. It may still be processing or rate limited.
        </div>
      )}

      {/* Original Abstract */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '12px',
        border: '1px solid #e0e0e0'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#1a1a1a',
          marginTop: '0',
          marginBottom: '15px'
        }}>
          Original Abstract
        </h2>
        <p style={{
          fontSize: '15px',
          color: '#333',
          lineHeight: '1.8',
          margin: '0',
          textAlign: 'justify'
        }}>
          {paper.abstract}
        </p>
      </div>
    </div>
  )
}

export default PaperDetail
