import { useState } from 'react'
import { X, Copy, CheckCheck, Share2 } from 'lucide-react'
import { generateShareMessages } from '../utils/shareMessages'

const PLATFORMS = [
  {
    key: 'whatsapp',
    label: 'WhatsApp Status',
    color: 'bg-[#25D366]',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
  },
  {
    key: 'facebook',
    label: 'Facebook',
    color: 'bg-[#1877F2]',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    key: 'twitter',
    label: 'Twitter / X',
    color: 'bg-black',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    key: 'instagram',
    label: 'Instagram',
    color: 'bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#dc2743] via-[#cc2366] to-[#bc1888]',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
]

export default function ShareModal({ item, onClose }) {
  const messages = generateShareMessages(item)
  const [copied, setCopied] = useState(null)
  const [active, setActive] = useState('whatsapp')

  function copy(key) {
    navigator.clipboard.writeText(messages[key])
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const platform = PLATFORMS.find(p => p.key === active)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-emerald-100 p-2 rounded-xl">
              <Share2 size={22} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Share the good news!</h2>
              <p className="text-sm text-slate-500">Let your network know you gifted "{item.title}"</p>
            </div>
          </div>

          {/* Platform tabs */}
          <div className="flex gap-2 flex-wrap mb-4">
            {PLATFORMS.map(p => (
              <button
                key={p.key}
                onClick={() => setActive(p.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  active === p.key
                    ? `${p.color} text-white shadow-sm`
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className={active === p.key ? '' : 'opacity-50 grayscale'}>{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>

          {/* Message preview */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-sm text-slate-700 whitespace-pre-line leading-relaxed min-h-[140px]">
            {messages[active]}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => copy(active)}
              className="flex-1 flex items-center justify-center gap-2 border border-slate-200 hover:border-emerald-400 text-slate-700 hover:text-emerald-600 py-2.5 rounded-xl font-medium text-sm transition-colors"
            >
              {copied === active ? <CheckCheck size={16} className="text-emerald-500" /> : <Copy size={16} />}
              {copied === active ? 'Copied!' : 'Copy message'}
            </button>
            {active === 'twitter' && (
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(messages.twitter)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-2.5 rounded-xl font-medium text-sm"
              >
                Post on X
              </a>
            )}
            {active === 'whatsapp' && (
              <a
                href={`https://wa.me/?text=${encodeURIComponent(messages.whatsapp)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-2.5 rounded-xl font-medium text-sm"
              >
                Share on WhatsApp
              </a>
            )}
            {active === 'facebook' && (
              <a
                href={`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(messages.facebook)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-[#1877F2] text-white py-2.5 rounded-xl font-medium text-sm"
              >
                Share on Facebook
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
