import { Routes, Route } from 'react-router-dom'
import ChatPage from './pages/ChatPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<ChatPage />} />
      <Route path="/chat" element={<ChatPage />} />
    </Routes>
  )
}

export default App
