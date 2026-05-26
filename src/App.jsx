import { HashRouter as BrowserRouter, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import UploadItem from './pages/UploadItem'
import ItemDetail from './pages/ItemDetail'
import MarkGifted from './pages/MarkGifted'

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<UploadItem />} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/mark-gifted/:id" element={<MarkGifted />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  )
}
