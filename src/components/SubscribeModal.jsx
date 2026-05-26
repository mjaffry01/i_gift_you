import { useState } from 'react'
import { X, Bell, MapPin, CheckCircle2, Loader2, Gift } from 'lucide-react'
import { subscribeEmail } from '../hooks/useItems'

export default function SubscribeModal({ onClose }) {
  const [email, setEmail] = useState('')
  const [locationName, setLocationName] = useState('')
  const [detecting, setDetecting] = useState(false)
  const [coords, setCoords] = useState(null)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function detectLocation() {
    setDetecting(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
          )
          const data = await res.json()
          const name = data.address?.city || data.address?.town || data.address?.suburb || 'your area'
          setLocationName(name)
        } catch {
          setLocationName('Location detected')
        }
        setDetecting(false)
      },
      () => {
        setDetecting(false)
        setError('Could not detect location. Please type it manually.')
      }
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await subscribeEmail(email, coords ? { ...coords, name: locationName } : null)
      setDone(true)
    } catch {
      setError('Failed to subscribe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm relative overflow-hidden">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-slate-100 text-slate-500 rounded-full p-1.5 transition-colors"
        >
          <X size={18} />
        </button>

        {done ? (
          /* Success state */
          <div className="text-center px-6 py-10">
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={40} className="text-teal-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">You're all set!</h2>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
              We'll let you know when new free gifts are listed
              {locationName ? ` near ${locationName}` : ' in your area'}.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-2xl font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header banner */}
            <div className="bg-gradient-to-br from-teal-500 to-teal-700 px-6 pt-8 pb-6 text-white text-center">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Bell size={28} className="text-white" />
              </div>
              <h2 className="text-xl font-bold">Never Miss a Free Gift!</h2>
              <p className="text-teal-100 text-sm mt-1">
                Get notified the moment something new is listed near you
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Your email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border-2 border-slate-200 focus:border-teal-400 rounded-2xl px-4 py-3 text-sm outline-none transition-colors placeholder-slate-400"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Your city or area
                  <span className="ml-1 text-slate-400 font-normal">(optional)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={locationName}
                    onChange={e => setLocationName(e.target.value)}
                    placeholder="e.g. Andheri, Koramangala..."
                    className="flex-1 border-2 border-slate-200 focus:border-teal-400 rounded-2xl px-4 py-3 text-sm outline-none transition-colors placeholder-slate-400 min-w-0"
                  />
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={detecting}
                    className="flex items-center gap-1.5 text-sm font-semibold text-teal-600 border-2 border-teal-200 bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded-2xl whitespace-nowrap transition-colors"
                  >
                    {detecting
                      ? <Loader2 size={14} className="animate-spin" />
                      : <MapPin size={14} />
                    }
                    Detect
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white py-3.5 rounded-2xl font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-md shadow-teal-100"
              >
                {loading
                  ? <Loader2 size={20} className="animate-spin" />
                  : <Bell size={20} />
                }
                Notify Me for Free
              </button>

              <p className="text-center text-xs text-slate-400">
                No spam. Unsubscribe anytime.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
