import { useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function BuscadorUsuarios() {
  const [busqueda, setBusqueda] = useState('')
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [buscado, setBuscado] = useState(false)
  const navigate = useNavigate()

  async function handleBuscar(e) {
    e.preventDefault()
    if (!busqueda.trim()) return
    setLoading(true)

    const { data } = await supabase
      .from('usuarios')
      .select('id, nombre, avatar_url, created_at')
      .ilike('nombre', `%${busqueda}%`)
      .limit(20)

    setUsuarios(data || [])
    setBuscado(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto py-10 px-4">

        <h1 className="text-3xl font-bold mb-2">Buscar vendedores</h1>
        <p className="text-gray-500 mb-8">Encuentra vendedores por su nombre</p>

        <form onSubmit={handleBuscar} className="flex gap-3 mb-8">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 flex-1 focus:outline-none focus:ring-2 focus:ring-black bg-white"
          />
          <button type="submit" disabled={loading}
            className="bg-black text-white rounded-xl px-6 py-3 font-semibold hover:bg-gray-900 transition disabled:opacity-50">
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {buscado && usuarios.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-500 font-medium">No se encontraron usuarios con ese nombre</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {usuarios.map(usuario => (
            <div
              key={usuario.id}
              onClick={() => navigate(`/usuario/${usuario.id}`)}
              className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              {usuario.avatar_url ? (
                <img src={usuario.avatar_url} alt={usuario.nombre}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-100" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-xl">👤</span>
                </div>
              )}
              <div>
                <p className="font-bold">{usuario.nombre}</p>
                <p className="text-sm text-gray-400">
                  Miembro desde {new Date(usuario.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <span className="ml-auto text-gray-400 text-sm font-medium">Ver perfil →</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}