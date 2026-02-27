import { Routes, Route } from 'react-router-dom'
import ChatPage from './pages/ChatPage'
import FaqListPage from './pages/FaqListPage'
import FaqAddPage from './pages/FaqAddPage'
import FaqEditPage from './pages/FaqEditPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<ChatPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/faq-admin" element={<FaqListPage />} />
      <Route path="/faq-admin/add" element={<FaqAddPage />} />
      <Route path="/faq-admin/edit/:id" element={<FaqEditPage />} />
    </Routes>
  )
}

export default App
