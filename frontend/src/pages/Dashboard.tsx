import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Paper, ExternalSignal } from '../types'
import PaperCard from '../components/PaperCard'
import SignalCard from '../components/SignalCard'

type TabType = 'papers' | 'signals'

function Dashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('papers')
  const [papers, setPapers] = useState<Paper[]>([])
  const [signals, setSignals] = useState<ExternalSignal[]>([])
  const [totalSignals, setTotalSignals] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [signalsLoading, setSignalsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  const sampleSignals = (items: ExternalSignal[], sampleSize: number) => {
    if (items.length <= sampleSize) return items
    // Fisher-Yates shuffle up to sampleSize to keep it fast
    const arr = [...items]
    for (let i = arr.length - 1; i > arr.length - sampleSize - 1; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr.slice(-sampleSize)
  }

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

  const fetchSignals = async () => {
    try {
      setSignalsLoading(true)
      const response = await fetch('http://localhost:3001/api/signals/today')

      if (!response.ok) {
        console.warn(`Signals API returned ${response.status}`)
        return
      }

      const data = await response.json()
      setTotalSignals(data.count || data.signals?.length || 0)
      const sampled = sampleSignals(data.signals || [], 30)
      setSignals(sampled)
    } catch (err) {
      console.error('Error fetching signals:', err)
      // Don't show error - signals are optional
    } finally {
      setSignalsLoading(false)
    }
  }

  useEffect(() => {
    fetchPapers()
    fetchSignals()
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
        <div style={{ marginBottom: '32px' }}>
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
            Deep Learning & Computer Vision Research
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          borderBottom: '2px solid #e9ecef',
          paddingBottom: '0'
        }}>
          <button
            onClick={() => setActiveTab('papers')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: activeTab === 'papers' ? '#007bff' : '#6c757d',
              border: 'none',
              borderBottom: activeTab === 'papers' ? '3px solid #007bff' : '3px solid transparent',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              marginBottom: '-2px'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'papers') {
                e.currentTarget.style.color = '#495057'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'papers') {
                e.currentTarget.style.color = '#6c757d'
              }
            }}
          >
            Papers ({papers.length})
          </button>
          <button
            onClick={() => setActiveTab('signals')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: activeTab === 'signals' ? '#007bff' : '#6c757d',
              border: 'none',
              borderBottom: activeTab === 'signals' ? '3px solid #007bff' : '3px solid transparent',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              marginBottom: '-2px'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'signals') {
                e.currentTarget.style.color = '#495057'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'signals') {
                e.currentTarget.style.color = '#6c757d'
              }
            }}
          >
            External Signals ({signals.length})
          </button>
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
            onClick={activeTab === 'papers' ? fetchPapers : fetchSignals}
            disabled={activeTab === 'papers' ? loading : signalsLoading}
            style={{
              padding: '12px 24px',
              backgroundColor: (activeTab === 'papers' ? loading : signalsLoading) ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: (activeTab === 'papers' ? loading : signalsLoading) ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,123,255,0.2)',
              opacity: (activeTab === 'papers' ? loading : signalsLoading) ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!(activeTab === 'papers' ? loading : signalsLoading)) {
                e.currentTarget.style.backgroundColor = '#0056b3'
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,123,255,0.3)'
              }
            }}
            onMouseLeave={(e) => {
              if (!(activeTab === 'papers' ? loading : signalsLoading)) {
                e.currentTarget.style.backgroundColor = '#007bff'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,123,255,0.2)'
              }
            }}
          >
            {activeTab === 'papers'
              ? (loading ? 'Loading...' : 'Refresh Papers')
              : (signalsLoading ? 'Loading...' : 'Refresh Signals')
            }
          </button>
          {lastUpdated && activeTab === 'papers' && (
            <span style={{
              fontSize: '14px',
              color: '#6c757d'
            }}>
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </span>
          )}
        </div>

        {/* Papers Tab Content */}
        {activeTab === 'papers' && (
          <>
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
                    Recent Papers (Last 7 Days)
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
          </>
        )}

        {/* Signals Tab Content */}
        {activeTab === 'signals' && (
          <>
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
                Feeds (Last 72 Hours)
              </h2>
              {signals.length > 0 && (
                <span style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  backgroundColor: '#fff3cd',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontWeight: '500',
                  border: '1px solid #ffc107'
                }}>
                  Showing {signals.length} of {totalSignals || signals.length}
                </span>
              )}
            </div>

            <p style={{
              fontSize: '14px',
              color: '#6c757d',
              marginBottom: '24px'
            }}>
              AI-curated news and discussions related to Deep Learning & Computer Vision
            </p>

            {signalsLoading ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: 'white',
                borderRadius: '8px',
                fontSize: '16px',
                color: '#6c757d'
              }}>
                Loading external signals...
              </div>
            ) : signals.length === 0 ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: 'white',
                borderRadius: '8px',
                color: '#6c757d'
              }}>
                No external signals found.
                <div style={{ marginTop: '12px', fontSize: '14px' }}>
                  Make sure NEWSAPI_KEY is configured in backend/.env
                </div>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px',
              }}>
                {signals.map((signal) => (
                  <SignalCard
                    key={signal.id}
                    signal={signal}
                    onClick={() => window.open(signal.url, '_blank')}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard
