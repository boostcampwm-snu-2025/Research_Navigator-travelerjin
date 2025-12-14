import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Paper } from '../types'
import PaperCard from '../components/PaperCard'

function Dashboard() {
  const navigate = useNavigate()
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
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#1a1a1a',
            marginTop: '0',
            marginBottom: '8px',
            letterSpacing: '-0.5px'
          }}>
            Research Signal Dashboard
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6c757d',
            margin: '0',
            fontWeight: '400'
          }}>
            Deep Learning & Computer Vision Papers (Last 7 Days)
          </p>
        </div>

        {/* Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <button
            onClick={fetchPapers}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: loading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,123,255,0.2)',
              opacity: loading ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#0056b3'
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,123,255,0.3)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#007bff'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,123,255,0.2)'
              }
            }}
          >
            🔄 {loading ? 'Loading...' : 'Refresh Papers'}
          </button>
          {lastUpdated && (
            <span style={{
              fontSize: '14px',
              color: '#6c757d'
            }}>
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </span>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: 'white',
            borderRadius: '8px',
            fontSize: '16px',
            color: '#6c757d'
          }}>
            Loading papers...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{
            padding: '20px',
            backgroundColor: '#fff3cd',
            color: '#856404',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #ffc107'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && papers.length === 0 && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: 'white',
            borderRadius: '8px',
            color: '#6c757d'
          }}>
            No papers found for the last 7 days.
          </div>
        )}

        {/* Papers List */}
        {!loading && papers.length > 0 && (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#1a1a1a',
                margin: '0'
              }}>
                {papers.length} Recent Papers
              </h2>
              <span style={{
                fontSize: '14px',
                color: '#6c757d',
                backgroundColor: '#e9ecef',
                padding: '6px 12px',
                borderRadius: '20px',
                fontWeight: '500'
              }}>
                {papers.filter(p => p.summary).length} with AI summaries
              </span>
            </div>

            {/* Grid layout for cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px',
            }}>
              {papers.map((paper) => (
                <PaperCard
                  key={paper.id}
                  paper={paper}
                  onClick={() => navigate(`/paper/${paper.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
