import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'

export default function Navbar() {
  const { user, perfil } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <span
        onClick={() => navigate('/catalogo')}
        className="text-xl font-bold cursor-pointer hover:opacity-70 transition"
      >
        BERISHOP
      </span>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/catalogo')}
          className="text-sm text-gray-600 hover:text-black transition"
        >
          Catálogo
        </button>
        <button
          onClick={() => navigate('/mis-pedidos')}
          className="text-sm text-gray-600 hover:text-black transition"
        >
          Mis pedidos
        </button>
        {perfil?.rol === 'VENDEDOR' || perfil?.rol === 'ADMIN' ? (
          <button
            onClick={() => navigate('/panel-vendedor')}
            className="text-sm text-gray-600 hover:text-black transition"
          >
            Mis anuncios
          </button>
        ) : null}
        {perfil?.rol === 'ADMIN' && (
          <button
            onClick={() => navigate('/panel-admin')}
            className="text-sm text-gray-600 hover:text-black transition"
          >
            Admin
          </button>
        )}
        <button
          onClick={() => navigate('/crear-anuncio')}
          className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          + Publicar
        </button>
        <span className="text-sm text-gray-400">{user?.email}</span>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-black transition"
        >
          Salir
        </button>
      </div>
    </nav>
  )
}