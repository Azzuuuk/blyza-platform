import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Gift, Star, Coins, ShoppingBag, Filter, Search } from 'lucide-react'

const RewardsStore = () => {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const [userCoins, setUserCoins] = useState(0)
  const [loading, setLoading] = useState(true)
  const [rewards, setRewards] = useState([])
  const [redeeming, setRedeeming] = useState(null)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  useEffect(()=>{
    let mounted = true
    async function load(){
      try {
        setLoading(true)
        setError(null)
        // lazy import to avoid bundle cycle
        const { MvpAPI } = await import('../api/index.js')
        await MvpAPI.upsertUser(import.meta.env.VITE_DEMO_USER_EMAIL || 'demo@blyza.com', 'Demo User')
        const [bal, rew] = await Promise.all([
          MvpAPI.balance().catch(()=>({ balance:0 })),
          MvpAPI.rewards().catch(()=>({ rewards:[] }))
        ])
        if(!mounted) return
        setUserCoins(bal.balance||0)
        setRewards(rew.rewards||[])
      } catch (e) { if(mounted) setError(e.message) }
      finally { if(mounted) setLoading(false) }
    }
    load()
    return ()=>{ mounted=false }
  },[])

  // Mock rewards data
  const categories = [
    { id: 'all', name: 'All Rewards', icon: ShoppingBag },
    { id: 'digital', name: 'Digital', icon: Star },
    { id: 'physical', name: 'Physical', icon: Gift },
    { id: 'experiences', name: 'Experiences', icon: Coins }
  ]

  const mappedRewards = rewards.map(r=>({
    id: r.id,
    title: r.name,
    description: r.metadata?.description || r.category,
    cost: r.pointsCost,
    category: r.category || 'other',
    image: r.metadata?.emoji || '�',
    inStock: r.active !== false,
    popular: r.metadata?.popular || false
  }))

  const filteredRewards = mappedRewards.filter(reward => {
    const matchesCategory = selectedCategory === 'all' || reward.category === selectedCategory
    const matchesSearch = reward.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reward.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handlePurchase = async (reward) => {
    if(redeeming) return
    setMessage(null)
    if (!reward.inStock) { setMessage('Item out of stock'); return }
    if (userCoins < reward.cost) { setMessage('Not enough coins'); return }
    setRedeeming(reward.id)
    try {
      const { MvpAPI } = await import('../api/index.js')
  const res = await MvpAPI.redeem(reward.id)
      setUserCoins(u=>u - reward.cost)
      setMessage(`Redeemed ${reward.title}. Code: ${res.code || 'N/A'}`)
  window.dispatchEvent(new CustomEvent('blyza:rewards:redeemed', { detail:{ rewardId: reward.id, redemption: res }}))
    } catch (e) { setError(e.message) }
    finally { setRedeeming(null) }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      color: '#e2e8f0'
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Rewards Store</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 px-4 py-2 rounded-full border border-yellow-500/30">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold text-yellow-300">{loading ? '...' : userCoins} coins</span>
              </div>
              
              <button
                onClick={() => navigate('/')}
                style={{
                  background: 'rgba(51, 65, 85, 0.5)',
                  color: '#cbd5e1',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  cursor: 'pointer'
                }}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Rewards Store
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Redeem your earned coins for exclusive rewards, experiences, and team-building benefits
          </p>
        </div>

        {/* Search and Filters */}
        <div style={{
          background: 'rgba(51, 65, 85, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(51, 65, 85, 0.2)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search rewards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '40px',
                  paddingRight: '16px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  background: 'rgba(51, 65, 85, 0.3)',
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }}
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(51, 65, 85, 0.3)',
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Rewards Grid */}
  {error && <div className="mb-4 text-red-400">{error}</div>}
  {message && <div className="mb-4 text-green-400">{message}</div>}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRewards.map((reward) => (
            <div key={reward.id} style={{
              background: 'rgba(51, 65, 85, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(51, 65, 85, 0.2)',
              borderRadius: '16px',
              padding: '24px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}>
              {reward.popular && (
                <div style={{
                  background: 'linear-gradient(to right, #7c3aed, #2563eb)',
                  color: 'white',
                  textAlign: 'center',
                  padding: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  borderRadius: '8px 8px 0 0',
                  margin: '-24px -24px 16px -24px'
                }}>
                  ⭐ Popular Choice
                </div>
              )}
              
              <div>
                <div className="text-center mb-4">
                  <div className="text-5xl mb-3">{reward.image}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {reward.title}
                  </h3>
                  <p className="text-slate-300 text-sm">
                    {reward.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Coins className="w-5 h-5 text-yellow-400" />
                    <span className="text-2xl font-bold text-white">
                      {reward.cost}
                    </span>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    reward.inStock 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {reward.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                <button
                  onClick={() => handlePurchase(reward)}
                  disabled={!reward.inStock || userCoins < reward.cost}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '500',
                    fontSize: '16px',
                    transition: 'all 0.3s ease',
                    cursor: (reward.inStock && userCoins >= reward.cost) ? 'pointer' : 'not-allowed',
                    background: (reward.inStock && userCoins >= reward.cost)
                      ? 'linear-gradient(to right, #7c3aed, #2563eb)'
                      : 'rgba(107, 114, 128, 0.5)',
                    color: 'white',
                    opacity: (reward.inStock && userCoins >= reward.cost) ? 1 : 0.6
                  }}
                >
                  {!reward.inStock 
                    ? 'Out of Stock' 
                    : userCoins < reward.cost 
                      ? 'Insufficient Coins' 
                      : (redeeming === reward.id ? 'Redeeming...' : 'Redeem Now')
                  }
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredRewards.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No rewards found
            </h3>
            <p className="text-slate-300">
              Try adjusting your search or category filter
            </p>
          </div>
        )}

        {/* Earn More Coins CTA */}
        <div className="glass-card mt-12 text-center border border-purple-500/30">
          <h2 className="text-2xl font-bold mb-4 gradient-text">
            Need More Coins?
          </h2>
          <p className="text-slate-300 mb-6">
            Play more games, complete challenges, and engage with your team to earn coins!
          </p>
          <button
            onClick={() => navigate('/games')}
            className="btn-primary"
          >
            Play Games to Earn Coins
          </button>
        </div>
      </div>
    </div>
  )
}

export default RewardsStore
