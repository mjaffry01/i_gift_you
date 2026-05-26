import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, SlidersHorizontal, Gift, Loader2, Heart, Recycle } from 'lucide-react'
import ItemCard from '../components/ItemCard'
import { useItems } from '../hooks/useItems'
import { getDistanceKm } from '../utils/distance'

const CATEGORIES = ['All', 'Toys', 'Books', 'Shoes', 'Watches', 'Clothes', 'Electronics', 'Other']

export default function Home() {
  const { items, loading } = useItems()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [maxKm, setMaxKm] = useState(50)
  const [showFilter, setShowFilter] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [locationLabel, setLocationLabel] = useState('')

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
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Recycle size={32} className="text-emerald-200" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">I Gift You</h1>
          </div>
          <p className="text-emerald-100 text-lg md:text-xl mt-3 max-w-xl mx-auto">
            Give your unused toys, books, shoes &amp; more a second life.<br />
            Free. Local. Meaningful.
          </p>

          {/* Search */}
          <div className="mt-8 flex gap-2 bg-white rounded-2xl p-2 shadow-lg max-w-xl mx-auto">
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search size={18} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search gifts (toys, books, shoes...)"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 text-slate-800 text-sm placeholder-slate-400 outline-none bg-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-emerald-600 border-l border-slate-200 pl-3 pr-2 transition-colors"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-6 justify-center mt-8 text-emerald-100 text-sm">
            <span><strong className="text-white text-lg">{items.filter(i => i.status !== 'gifted').length}</strong><br />Available gifts</span>
            <span><strong className="text-white text-lg">{items.filter(i => i.status === 'gifted').length}</strong><br />Items gifted</span>
          </div>
        </div>
      </div>

      {/* Filters panel */}
      {showFilter && (
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={16} className="text-emerald-600" />
              <span className="text-slate-600 font-medium">Max distance:</span>
              <select
                value={maxKm}
                onChange={e => setMaxKm(Number(e.target.value))}
                className="border border-slate-200 rounded-lg px-2 py-1 text-sm"
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
                className="text-sm text-emerald-600 underline"
              >
                Enable location for distance filtering
              </button>
            )}
          </div>
        </div>
      )}

      {/* Category chips */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
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
            <Loader2 size={32} className="animate-spin text-emerald-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Gift size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-slate-500 text-lg font-medium">No items found</h3>
            <p className="text-slate-400 text-sm mt-1">
              {search || category !== 'All' ? 'Try adjusting your filters' : 'Be the first to list a gift!'}
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="mt-4 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium"
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
      <div className="bg-white border-t border-slate-100 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-10">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: '📦', title: 'List your item', desc: 'Upload a photo and details of what you want to give away — toys, books, shoes, watches and more.' },
              { step: '2', icon: '💬', title: 'Connect on WhatsApp', desc: 'Interested people contact you directly on WhatsApp. No middleman, no fees.' },
              { step: '3', icon: '🎁', title: 'Make someone happy', desc: 'Hand over your item and share the moment on social media. Inspire others to give too!' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center">
                <div className="text-4xl mb-3">{icon}</div>
                <h3 className="font-semibold text-slate-800 text-base mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
