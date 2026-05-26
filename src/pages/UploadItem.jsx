import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, MapPin, Phone, Tag, FileText, Camera, Loader2, CheckCircle2, X, ArrowLeft } from 'lucide-react'
import { useItems } from '../hooks/useItems'

const CATEGORIES = ['Toys', 'Books', 'Shoes', 'Watches', 'Clothes', 'Electronics', 'Other']
const CONDITIONS = ['Like New', 'Good', 'Fair', 'Worn']

export default function UploadItem() {
  const navigate = useNavigate()
  const { addItem } = useItems()
  const fileRef = useRef()

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    whatsapp: '',
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
          const name = data.address?.suburb || data.address?.city || data.address?.town || 'your area'
          handleChange('locationName', name)
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
    if (!form.title.trim()) errs.title = 'Title is required'
    if (!form.category) errs.category = 'Pick a category'
    if (!form.condition) errs.condition = 'Pick a condition'
    if (!form.whatsapp.trim()) errs.whatsapp = 'WhatsApp number is required'
    if (!form.locationName.trim()) errs.locationName = 'Location is required'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await addItem(
        { ...form, ...(coords || {}) },
        imageFile
      )
      setDone(true)
    } catch (err) {
      setErrors({ submit: 'Failed to upload. Please check your Firebase config and try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 max-w-md w-full text-center">
          <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800">Item Listed!</h2>
          <p className="text-slate-500 mt-2">
            Your item is now live. People near you can find it and contact you on WhatsApp.
          </p>
          <div className="flex gap-3 mt-8">
            <button
              onClick={() => navigate('/')}
              className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl font-medium hover:bg-slate-50"
            >
              Browse gifts
            </button>
            <button
              onClick={() => { setDone(false); setForm({ title:'',description:'',category:'',condition:'',whatsapp:'',locationName:'' }); setImageFile(null); setImagePreview(null); setCoords(null) }}
              className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-medium"
            >
              List another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Gift an Item</h1>
          <p className="text-slate-500 text-sm mb-6">Help someone who needs it. It's free and takes 2 minutes.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Photo upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Photo <span className="text-slate-400 font-normal">(recommended)</span>
              </label>
              <div
                onClick={() => fileRef.current?.click()}
                className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-colors ${
                  imagePreview ? 'border-emerald-300' : 'border-slate-200 hover:border-emerald-400'
                } overflow-hidden`}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="preview" className="w-full h-52 object-cover" />
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setImageFile(null); setImagePreview(null) }}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-36 text-slate-400">
                    <Camera size={32} className="mb-2" />
                    <span className="text-sm">Click to add a photo</span>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Item name *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => handleChange('title', e.target.value)}
                placeholder="e.g. Lego City Police Set"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.title ? 'border-red-400' : 'border-slate-200'}`}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                placeholder="Brief description — age group, size, what's included..."
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            {/* Category & Condition */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
                <select
                  value={form.category}
                  onChange={e => handleChange('category', e.target.value)}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.category ? 'border-red-400' : 'border-slate-200'}`}
                >
                  <option value="">Select...</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Condition *</label>
                <select
                  value={form.condition}
                  onChange={e => handleChange('condition', e.target.value)}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.condition ? 'border-red-400' : 'border-slate-200'}`}
                >
                  <option value="">Select...</option>
                  {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                </select>
                {errors.condition && <p className="text-red-500 text-xs mt-1">{errors.condition}</p>}
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Your WhatsApp number *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">+</span>
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={e => handleChange('whatsapp', e.target.value)}
                  placeholder="27831234567"
                  className={`w-full border rounded-xl pl-7 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.whatsapp ? 'border-red-400' : 'border-slate-200'}`}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Include country code, no spaces. E.g. 27831234567</p>
              {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Location *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.locationName}
                  onChange={e => handleChange('locationName', e.target.value)}
                  placeholder="e.g. Sandton, Johannesburg"
                  className={`flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.locationName ? 'border-red-400' : 'border-slate-200'}`}
                />
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={detecting}
                  className="flex items-center gap-1.5 text-sm text-emerald-600 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl whitespace-nowrap transition-colors"
                >
                  {detecting ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
                  Detect
                </button>
              </div>
              {errors.locationName && <p className="text-red-500 text-xs mt-1">{errors.locationName}</p>}
            </div>

            {errors.submit && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-200">
                {errors.submit}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
              {loading ? 'Uploading...' : 'List My Gift'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
