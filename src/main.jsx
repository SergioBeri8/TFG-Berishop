import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Home from './pages/Home'
import CrearAnuncio from './pages/CrearAnuncio'
import Catalogo from './pages/Catalogo'
import DetalleAnuncio from './pages/DetalleAnuncio'
import MisPedidos from './pages/MisPedidos'
import PanelVendedor from './pages/PanelVendedor'
import PanelAdmin from './pages/PanelAdmin'
import ResetPassword from './pages/ResetPassword'
import Perfil from './pages/Perfil'
import './index.css'

function RutaProtegida({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<RutaProtegida><Home /></RutaProtegida>} />
          <Route path="/catalogo" element={<RutaProtegida><Catalogo /></RutaProtegida>} />
          <Route path="/crear-anuncio" element={<RutaProtegida><CrearAnuncio /></RutaProtegida>} />
          <Route path="/anuncio/:id" element={<RutaProtegida><DetalleAnuncio /></RutaProtegida>} />
          <Route path="/mis-pedidos" element={<RutaProtegida><MisPedidos /></RutaProtegida>} />
          <Route path="/panel-vendedor" element={<RutaProtegida><PanelVendedor /></RutaProtegida>} />
          <Route path="/panel-admin" element={<RutaProtegida><PanelAdmin /></RutaProtegida>} />
          <Route path="/perfil" element={<RutaProtegida><Perfil /></RutaProtegida>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)