import { useState, useEffect } from 'react'
import {
  collection, addDoc, doc, updateDoc, query,
  orderBy, onSnapshot, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

// Replace with your Cloudinary cloud name and upload preset
const CLOUDINARY_CLOUD_NAME = 'dpllz6vbv'
const CLOUDINARY_UPLOAD_PRESET = 'igiftyou_unsigned'

async function uploadImageToCloudinary(file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Image upload failed')
  return data.secure_url
}

export function useItems() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  async function addItem(data, imageFile) {
    let imageUrl = null
    if (imageFile) {
      imageUrl = await uploadImageToCloudinary(imageFile)
    }
    const docRef = await addDoc(collection(db, 'items'), {
      ...data,
      imageUrl,
      status: 'available',
      createdAt: serverTimestamp(),
    })
    return docRef.id
  }

  async function markAsGifted(itemId) {
    await updateDoc(doc(db, 'items', itemId), {
      status: 'gifted',
      giftedAt: serverTimestamp(),
    })
  }

  return { items, loading, addItem, markAsGifted }
}

export async function subscribeEmail(email, location) {
  await addDoc(collection(db, 'subscribers'), {
    email,
    location: location || null,
    createdAt: serverTimestamp(),
  })
}
