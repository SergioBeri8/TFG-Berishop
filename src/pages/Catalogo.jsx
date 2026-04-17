import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

export default function Catalogo() {
  const [anuncios, setAnuncios] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function cargarAnuncios() {
      const { data, error } = await supabase
        .from('anuncios')
        .select(`
          *,
          productos (nombre, marca, modelo)
        `)
        .eq('estado', 'ACTIVO')
        .order('created_at', { ascending: false })

      if (!error) setAnuncios(data)
      setLoading(false)
    }
    cargarAnuncios()
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Catálogo</h1>
          <button
            onClick={() => navigate('/crear-anuncio')}
            className="bg-black text-white rounded-lg px-6 py-3 font-semibold hover:bg-gray-800 transition"
          >
            + Publicar anuncio
          </button>
        </div>

        {anuncios.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-xl">No hay anuncios todavía</p>
            <p className="mt-2">¡Sé el primero en publicar!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {anuncios.map(anuncio => (
              <div key={anuncio.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm text-gray-500">{anuncio.productos?.marca}</p>
                    <h2 className="text-lg font-bold">{anuncio.productos?.nombre}</h2>
                    <p className="text-sm text-gray-500">{anuncio.productos?.modelo}</p>
                  </div>
                  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                    Talla {anuncio.talla}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-2xl font-bold">{anuncio.precio} €</span>
                  <span className="text-xs text-gray-500">{anuncio.estado_conservacion.replace('_', ' ')}</span>
                </div>
                <button
                  onClick={() => navigate(`/anuncio/${anuncio.id}`)}
                  className="mt-4 w-full bg-black text-white rounded-lg py-2 font-semibold hover:bg-gray-800 transition"
                >
                  Ver detalle
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}