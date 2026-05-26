import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

export default function MarkGifted() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function markGiftedAndRedirect() {
      try {
        await updateDoc(doc(db, 'items', id), {
          status: 'gifted',
          giftedAt: serverTimestamp(),
        })
        if (!cancelled) navigate(`/item/${id}`, { replace: true })
      } catch {
        if (!cancelled) setError('Could not mark this gift as gifted. Please check the link and try again.')
      }
    }

    markGiftedAndRedirect()

    return () => {
      cancelled = true
    }
  }, [id, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-8 max-w-md w-full text-center">
        {error ? (
          <>
            <h1 className="text-xl font-bold text-slate-800">Something went wrong</h1>
            <p className="text-sm text-slate-500 mt-2">{error}</p>
            <button
              onClick={() => navigate(`/item/${id}`)}
              className="mt-6 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium"
            >
              Back to gift
            </button>
          </>
        ) : (
          <>
            <CheckCircle2 size={44} className="text-teal-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-800">Marking gift as gifted</h1>
            <p className="text-sm text-slate-500 mt-2">Please wait. You will be taken back to the gift page.</p>
            <Loader2 size={26} className="animate-spin text-teal-600 mx-auto mt-5" />
          </>
        )}
      </div>
    </div>
  )
}
