import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { ArrowLeft, MapPin, Clock, Tag, Star, CheckCircle2, Loader2, Share2 } from 'lucide-react'
import ShareModal from '../components/ShareModal'
import { useItems } from '../hooks/useItems'

const PLACEHOLDER_IMGS = {
  Toys: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  Books: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80',
  Shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
  Watches: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80',
  Clothes: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80',
  Electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
  Other: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80',
}

const CONDITION_COLORS = {
  'Like New': 'text-emerald-600 bg-emerald-50 border-emerald-200',
  'Good': 'text-blue-600 bg-blue-50 border-blue-200',
  'Fair': 'text-amber-600 bg-amber-50 border-amber-200',
  'Worn': 'text-slate-600 bg-slate-50 border-slate-200',
}

export default function ItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { markAsGifted } = useItems()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showShare, setShowShare] = useState(false)
  const [gifting, setGifting] = useState(false)
  const [giftedNow, setGiftedNow] = useState(false)

  useEffect(() => {
    getDoc(doc(db, 'items', id)).then(snap => {
      if (snap.exists()) setItem({ id: snap.id, ...snap.data() })
      setLoading(false)
    })
  }, [id])

  async function handleMarkGifted() {
    if (!confirm('Mark this item as gifted? This will remove it from the listings.')) return
    setGifting(true)
    await markAsGifted(id)
    setItem(prev => ({ ...prev, status: 'gifted' }))
    setGiftedNow(true)
    setGifting(false)
    setTimeout(() => setShowShare(true), 600)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-emerald-500" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-slate-500">
        <p>Item not found.</p>
        <button onClick={() => navigate('/')} className="text-emerald-600 underline">Back to listings</button>
      </div>
    )
  }

  const fallbackImg = PLACEHOLDER_IMGS[item.category] || PLACEHOLDER_IMGS.Other
  const whatsappUrl = `https://wa.me/${item.whatsapp?.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hi! I saw your "${item.title}" listed on I Gift You. Is it still available? 🎁`
  )}`

  const conditionClass = CONDITION_COLORS[item.condition] || CONDITION_COLORS['Fair']

  const timeAgo = item.createdAt?.seconds
    ? (() => {
        const diff = Date.now() / 1000 - item.createdAt.seconds
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
        return `${Math.floor(diff / 86400)} days ago`
      })()
    : 'Just now'

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-5 text-sm">
          <ArrowLeft size={16} /> Back to listings
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Image */}
          <div className="relative h-72 md:h-96 bg-slate-100">
            <img
              src={item.imageUrl || fallbackImg}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={e => { e.target.src = fallbackImg }}
            />
            {item.status === 'gifted' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-emerald-500 text-white font-bold px-6 py-3 rounded-full text-lg">
                  Gifted ✓
                </span>
              </div>
            )}
            <span className="absolute top-4 left-4 bg-white text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
              {item.category}
            </span>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">{item.title}</h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${conditionClass}`}>
                    {item.condition}
                  </span>
                  {item.locationName && (
                    <span className="flex items-center gap-1 text-sm text-slate-500">
                      <MapPin size={14} /> {item.locationName}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-sm text-slate-400">
                    <Clock size={14} /> Listed {timeAgo}
                  </span>
                </div>
              </div>
            </div>

            {item.description && (
              <p className="mt-5 text-slate-600 leading-relaxed border-t border-slate-100 pt-5">
                {item.description}
              </p>
            )}

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {item.status !== 'gifted' ? (
                <>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba58] text-white font-semibold py-3.5 rounded-xl transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Contact on WhatsApp
                  </a>
                  <button
                    onClick={handleMarkGifted}
                    disabled={gifting}
                    className="flex items-center justify-center gap-2 border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-medium py-3.5 px-5 rounded-xl transition-colors"
                  >
                    {gifting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                    Mark as Gifted
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowShare(true)}
                  className="flex items-center justify-center gap-2 bg-slate-800 text-white font-medium py-3.5 px-5 rounded-xl"
                >
                  <Share2 size={18} /> Share this gift story
                </button>
              )}
            </div>

            {giftedNow && (
              <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-700">
                <CheckCircle2 size={20} className="shrink-0" />
                <p className="text-sm font-medium">
                  Amazing! You've made someone's day. Share the news and inspire others to give!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showShare && <ShareModal item={item} onClose={() => setShowShare(false)} />}
    </div>
  )
}
