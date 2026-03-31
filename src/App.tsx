import { Routes, Route } from "react-router-dom"
import ProtectedRoute from "@/components/ProtectedRoute"
import AdminLoginPage from "@/pages/AdminLoginPage"
import ChatPage from "@/pages/ChatPage"
import FaqListPage from "@/pages/FaqListPage"
import FaqAddPage from "@/pages/FaqAddPage"
import FaqEditPage from "@/pages/FaqEditPage"
import GymAdminPage from "@/pages/GymAdminPage"
import GymAddPage from "@/pages/GymAddPage"
import GymEditPage from "@/pages/GymEditPage"

function App() {
  return (
    <Routes>
      <Route path="/" element={<ChatPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/admin/faq" element={<FaqListPage />} />
        <Route path="/admin/faq/add" element={<FaqAddPage />} />
        <Route path="/admin/faq/edit/:id" element={<FaqEditPage />} />
        <Route path="/admin/gym" element={<GymAdminPage />} />
        <Route path="/admin/gym/add" element={<GymAddPage />} />
        <Route path="/admin/gym/edit/:id" element={<GymEditPage />} />
      </Route>
    </Routes>
  )
}

export default App
