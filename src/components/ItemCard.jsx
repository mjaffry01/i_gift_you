import { Link } from 'react-router-dom'
import { MapPin, MessageCircle, Tag, Clock } from 'lucide-react'
import { formatDistance, getDistanceKm } from '../utils/distance'

const CATEGORY_COLORS = {
  Toys: 'bg-yellow-100 text-yellow-700',
  Books: 'bg-blue-100 text-blue-700',
  Shoes: 'bg-orange-100 text-orange-600',
  Watches: 'bg-purple-100 text-purple-700',
  Clothes: 'bg-pink-100 text-pink-700',
  Electronics: 'bg-cyan-100 text-cyan-700',
  Kitchen: 'bg-green-100 text-green-700',
  Other: 'bg-slate-100 text-slate-600',
}

const PLACEHOLDER_IMGS = {
  Toys: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&q=80',
  Books: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
  Shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
  Watches: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80',
  Clothes: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&q=80',
  Electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80',
  Kitchen: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
  Other: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80',
}

export default function ItemCard({ item, userLocation }) {
  const colorClass = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other
  const fallbackImg = PLACEHOLDER_IMGS[item.category] || PLACEHOLDER_IMGS.Other

  let distanceStr = null
  if (userLocation && item.lat && item.lng) {
    const km = getDistanceKm(userLocation.lat, userLocation.lng, item.lat, item.lng)
    distanceStr = formatDistance(km)
  }

  const whatsappUrl = `https://wa.me/${item.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hi! I saw your "${item.title}" listed on I Gift You. Is it still available? ðŸŽ`
  )}`

  const timeAgo = item.createdAt?.seconds
    ? (() => {
        const diff = Date.now() / 1000 - item.createdAt.seconds
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
        return `${Math.floor(diff / 86400)}d ago`
      })()
    : 'Just now'

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group">
      {/* Image */}
      <Link to={`/item/${item.id}`}>
        <div className="relative h-48 overflow-hidden bg-slate-100">
          <img
            src={item.imageUrl || fallbackImg}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => { e.target.src = fallbackImg }}
          />
          {item.status === 'gifted' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-emerald-500 text-white font-bold px-4 py-2 rounded-full text-sm">
                Gifted âœ“
              </span>
            </div>
          )}
          <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${colorClass}`}>
            {item.category}
          </span>
        </div>
      </Link>

      {/* Body */}
      <div className="p-4">
        <Link to={`/item/${item.id}`}>
          <h3 className="font-semibold text-slate-800 text-base line-clamp-1 hover:text-orange-500 transition-colors">
            {item.title}
          </h3>
          <p className="text-slate-500 text-sm mt-1 line-clamp-2">{item.description}</p>
        </Link>

        <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
          {distanceStr && (
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {distanceStr}
            </span>
          )}
          {item.locationName && (
            <span className="flex items-center gap-1 truncate">
              <MapPin size={12} /> {item.locationName}
            </span>
          )}
          <span className="flex items-center gap-1 ml-auto">
            <Clock size={12} /> {timeAgo}
          </span>
        </div>

        {/* WhatsApp CTA */}
        {item.status !== 'gifted' && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba58] text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp Gifter
          </a>
        )}
      </div>
    </div>
  )
}
