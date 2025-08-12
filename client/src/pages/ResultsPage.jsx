import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Share2, Trophy, Users, BarChart3 } from 'lucide-react'

const ResultsPage = () => {
  const navigate = useNavigate()

  // Mock data - in real app this would come from API
  const gameResults = {
    gameTitle: "Creative Problem Solving",
    teamName: "Team Alpha",
    totalScore: 95,
    teamRank: 2,
    duration: "45 minutes",
    completionDate: new Date().toLocaleDateString(),
    participants: [
      { name: "Alice Johnson", score: 98, role: "Team Lead" },
      { name: "Bob Smith", score: 92, role: "Designer" },
      { name: "Carol Davis", score: 95, role: "Developer" },
      { name: "David Wilson", score: 94, role: "Analyst" }
    ],
    insights: [
      "Strong collaborative communication",
      "Excellent creative thinking",
      "Room for improvement in time management",
      "Great problem-solving approach"
    ]
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)',
      color: '#e2e8f0'
    }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(51, 65, 85, 0.5)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #7c3aed, #2563eb)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy style={{ width: 20, height: 20, color: 'white' }} />
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>Game Results</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(51, 65, 85, 0.3)', background: 'rgba(51, 65, 85, 0.1)', color: 'white', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                <Download style={{ width: 16, height: 16 }} />
                Download Report
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(51, 65, 85, 0.3)', background: 'rgba(51, 65, 85, 0.1)', color: 'white', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                <Share2 style={{ width: 16, height: 16 }} />
                Share Results
              </button>
              <button onClick={() => navigate('/')} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </header>

  <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '80px 24px 32px' }}>
        {/* Results Header */}
        <div style={{
          background: 'rgba(51, 65, 85, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(51, 65, 85, 0.2)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h1 style={{ fontSize: 36, fontWeight: 800, color: 'white', marginBottom: 8 }}>Congratulations!</h1>
            <p style={{ fontSize: 18, color: '#94a3b8' }}>
              {gameResults.teamName} completed "{gameResults.gameTitle}"
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            <div style={{
              background: 'rgba(79, 70, 229, 0.1)',
              border: '1px solid rgba(79, 70, 229, 0.2)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#c084fc', marginBottom: 8 }}>{gameResults.totalScore}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>Team Score</div>
            </div>

            <div style={{
              background: 'rgba(37, 99, 235, 0.1)',
              border: '1px solid rgba(37, 99, 235, 0.2)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#60a5fa', marginBottom: 8 }}>#{gameResults.teamRank}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>Team Rank</div>
            </div>

            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#34d399', marginBottom: 8 }}>{gameResults.duration}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>Duration</div>
            </div>

            <div style={{
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.2)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#fbbf24', marginBottom: 8 }}>{gameResults.participants.length}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>Players</div>
            </div>
          </div>
        </div>

        {/* Team Performance */}
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32, marginBottom: 32 }}>
          <div style={{
            background: 'rgba(51, 65, 85, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(51, 65, 85, 0.2)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 16, display: 'flex', alignItems: 'center' }}>
              <Users style={{ width: 20, height: 20, marginRight: 8, color: '#c084fc' }} />
              Team Performance
            </h3>
            
            <div>
              {gameResults.participants.map((participant, index) => (
                <div key={index} style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid rgba(51, 65, 85, 0.3)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, color: 'white' }}>{participant.name}</span>
                    <span style={{ fontSize: 24, fontWeight: 800, color: '#c084fc' }}>{participant.score}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{participant.role}</div>
                  <div style={{ width: '100%', background: '#334155', borderRadius: 9999, height: 8, marginTop: 8 }}>
                    <div style={{ background: 'linear-gradient(90deg, #a855f7, #3b82f6)', height: 8, borderRadius: 9999, width: `${participant.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: 'rgba(51, 65, 85, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(51, 65, 85, 0.2)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 16, display: 'flex', alignItems: 'center' }}>
              <BarChart3 style={{ width: 20, height: 20, marginRight: 8, color: '#60a5fa' }} />
              Key Insights
            </h3>
            
            <div>
              {gameResults.insights.map((insight, index) => (
                <div key={index} style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid rgba(51, 65, 85, 0.3)',
                  borderLeft: '4px solid #3b82f6'
                }}>
                  <p style={{ color: '#cbd5e1' }}>{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
            <button 
              onClick={() => navigate('/ai-analysis-report')}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              View AI Analysis
            </button>
            <button 
              onClick={() => navigate('/manager-feedback')}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: '1px solid rgba(51, 65, 85, 0.3)',
                background: 'rgba(51, 65, 85, 0.1)',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Manager Feedback
            </button>
            <button 
              onClick={() => navigate('/rewards')}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                background: 'rgba(251, 191, 36, 0.1)',
                color: '#fbbf24',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Claim Rewards
            </button>
          </div>
          
          <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 12 }}>Game completed on {gameResults.completionDate}</p>
        </div>
      </div>
    </div>
  )
}

export default ResultsPage
