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
    <nav className="bg-black px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <span
        onClick={() => navigate('/catalogo')}
        className="text-xl font-bold cursor-pointer text-white hover:opacity-70 transition tracking-widest"
      >
        BERISHOP
      </span>

      <div className="flex items-center gap-5">
        <button onClick={() => navigate('/catalogo')} className="text-sm text-gray-300 hover:text-white transition">
          Catálogo
        </button>
        <button onClick={() => navigate('/mis-pedidos')} className="text-sm text-gray-300 hover:text-white transition">
          Mis pedidos
        </button>
        <button onClick={() => navigate('/panel-vendedor')} className="text-sm text-gray-300 hover:text-white transition">
          Mis anuncios
        </button>
        <button onClick={() => navigate('/vendedores')} className="text-sm text-gray-300 hover:text-white transition">
          Vendedores
        </button>
        {perfil?.rol === 'ADMIN' && (
          <button onClick={() => navigate('/panel-admin')} className="text-sm text-gray-300 hover:text-white transition">
            Admin
          </button>
        )}
        <button
          onClick={() => navigate('/crear-anuncio')}
          className="text-sm border border-white text-white px-4 py-2 rounded-lg hover:bg-white hover:text-black transition font-semibold"
        >
          + Publicar
        </button>
        <button
          onClick={() => navigate('/perfil')}
          className="flex items-center gap-2 hover:opacity-80 transition"
        >
          {perfil?.avatar_url ? (
            <img src={perfil.avatar_url} alt="perfil" className="w-8 h-8 rounded-full object-cover border-2 border-gray-600" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-sm">👤</span>
            </div>
          )}
        </button>
        <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white transition">
          Salir
        </button>
      </div>
    </nav>
  )
}