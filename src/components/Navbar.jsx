import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Gift, Bell, Menu, X, PlusCircle, Globe, Search } from 'lucide-react'
import SubscribeModal from './SubscribeModal'
import { useLanguage } from '../context/LanguageContext'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showSubscribe, setShowSubscribe] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { T, lang, setLang, LANGUAGES } = useLanguage()

  function switchLang(code) {
    setLang(code)
    setShowLangMenu(false)
    setMenuOpen(false)
  }

  return (
    <>
      <nav className="bg-white border-b border-teal-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="bg-teal-50 p-1.5 rounded-lg">
              <Gift size={22} className="text-teal-600" />
            </div>
            <span className="text-teal-600">Gift a</span>
            <span className="text-teal-700">Smile</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">
              {T.nav.browse}
            </Link>
            <button
              onClick={() => setShowSubscribe(true)}
              className="flex items-center gap-1.5 text-slate-600 hover:text-teal-600 font-medium transition-colors"
            >
              <Bell size={16} />
              {T.nav.notify}
            </button>

            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 text-slate-600 hover:text-teal-600 font-medium transition-colors px-2 py-1 rounded-lg hover:bg-teal-50"
              >
                <Globe size={16} />
                <span className="text-sm">{LANGUAGES.find(l => l.code === lang)?.label}</span>
              </button>
              {showLangMenu && (
                <div className="absolute right-0 top-10 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 min-w-[140px]">
                  {LANGUAGES.map(l => (
                    <button
                      key={l.code}
                      onClick={() => switchLang(l.code)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-teal-50 transition-colors ${lang === l.code ? 'text-teal-600 font-semibold bg-teal-50' : 'text-slate-700'}`}
                      dir={l.rtl ? 'rtl' : 'ltr'}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/upload')}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <PlusCircle size={16} />
              {T.nav.gift}
            </button>
          </div>

          {/* Mobile right side */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile language pill */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1.5 rounded-lg"
              >
                <Globe size={13} />
                {LANGUAGES.find(l => l.code === lang)?.label}
              </button>
              {showLangMenu && (
                <div className="absolute right-0 top-9 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 min-w-[130px]">
                  {LANGUAGES.map(l => (
                    <button
                      key={l.code}
                      onClick={() => switchLang(l.code)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-teal-50 transition-colors ${lang === l.code ? 'text-teal-600 font-semibold' : 'text-slate-700'}`}
                      dir={l.rtl ? 'rtl' : 'ltr'}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="text-slate-600" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-teal-50 px-4 py-4 flex flex-col gap-4">
            <Link to="/" className="text-slate-600 font-medium" onClick={() => setMenuOpen(false)}>
              {T.nav.browse}
            </Link>
            <button
              onClick={() => { setShowSubscribe(true); setMenuOpen(false) }}
              className="text-left text-slate-600 font-medium flex items-center gap-2"
            >
              <Bell size={16} /> {T.nav.notify}
            </button>
            <button
              onClick={() => { navigate('/upload'); setMenuOpen(false) }}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 w-full justify-center"
            >
              <PlusCircle size={16} /> {T.nav.gift}
            </button>
          </div>
        )}
      </nav>

      {showSubscribe && <SubscribeModal onClose={() => setShowSubscribe(false)} />}

      {/* Mobile bottom navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-slate-200 shadow-lg safe-area-bottom">
        <div className="flex items-stretch h-16 px-2">
          {/* Browse */}
          <Link
            to="/"
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${
              location.pathname === '/' ? 'text-teal-600' : 'text-slate-500'
            }`}
          >
            <Search size={20} strokeWidth={location.pathname === '/' ? 2.5 : 1.8} />
            {T.nav.browse}
          </Link>

          {/* Gift an Item — centre pill */}
          <div className="flex items-center justify-center px-2">
            <button
              onClick={() => navigate('/upload')}
              className="flex items-center gap-1.5 bg-teal-600 active:bg-teal-700 text-white px-5 py-2.5 rounded-2xl font-semibold text-sm shadow-md"
            >
              <PlusCircle size={17} />
              {T.nav.gift}
            </button>
          </div>

          {/* Notify */}
          <button
            onClick={() => setShowSubscribe(true)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium text-slate-500"
          >
            <Bell size={20} strokeWidth={1.8} />
            {T.nav.notify}
          </button>
        </div>
      </div>
    </>
  )
}
