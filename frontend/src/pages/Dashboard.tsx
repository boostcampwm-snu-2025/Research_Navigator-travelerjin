import { useState, useEffect } from 'react'

interface PaperSummary {
  why: string
  what: string
  howItFits: string
  motivation: string
  keyContributions: string[]
  relevanceScore: number
}

interface Paper {
  id: string
  title: string
  authors: string[]
  abstract: string
  publishedDate: string
  categories: string[]
  pdfUrl: string
  summary?: PaperSummary
}

function Dashboard() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  const fetchPapers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('http://localhost:3001/api/papers/today')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setPapers(data.papers || [])
      setLastUpdated(data.lastUpdated || new Date().toISOString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch papers')
      console.error('Error fetching papers:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPapers()
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Research Signal Dashboard</h1>
      <p>Deep Learning & Computer Vision Papers (Last 7 Days)</p>

      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <button
          onClick={fetchPapers}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh Papers
        </button>
        {lastUpdated && (
          <span style={{ marginLeft: '15px', color: '#666' }}>
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </span>
        )}
      </div>

      {loading && <div style={{ padding: '20px' }}>Loading papers...</div>}

      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          Error: {error}
        </div>
      )}

      {!loading && !error && papers.length === 0 && (
        <div style={{ padding: '20px', color: '#666' }}>
          No papers found for the last 7 days.
        </div>
      )}

      {!loading && papers.length > 0 && (
        <div>
          <h2>Found {papers.length} papers</h2>

          {papers.map((paper, index) => (
            <div
              key={paper.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px',
                backgroundColor: 'white'
              }}
            >
              <div style={{
                fontSize: '12px',
                color: '#666',
                marginBottom: '10px'
              }}>
                #{index + 1} | {paper.categories.join(', ')} | {new Date(paper.publishedDate).toLocaleDateString()}
              </div>

              <h3 style={{
                marginTop: '0',
                marginBottom: '10px',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                {paper.title}
              </h3>

              <div style={{
                fontSize: '14px',
                color: '#555',
                marginBottom: '10px'
              }}>
                <strong>Authors:</strong> {paper.authors.join(', ')}
              </div>

              {paper.summary ? (
                <div style={{
                  backgroundColor: '#f0f7ff',
                  padding: '15px',
                  borderRadius: '6px',
                  marginBottom: '15px',
                  border: '1px solid #d0e7ff'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0066cc', marginBottom: '8px' }}>
                    🤖 AI SUMMARY
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <strong style={{ color: '#0066cc' }}>Why Read:</strong><br />
                    <span style={{ fontSize: '14px', color: '#333' }}>{paper.summary.why}</span>
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <strong style={{ color: '#0066cc' }}>Motivation:</strong><br />
                    <span style={{ fontSize: '14px', color: '#333' }}>{paper.summary.motivation}</span>
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <strong style={{ color: '#0066cc' }}>Key Contributions:</strong>
                    <ul style={{ marginTop: '5px', paddingLeft: '20px', fontSize: '14px', color: '#333' }}>
                      {paper.summary.keyContributions.map((contrib, idx) => (
                        <li key={idx}>{contrib}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Relevance Score: {(paper.summary.relevanceScore * 100).toFixed(0)}%
                  </div>
                </div>
              ) : (
                <div style={{
                  fontSize: '14px',
                  color: '#333',
                  lineHeight: '1.6',
                  marginBottom: '15px'
                }}>
                  <strong>Abstract:</strong><br />
                  {paper.abstract}
                </div>
              )}

              <div>
                <a
                  href={paper.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#007bff',
                    textDecoration: 'none',
                    fontSize: '14px'
                  }}
                >
                  View PDF →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard
