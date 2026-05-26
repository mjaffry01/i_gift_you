import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, SlidersHorizontal, Gift, Loader2, Recycle } from 'lucide-react'
import ItemCard from '../components/ItemCard'
import { useItems } from '../hooks/useItems'
import { getDistanceKm } from '../utils/distance'

const CATEGORIES = ['All', 'Toys', 'Books', 'Clothes', 'Shoes', 'Watches', 'Electronics', 'Kitchen', 'Other']

export default function Home() {
  const { items, loading } = useItems()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [maxKm, setMaxKm] = useState(50)
  const [showFilter, setShowFilter] = useState(false)
  const [userLocation, setUserLocation] = useState(null)

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(pos => {
      setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    })
  }, [])

  const filtered = items.filter(item => {
    if (item.status === 'gifted') return false
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || item.category === category
    let matchDist = true
    if (userLocation && item.lat && item.lng) {
      const km = getDistanceKm(userLocation.lat, userLocation.lng, item.lat, item.lng)
      matchDist = km <= maxKm
    }
    return matchSearch && matchCat && matchDist
  })

  return (
    <div className="min-h-screen">
      {/* Hero — saffron & green Indian palette */}
      <div className="relative bg-gradient-to-br from-orange-500 via-orange-400 to-green-600 text-white py-16 px-4 overflow-hidden">
        {/* Decorative rangoli-inspired circles */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-3xl mx-auto text-center relative">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-3xl">🎁</span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">I Gift You</h1>
            <span className="text-3xl">🙏</span>
          </div>
          <p className="text-orange-100 text-lg md:text-xl mt-2 max-w-xl mx-auto font-medium">
            दान करें, खुशी फैलाएं — Give your unused items a second life.
          </p>
          <p className="text-orange-50 text-sm mt-2 max-w-lg mx-auto">
            Toys, books, clothes, shoes, kitchen items &amp; more — free for anyone who needs them, across India.
          </p>

          {/* Search */}
          <div className="mt-8 flex gap-2 bg-white rounded-2xl p-2 shadow-lg max-w-xl mx-auto">
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search size={18} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search — toys, sarees, cricket bat, books..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 text-slate-800 text-sm placeholder-slate-400 outline-none bg-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-orange-500 border-l border-slate-200 pl-3 pr-2 transition-colors"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-8 justify-center mt-8 text-orange-100 text-sm">
            <span><strong className="text-white text-2xl">{items.filter(i => i.status !== 'gifted').length}</strong><br />Available gifts</span>
            <span className="text-orange-200">|</span>
            <span><strong className="text-white text-2xl">{items.filter(i => i.status === 'gifted').length}</strong><br />Items gifted</span>
          </div>
        </div>
      </div>

      {/* Filters panel */}
      {showFilter && (
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={16} className="text-orange-500" />
              <span className="text-slate-600 font-medium">Max distance:</span>
              <select
                value={maxKm}
                onChange={e => setMaxKm(Number(e.target.value))}
                className="border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                {[5, 10, 25, 50, 100].map(km => (
                  <option key={km} value={km}>{km} km</option>
                ))}
              </select>
            </div>
            {!userLocation && (
              <button
                onClick={() => navigator.geolocation?.getCurrentPosition(pos =>
                  setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
                )}
                className="text-sm text-orange-500 underline"
              >
                Enable location for distance filtering
              </button>
            )}
          </div>
        </div>
      )}

      {/* Category chips */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === cat
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-orange-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🎁</div>
            <h3 className="text-slate-500 text-lg font-medium">No items found</h3>
            <p className="text-slate-400 text-sm mt-1">
              {search || category !== 'All' ? 'Try adjusting your filters' : 'Be the first to list a gift in your area!'}
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium"
            >
              Gift an Item
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-4">
              {filtered.length} gift{filtered.length !== 1 ? 's' : ''} available
              {userLocation ? ' near you' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filtered.map(item => (
                <ItemCard key={item.id} item={item} userLocation={userLocation} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* How it works */}
      <div className="bg-gradient-to-b from-orange-50 to-white border-t border-orange-100 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-orange-500 font-semibold text-sm uppercase tracking-wide mb-2">Seva • सेवा</p>
          <h2 className="text-2xl font-bold text-slate-800 mb-10">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '📦', title: 'List your item', desc: 'Upload a photo of your unused toys, books, clothes, kitchen items or anything else you no longer need.' },
              { icon: '💬', title: 'Connect on WhatsApp', desc: 'Interested people contact you directly on WhatsApp — no middleman, no fees, no hassle.' },
              { icon: '🙏', title: 'Do seva — give & share', desc: 'Hand over your item and post the good news on social media. Inspire your friends and family to give too!' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center">
                <div className="text-5xl mb-3">{icon}</div>
                <h3 className="font-semibold text-slate-800 text-base mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Indian community banner */}
      <div className="bg-green-700 text-white py-10 px-4 text-center">
        <p className="text-2xl font-bold mb-2">🇮🇳 Built for India, by Indians</p>
        <p className="text-green-100 text-sm max-w-lg mx-auto">
          From Mumbai to Chennai, Delhi to Hyderabad — share what you no longer need with someone nearby who truly needs it.
        </p>
        <button
          onClick={() => navigate('/upload')}
          className="mt-5 bg-orange-500 hover:bg-orange-400 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          Start Gifting Today 🎁
        </button>
      </div>
    </div>
  )
}
