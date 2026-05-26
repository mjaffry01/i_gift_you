import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, MapPin, Camera, Loader2, CheckCircle2, X, ArrowLeft, User, Phone, Home } from 'lucide-react'
import { useItems } from '../hooks/useItems'

const CATEGORIES = ['Toys', 'Books', 'Clothes', 'Shoes', 'Watches', 'Electronics', 'Kitchen', 'Other']
const CONDITIONS = ['Like New', 'Good', 'Fair', 'Worn']

export default function UploadItem() {
  const navigate = useNavigate()
  const { addItem } = useItems()
  const fileRef = useRef()

  const [form, setForm] = useState({
    gifterName: '',
    title: '',
    description: '',
    category: '',
    condition: '',
    phone: '',
    whatsapp: '',
    address: '',
    locationName: '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [coords, setCoords] = useState(null)
  const [detecting, setDetecting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [errors, setErrors] = useState({})

  function handleChange(key, val) {
    setForm(prev => ({ ...prev, [key]: val }))
    setErrors(prev => ({ ...prev, [key]: '' }))
  }

  function handleImage(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

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
          const suburb = data.address?.suburb || ''
          const city = data.address?.city || data.address?.town || ''
          const road = data.address?.road || ''
          handleChange('locationName', [suburb, city].filter(Boolean).join(', ') || 'your area')
          if (!form.address && road) {
            handleChange('address', [road, suburb, city].filter(Boolean).join(', '))
          }
        } catch {
          handleChange('locationName', 'Location detected')
        }
        setDetecting(false)
      },
      () => setDetecting(false)
    )
  }

  function validate() {
    const errs = {}
    if (!form.gifterName.trim()) errs.gifterName = 'Your name is required'
    if (!form.title.trim()) errs.title = 'Item name is required'
    if (!form.category) errs.category = 'Pick a category'
    if (!form.condition) errs.condition = 'Pick a condition'
    if (!form.whatsapp.trim()) errs.whatsapp = 'WhatsApp number is required'
    if (!form.address.trim()) errs.address = 'Address is required'
    if (!form.locationName.trim()) errs.locationName = 'Area / city is required'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await addItem({ ...form, ...(coords || {}) }, imageFile)
      setDone(true)
    } catch {
      setErrors({ submit: 'Failed to upload. Please check your connection and try again.' })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setDone(false)
    setForm({ gifterName:'', title:'', description:'', category:'', condition:'', phone:'', whatsapp:'', address:'', locationName:'' })
    setImageFile(null)
    setImagePreview(null)
    setCoords(null)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 max-w-md w-full text-center">
          <div className="text-6xl mb-4">ðŸŽ</div>
          <CheckCircle2 size={48} className="text-orange-400 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-slate-800">Item Listed!</h2>
          <p className="text-slate-500 mt-2 text-sm">
            Your item is now live. People near <strong>{form.locationName}</strong> can find it and contact you directly.
          </p>
          <div className="flex gap-3 mt-8">
            <button onClick={() => navigate('/')} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl font-medium hover:bg-slate-50">
              Browse gifts
            </button>
            <button onClick={resetForm} className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl font-medium">
              List another
            </button>
          </div>
        </div>
      </div>
    )
  }

  const Field = ({ label, required, error, children }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Gift an Item</h1>
          <p className="text-slate-500 text-sm mb-6">Help someone who needs it. Free and takes 2 minutes.</p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Photo */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Photo <span className="text-slate-400 font-normal">(strongly recommended â€” items with photos get 5x more interest)</span>
              </label>
              <div
                onClick={() => fileRef.current?.click()}
                className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-colors ${imagePreview ? 'border-emerald-300' : 'border-slate-200 hover:border-orange-400'} overflow-hidden`}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="preview" className="w-full h-52 object-cover" />
                    <button type="button" onClick={e => { e.stopPropagation(); setImageFile(null); setImagePreview(null) }}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
                    <Camera size={36} />
                    <span className="text-sm font-medium">Tap to add a photo</span>
                    <span className="text-xs">JPG, PNG â€” any size accepted</span>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </div>

            {/* Gifter name */}
            <Field label="Your name" required error={errors.gifterName}>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={form.gifterName} onChange={e => handleChange('gifterName', e.target.value)}
                  placeholder="e.g. Priya Sharma, Ramesh Kumar"
                  className={`w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.gifterName ? 'border-red-400' : 'border-slate-200'}`} />
              </div>
            </Field>

            {/* Item name */}
            <Field label="Item name" required error={errors.title}>
              <input type="text" value={form.title} onChange={e => handleChange('title', e.target.value)}
                placeholder="e.g. Kids cricket bat, Class 5 NCERT books, Cotton salwar kameez..."
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.title ? 'border-red-400' : 'border-slate-200'}`} />
            </Field>

            {/* Description */}
            <Field label="Description">
              <textarea value={form.description} onChange={e => handleChange('description', e.target.value)}
                placeholder="e.g. Size M kurta, worn twice, good condition. Suitable for ages 6â€“10. Gifting as child has outgrown it..."
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
            </Field>

            {/* Category & Condition */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Category" required error={errors.category}>
                <select value={form.category} onChange={e => handleChange('category', e.target.value)}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.category ? 'border-red-400' : 'border-slate-200'}`}>
                  <option value="">Select category...</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Condition" required error={errors.condition}>
                <select value={form.condition} onChange={e => handleChange('condition', e.target.value)}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.condition ? 'border-red-400' : 'border-slate-200'}`}>
                  <option value="">Select condition...</option>
                  {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>

            {/* Phone & WhatsApp */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone number" error={errors.phone}>
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="tel" value={form.phone} onChange={e => handleChange('phone', e.target.value)}
                    placeholder="e.g. 09876543210"
                    className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
              </Field>
              <Field label="WhatsApp number" required error={errors.whatsapp}>
                <div className="relative">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-slate-400 absolute left-3 top-1/2 -translate-y-1/2">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <input type="tel" value={form.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)}
                    placeholder="e.g. 919876543210"
                    className={`w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.whatsapp ? 'border-red-400' : 'border-slate-200'}`} />
                </div>
                <p className="text-xs text-slate-400 mt-1">With country code e.g. 919876543210</p>
              </Field>
            </div>

            {/* Address */}
            <Field label="Street address" required error={errors.address}>
              <div className="relative">
                <Home size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                <textarea value={form.address} onChange={e => handleChange('address', e.target.value)}
                  placeholder="e.g. 24 MG Road, Indiranagar, Bengaluru&#10;(Where the person should collect the item)"
                  rows={2}
                  className={`w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none ${errors.address ? 'border-red-400' : 'border-slate-200'}`} />
              </div>
            </Field>

            {/* Area / City */}
            <Field label="Area / City" required error={errors.locationName}>
              <div className="flex gap-2">
                <input type="text" value={form.locationName} onChange={e => handleChange('locationName', e.target.value)}
                  placeholder="e.g. Andheri Mumbai, Koramangala Bengaluru, Banjara Hills Hyderabad..."
                  className={`flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.locationName ? 'border-red-400' : 'border-slate-200'}`} />
                <button type="button" onClick={detectLocation} disabled={detecting}
                  className="flex items-center gap-1.5 text-sm text-orange-500 border border-orange-200 bg-orange-50 hover:bg-orange-100 px-3 py-2 rounded-xl whitespace-nowrap transition-colors">
                  {detecting ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
                  Detect
                </button>
              </div>
            </Field>

            {errors.submit && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-200">{errors.submit}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-colors">
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
              {loading ? 'Uploading your gift...' : 'List My Gift for Free'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
