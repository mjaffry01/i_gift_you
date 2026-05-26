import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, SlidersHorizontal, Loader2 } from 'lucide-react'
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

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-teal-600 via-teal-500 to-teal-700 text-white py-16 px-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-52 h-52 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-4xl">🎁</span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">I Gift You</h1>
            <span className="text-4xl">🎁</span>
          </div>
          <p className="text-white text-2xl md:text-3xl font-bold mt-2">
            Share love and get love
          </p>
          <p className="text-teal-100 text-base mt-3 max-w-xl mx-auto">
            Give your unused items a second life — free for anyone who needs them.
          </p>
          <p className="text-teal-50 text-sm mt-2 max-w-lg mx-auto">
            Toys, books, clothes, shoes, kitchen items and more — across India.
          </p>
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
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-teal-600 border-l border-slate-200 pl-3 pr-2 transition-colors"
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
          </div>
          <div className="flex gap-8 justify-center mt-8 text-teal-100 text-sm">
            <span>
              <strong className="text-white text-2xl">{items.filter(i => i.status !== 'gifted').length}</strong>
              <br />Available gifts
            </span>
            <span className="text-teal-200">|</span>
            <span>
              <strong className="text-white text-2xl">{items.filter(i => i.status === 'gifted').length}</strong>
              <br />Items gifted
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilter && (
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={16} className="text-teal-600" />
              <span className="text-slate-600 font-medium">Max distance:</span>
              <select
                value={maxKm}
                onChange={e => setMaxKm(Number(e.target.value))}
                className="border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
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
                className="text-sm text-teal-600 underline"
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
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700'
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
            <Loader2 size={32} className="animate-spin text-teal-600" />
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
              className="mt-4 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium"
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
      <div className="bg-teal-50 border-t border-teal-100 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-10">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '📦', title: 'List your item', desc: 'Upload a photo of your unused toys, books, clothes, kitchen items or anything else you no longer need.' },
              { icon: '💬', title: 'Connect on WhatsApp', desc: 'Interested people contact you directly on WhatsApp — no middleman, no fees, no hassle.' },
              { icon: '🎁', title: 'Gift and share', desc: 'Hand over your item and share the news on social media. Inspire others to give too!' },
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

      {/* Bottom banner */}
      <div className="bg-teal-700 text-white py-10 px-4 text-center">
        <p className="text-2xl font-bold mb-2">Built for India, by Indians</p>
        <p className="text-teal-100 text-sm max-w-lg mx-auto">
          From Mumbai to Chennai, Delhi to Hyderabad — share what you no longer need with someone nearby who truly needs it.
        </p>
        <button
          onClick={() => navigate('/upload')}
          className="mt-5 bg-rose-500 hover:bg-rose-400 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          Start Gifting Today
        </button>

        {/* Share this website */}
        <div className="mt-8 border-t border-teal-600 pt-8">
          <p className="text-teal-100 text-sm font-medium mb-4">Spread the word — share I Gift You with your friends</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {/* WhatsApp */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent('Check out I Gift You 🎁 — a free platform to give away unused items to people who need them! https://mjaffry01.github.io/i_gift_you/')}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba58] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
            {/* Facebook */}
            <a
              href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fmjaffry01.github.io%2Fi_gift_you%2F"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#1877F2] hover:bg-[#1565d8] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </a>
            {/* X / Twitter */}
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out I Gift You 🎁 — give away unused items for free to people nearby! #IGiftYou #GiftItForward')}&url=${encodeURIComponent('https://mjaffry01.github.io/i_gift_you/')}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-black hover:bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              X
            </a>
            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fmjaffry01.github.io%2Fi_gift_you%2F"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#0A66C2] hover:bg-[#0958a8] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </a>
            {/* Telegram */}
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent('https://mjaffry01.github.io/i_gift_you/')}&text=${encodeURIComponent('Check out I Gift You 🎁 — give away unused items for free to people nearby!')}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#229ED9] hover:bg-[#1a8bbf] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              Telegram
            </a>
            {/* Email */}
            <a
              href={`mailto:?subject=${encodeURIComponent('I Gift You 🎁 — Free gifts near you!')}&body=${encodeURIComponent('Hey!\n\nI came across this wonderful platform called I Gift You where people give away unused items for free to others nearby.\n\nYou can find free toys, books, clothes, shoes, electronics, and more — just connect with the gifter on WhatsApp!\n\nCheck it out: https://mjaffry01.github.io/i_gift_you/\n\nShare love and get love 🎁')}`}
              className="flex items-center gap-2 bg-slate-500 hover:bg-slate-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>
              Email
            </a>
          </div>
        </div>
      </div>

    </div>
  )
}
