import { useState } from 'react'
import { X, Bell, MapPin, CheckCircle2, Loader2 } from 'lucide-react'
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
    } catch (err) {
      setError('Failed to subscribe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          {done ? (
            <div className="text-center py-6">
              <CheckCircle2 size={56} className="text-rose-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-800">You're subscribed!</h2>
              <p className="text-slate-500 mt-2">
                We'll notify you when new items are listed
                {locationName ? ` near ${locationName}` : ''}.
              </p>
              <button
                onClick={onClose}
                className="mt-6 bg-teal-600 text-white px-6 py-2.5 rounded-lg font-medium"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-teal-50 p-2 rounded-xl">
                  <Bell size={24} className="text-teal-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Get Notified</h2>
                  <p className="text-sm text-slate-500">Be first to know about free gifts near you</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Your location (optional â€” for nearby alerts)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={locationName}
                      onChange={e => setLocationName(e.target.value)}
                      placeholder="e.g. Andheri, Koramangala, Banjara Hills..."
                      className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      type="button"
                      onClick={detectLocation}
                      disabled={detecting}
                      className="flex items-center gap-1.5 text-sm text-teal-600 border border-teal-100 bg-teal-50 hover:bg-teal-50 px-3 py-2 rounded-xl whitespace-nowrap transition-colors"
                    >
                      {detecting ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
                      Detect
                    </button>
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Bell size={18} />}
                  Subscribe for Free
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}


