import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Upload, MapPin, Camera, Loader2, CheckCircle2, X, ArrowLeft, User, Phone, Home, Copy, Send, Gift, Mail, PlusCircle, Trash2 } from 'lucide-react'
import { useItems } from '../hooks/useItems'
import { useLanguage } from '../context/LanguageContext'

const CATEGORIES = ['Toys', 'Books', 'Clothes', 'Shoes', 'Watches', 'Electronics', 'Kitchen', 'Other']
const CONDITIONS = ['Like New', 'Good', 'Fair', 'Worn']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[0-9\s()-]{10,20}$/

function isValidPhone(value) {
  const digits = value.replace(/\D/g, '')
  return PHONE_RE.test(value) && digits.length >= 10 && digits.length <= 15
}

function newGift() {
  return {
    title: '',
    description: '',
    category: '',
    condition: '',
    imageFile: null,
    imagePreview: null,
  }
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

export default function UploadItem() {
  const navigate = useNavigate()
  const { T } = useLanguage()
  const U = T.upload
  const { addItem } = useItems()
  const fileRef = useRef()
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const [form, setForm] = useState({
    gifterName: '',
    title: '',
    description: '',
    category: '',
    condition: '',
    gifterEmail: '',
    phone: '',
    whatsapp: '',
    address: '',
    locationName: '',
  })
  const [gifts, setGifts] = useState(() => [newGift()])
  const [activeGiftIndex, setActiveGiftIndex] = useState(0)
  const [coords, setCoords] = useState(null)
  const [detecting, setDetecting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [errors, setErrors] = useState({})
  const [showCamera, setShowCamera] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [createdItemIds, setCreatedItemIds] = useState([])
  const [copiedGiftedLink, setCopiedGiftedLink] = useState(false)
  const [phoneOverridden, setPhoneOverridden] = useState(false)

  useEffect(() => {
    if (!showCamera) return undefined

    let cancelled = false

    async function startCamera() {
      setCameraError('')
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Camera is not available in this browser. Please choose a photo instead.')
        return
      }

      try {
        let stream
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' } },
            audio: false,
          })
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        }

        if (cancelled) {
          stream.getTracks().forEach(track => track.stop())
          return
        }

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
      } catch {
        setCameraError('Could not open the camera. Please allow camera access or choose a photo.')
      }
    }

    startCamera()

    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }, [showCamera])

  function handleChange(key, val) {
    setForm(prev => {
      if (key === 'whatsapp' && !phoneOverridden) {
        return { ...prev, whatsapp: val, phone: val }
      }
      return { ...prev, [key]: val }
    })
    setErrors(prev => ({ ...prev, [key]: '' }))
  }

  function handlePhoneChange(val) {
    setPhoneOverridden(true)
    handleChange('phone', val)
  }

  function handleGiftChange(index, key, val) {
    setGifts(prev => prev.map((gift, i) => (
      i === index ? { ...gift, [key]: val } : gift
    )))
    setErrors(prev => {
      const giftErrors = [...(prev.gifts || [])]
      giftErrors[index] = { ...(giftErrors[index] || {}), [key]: '' }
      return { ...prev, gifts: giftErrors }
    })
  }

  function addGift() {
    setGifts(prev => [...prev, newGift()])
    setActiveGiftIndex(gifts.length)
  }

  function removeGift(index) {
    if (gifts.length === 1) return
    const gift = gifts[index]
    if (gift.imagePreview) URL.revokeObjectURL(gift.imagePreview)
    setGifts(prev => prev.filter((_, i) => i !== index))
    setActiveGiftIndex(0)
  }

  function handleImage(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setGifts(prev => prev.map((gift, i) => {
      if (i !== activeGiftIndex) return gift
      if (gift.imagePreview) URL.revokeObjectURL(gift.imagePreview)
      return { ...gift, imageFile: file, imagePreview: URL.createObjectURL(file) }
    }))
    setShowCamera(false)
    e.target.value = ''
  }

  function openPhotoCapture(index) {
    setActiveGiftIndex(index)
    if (navigator.mediaDevices?.getUserMedia) {
      setShowCamera(true)
    } else {
      fileRef.current?.click()
    }
  }

  function clearImage(index = activeGiftIndex) {
    setGifts(prev => prev.map((gift, i) => {
      if (i !== index) return gift
      if (gift.imagePreview) URL.revokeObjectURL(gift.imagePreview)
      return { ...gift, imageFile: null, imagePreview: null }
    }))
  }

  function capturePhoto() {
    const video = videoRef.current
    if (!video?.videoWidth || !video.videoHeight) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => {
      if (!blob) return
      const file = new File([blob], `gift-photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
      setGifts(prev => prev.map((gift, i) => {
        if (i !== activeGiftIndex) return gift
        if (gift.imagePreview) URL.revokeObjectURL(gift.imagePreview)
        return { ...gift, imageFile: file, imagePreview: URL.createObjectURL(file) }
      }))
      setShowCamera(false)
    }, 'image/jpeg', 0.9)
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
    if (!form.gifterName.trim()) errs.gifterName = U.errors.name
    if (!form.gifterEmail.trim()) errs.gifterEmail = U.errors.email || 'Gifter email is required'
    if (form.gifterEmail.trim() && !EMAIL_RE.test(form.gifterEmail.trim())) {
      errs.gifterEmail = U.errors.emailInvalid || 'Enter a valid email address'
    }
    const giftErrors = gifts.map((gift) => {
      const giftErr = {}
      if (!gift.title.trim()) giftErr.title = U.errors.title
      if (!gift.category) giftErr.category = U.errors.category
      if (!gift.condition) giftErr.condition = U.errors.condition
      return giftErr
    })
    if (giftErrors.some(giftErr => Object.keys(giftErr).length)) errs.gifts = giftErrors
    if (!form.whatsapp.trim()) errs.whatsapp = U.errors.whatsapp
    if (form.whatsapp.trim() && !isValidPhone(form.whatsapp.trim())) {
      errs.whatsapp = U.errors.whatsappInvalid || 'Enter a valid WhatsApp number'
    }
    if (form.phone.trim() && !isValidPhone(form.phone.trim())) {
      errs.phone = U.errors.phoneInvalid || 'Enter a valid phone number'
    }
    if (!form.address.trim()) errs.address = U.errors.address
    if (!form.locationName.trim()) errs.locationName = U.errors.location
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const itemIds = []
      for (const gift of gifts) {
        const itemId = await addItem({
          ...form,
          title: gift.title,
          description: gift.description,
          category: gift.category,
          condition: gift.condition,
          ...(coords || {}),
        }, gift.imageFile)
        itemIds.push(itemId)
      }
      setCreatedItemIds(itemIds)
      setDone(true)
    } catch {
      setErrors({ submit: U.errors.submit })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setDone(false)
    setCreatedItemIds([])
    setCopiedGiftedLink(false)
    setPhoneOverridden(false)
    setForm({ gifterName:'', title:'', description:'', category:'', condition:'', gifterEmail:'', phone:'', whatsapp:'', address:'', locationName:'' })
    gifts.forEach(gift => {
      if (gift.imagePreview) URL.revokeObjectURL(gift.imagePreview)
    })
    setGifts([newGift()])
    setActiveGiftIndex(0)
    setCoords(null)
  }

  const createdLinks = createdItemIds.map((id, index) => ({
    id,
    title: gifts[index]?.title || `Gift ${index + 1}`,
    markGiftedLink: `${window.location.origin}${window.location.pathname}#/mark-gifted/${id}`,
    itemLink: `${window.location.origin}${window.location.pathname}#/item/${id}`,
  }))
  const giftedLinkMessage = [
    'When a gift has been given, open its private link to mark it as gifted:',
    ...createdLinks.map(link => `${link.title}: ${link.markGiftedLink}`),
  ].join('\n')
  const giftedLinkEmailSubject = 'Your Gift a Smile private gifted link'
  const giftedLinkEmailBody = [
    `Hi ${form.gifterName || 'there'},`,
    '',
    `${createdLinks.length === 1 ? 'Your gift is' : 'Your gifts are'} now listed on Gift a Smile.`,
    '',
    'When a gift has been given, open its private link. It will mark that gift as gifted and return you to the gift page:',
    ...createdLinks.map(link => `${link.title}: ${link.markGiftedLink}`),
    '',
    ...createdLinks.map(link => `Gift page for ${link.title}: ${link.itemLink}`),
  ].join('\n')

  async function copyGiftedLink() {
    try {
      await navigator.clipboard.writeText(createdLinks.map(link => `${link.title}: ${link.markGiftedLink}`).join('\n'))
      setCopiedGiftedLink(true)
      setTimeout(() => setCopiedGiftedLink(false), 2000)
    } catch {
      setCopiedGiftedLink(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Gift size={36} className="text-teal-600" />
          </div>
          <CheckCircle2 size={48} className="text-teal-500 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-slate-800">{U.doneTitle}</h2>
          <p className="text-slate-500 mt-2 text-sm">
            {U.doneMsg} <strong>{form.locationName}</strong> {U.doneMsgEnd}
          </p>
          {createdLinks.length > 0 && (
            <div className="mt-6 text-left bg-teal-50 border border-teal-100 rounded-xl p-4">
              <p className="text-sm font-semibold text-teal-800">Private gifter links</p>
              <p className="text-xs text-teal-700 mt-1">
                Save these links. When an item is given, opening its link will mark that gift as gifted and return to the gift page.
              </p>
              <div className="mt-3 space-y-2">
                {createdLinks.map(link => (
                  <div key={link.id} className="bg-white border border-teal-100 rounded-lg p-2">
                    <p className="text-xs font-semibold text-slate-700">{link.title}</p>
                    <input
                      readOnly
                      value={link.markGiftedLink}
                      className="mt-1 w-full border border-teal-200 bg-white rounded-lg px-3 py-2 text-xs text-slate-600"
                    />
                    <a href={link.itemLink} className="block text-xs text-teal-700 underline mt-1">
                      Open gift page
                    </a>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-2 mt-3">
                <button
                  type="button"
                  onClick={copyGiftedLink}
                  className="flex items-center justify-center gap-2 border border-teal-200 bg-white text-teal-700 py-2 rounded-lg text-sm font-medium"
                >
                  <Copy size={15} />
                  {copiedGiftedLink ? 'Copied' : 'Copy link'}
                </button>
                <a
                  href={`mailto:${encodeURIComponent(form.gifterEmail)}?subject=${encodeURIComponent(giftedLinkEmailSubject)}&body=${encodeURIComponent(giftedLinkEmailBody)}`}
                  className="flex items-center justify-center gap-2 bg-slate-700 text-white py-2 rounded-lg text-sm font-medium"
                >
                  <Mail size={15} />
                  Send by email
                </a>
                <a
                  href={`https://wa.me/${form.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(giftedLinkMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#25D366] text-white py-2 rounded-lg text-sm font-medium"
                >
                  <Send size={15} />
                  Send to gifter
                </a>
              </div>
            </div>
          )}
          <div className="flex gap-3 mt-8">
            <button onClick={() => navigate('/')} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl font-medium hover:bg-slate-50">
              {U.browseBtn}
            </button>
            <button onClick={resetForm} className="flex-1 bg-teal-600 text-white py-2.5 rounded-xl font-medium">
              {U.anotherBtn}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-4 md:py-8 px-4">
      <div className="max-w-xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4 md:mb-6 text-sm">
          <ArrowLeft size={16} /> {U.back}
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

          {/* Inspirational banner */}
          <div className="relative h-44 md:h-52">
            <img
              src="https://images.unsplash.com/photo-1463335361701-e90f4c5045d0?w=900&q=80"
              alt="Happy woman smiling"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-teal-950/80 via-teal-900/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
              <p className="text-white font-bold text-lg md:text-xl leading-snug drop-shadow">
                Your gift will make someone smile 🎁
              </p>
              <p className="text-teal-100 text-xs md:text-sm mt-0.5">
                Give your unused items a second life — free &amp; local.
              </p>
            </div>
          </div>

          <div className="p-5 md:p-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">{U.title}</h1>
          <p className="text-slate-500 text-sm mb-6">{U.subtitle}</p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Gifter name */}
            <Field label={U.nameLabel} required error={errors.gifterName}>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={form.gifterName} onChange={e => handleChange('gifterName', e.target.value)}
                  placeholder={U.namePH}
                  className={`w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${errors.gifterName ? 'border-red-400' : 'border-slate-200'}`} />
              </div>
            </Field>

            {/* Gifter email */}
            <Field label={U.emailLabel || 'Gifter email'} required error={errors.gifterEmail}>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" value={form.gifterEmail} onChange={e => handleChange('gifterEmail', e.target.value)}
                  placeholder={U.emailPH || 'e.g. priya@example.com'}
                  className={`w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${errors.gifterEmail ? 'border-red-400' : 'border-slate-200'}`} />
              </div>
            </Field>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-slate-800">Gifts</h2>
                <button
                  type="button"
                  onClick={addGift}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2"
                >
                  <PlusCircle size={16} />
                  Add another gift
                </button>
              </div>

              {gifts.map((gift, index) => {
                const giftErrors = errors.gifts?.[index] || {}
                return (
                  <div key={index} className="border border-slate-200 rounded-xl p-4 space-y-4 bg-slate-50/60">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-700">Item {index + 1}</p>
                      {gifts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeGift(index)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {U.photoLabel} <span className="text-slate-400 font-normal">{U.photoHint}</span>
                      </label>
                      <div
                        onClick={() => openPhotoCapture(index)}
                        className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-colors ${gift.imagePreview ? 'border-emerald-300' : 'border-slate-200 hover:border-orange-400'} overflow-hidden bg-white`}
                      >
                        {gift.imagePreview ? (
                          <div className="relative">
                            <img src={gift.imagePreview} alt="preview" className="w-full h-52 object-cover" />
                            <button type="button" onClick={e => { e.stopPropagation(); clearImage(index) }}
                              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1">
                              <X size={14} />
                            </button>
                            <div className="absolute inset-x-0 bottom-0 bg-black/55 text-white text-xs font-medium text-center py-2">
                              Tap to retake photo
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
                            <Camera size={36} />
                            <span className="text-sm font-medium">{U.tapPhoto}</span>
                            <span className="text-xs">{U.photoFormats}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Field label={U.itemLabel} required error={giftErrors.title}>
                      <input type="text" value={gift.title} onChange={e => handleGiftChange(index, 'title', e.target.value)}
                        placeholder={U.itemPH}
                        className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${giftErrors.title ? 'border-red-400' : 'border-slate-200'}`} />
                    </Field>

                    <Field label={U.descLabel}>
                      <textarea value={gift.description} onChange={e => handleGiftChange(index, 'description', e.target.value)}
                        placeholder={U.descPH}
                        rows={3}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none" />
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label={U.catLabel} required error={giftErrors.category}>
                        <select value={gift.category} onChange={e => handleGiftChange(index, 'category', e.target.value)}
                          className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${giftErrors.category ? 'border-red-400' : 'border-slate-200'}`}>
                          <option value="">{U.catPH}</option>
                          {CATEGORIES.map(c => <option key={c} value={c}>{T.cats[c]}</option>)}
                        </select>
                      </Field>
                      <Field label={U.condLabel} required error={giftErrors.condition}>
                        <select value={gift.condition} onChange={e => handleGiftChange(index, 'condition', e.target.value)}
                          className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${giftErrors.condition ? 'border-red-400' : 'border-slate-200'}`}>
                          <option value="">{U.condPH}</option>
                          {CONDITIONS.map(c => <option key={c} value={c}>{U.conditions[c]}</option>)}
                        </select>
                      </Field>
                    </div>
                  </div>
                )
              })}
            </div>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleImage} className="hidden" />

            {/* Phone & WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={U.phoneLabel} error={errors.phone}>
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="tel" value={form.phone} onChange={e => handlePhoneChange(e.target.value)}
                    placeholder={U.phonePH}
                    className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                </div>
              </Field>
              <Field label={U.waLabel} required error={errors.whatsapp}>
                <div className="relative">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-slate-400 absolute left-3 top-1/2 -translate-y-1/2">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <input type="tel" value={form.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)}
                    placeholder={U.waPH}
                    className={`w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${errors.whatsapp ? 'border-red-400' : 'border-slate-200'}`} />
                </div>
                <p className="text-xs text-slate-400 mt-1">{U.waHint}</p>
              </Field>
            </div>

            {/* Address */}
            <Field label={U.addrLabel} required error={errors.address}>
              <div className="relative">
                <Home size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                <textarea value={form.address} onChange={e => handleChange('address', e.target.value)}
                  placeholder={U.addrPH}
                  rows={2}
                  className={`w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none ${errors.address ? 'border-red-400' : 'border-slate-200'}`} />
              </div>
            </Field>

            {/* Area / City */}
            <Field label={U.areaLabel} required error={errors.locationName}>
              <div className="flex gap-2">
                <input type="text" value={form.locationName} onChange={e => handleChange('locationName', e.target.value)}
                  placeholder={U.areaPH}
                  className={`flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${errors.locationName ? 'border-red-400' : 'border-slate-200'}`} />
                <button type="button" onClick={detectLocation} disabled={detecting}
                  className="flex items-center gap-1.5 text-sm text-teal-600 border border-teal-200 bg-teal-50 hover:bg-teal-50 px-3 py-2 rounded-xl whitespace-nowrap transition-colors">
                  {detecting ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
                  {U.detect}
                </button>
              </div>
            </Field>

            {errors.submit && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-200">{errors.submit}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3.5 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-colors">
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
              {loading ? U.uploading : U.submitBtn}
            </button>
          </form>
          </div>{/* end inner padding div */}
        </div>
      </div>

      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div>
                <h2 className="font-semibold text-slate-800">Take a photo</h2>
                <p className="text-xs text-slate-500">Use your camera or choose an existing image.</p>
              </div>
              <button type="button" onClick={() => setShowCamera(false)} className="text-slate-500 hover:text-slate-700 rounded-full p-1">
                <X size={20} />
              </button>
            </div>

            <div className="bg-slate-950 aspect-[4/3] flex items-center justify-center">
              {cameraError ? (
                <p className="text-white text-sm text-center px-6">{cameraError}</p>
              ) : (
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay />
              )}
            </div>

            <div className="p-4 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={capturePhoto}
                disabled={Boolean(cameraError)}
                className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                <Camera size={18} />
                Capture photo
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex-1 border border-slate-200 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-50"
              >
                Choose photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

