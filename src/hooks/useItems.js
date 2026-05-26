import { useState, useEffect } from 'react'
import {
  collection, addDoc, getDocs, doc, updateDoc, query,
  orderBy, onSnapshot, serverTimestamp, where
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase'

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

  async function uploadImage(file) {
    const ext = file.name.split('.').pop()
    const path = `items/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, file)
    return getDownloadURL(storageRef)
  }

  async function addItem(data, imageFile) {
    let imageUrl = null
    if (imageFile) {
      imageUrl = await uploadImage(imageFile)
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
