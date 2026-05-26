import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Gift, Bell, Menu, X, PlusCircle } from 'lucide-react'
import SubscribeModal from './SubscribeModal'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showSubscribe, setShowSubscribe] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <nav className="bg-white border-b border-orange-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="bg-orange-100 p-1.5 rounded-lg">
              <Gift size={22} className="text-orange-500" />
            </div>
            <span className="text-orange-500">I Gift</span>
            <span className="text-green-700">You</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-slate-600 hover:text-orange-500 font-medium transition-colors">
              Browse Gifts
            </Link>
            <button
              onClick={() => setShowSubscribe(true)}
              className="flex items-center gap-1.5 text-slate-600 hover:text-orange-500 font-medium transition-colors"
            >
              <Bell size={16} />
              Get Notified
            </button>
            <button
              onClick={() => navigate('/upload')}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <PlusCircle size={16} />
              Gift an Item
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden text-slate-600" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-orange-50 px-4 py-4 flex flex-col gap-4">
            <Link to="/" className="text-slate-600 font-medium" onClick={() => setMenuOpen(false)}>
              Browse Gifts
            </Link>
            <button
              onClick={() => { setShowSubscribe(true); setMenuOpen(false) }}
              className="text-left text-slate-600 font-medium flex items-center gap-2"
            >
              <Bell size={16} /> Get Notified
            </button>
            <button
              onClick={() => { navigate('/upload'); setMenuOpen(false) }}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 w-full justify-center"
            >
              <PlusCircle size={16} /> Gift an Item
            </button>
          </div>
        )}
      </nav>

      {showSubscribe && <SubscribeModal onClose={() => setShowSubscribe(false)} />}
    </>
  )
}
