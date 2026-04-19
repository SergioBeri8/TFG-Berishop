import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function PanelVendedor() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [anuncios, setAnuncios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargarAnuncios() {
      const { data, error } = await supabase
        .from('anuncios')
        .select(`*, productos (nombre, marca, modelo)`)
        .eq('vendedor_id', user.id)
        .order('created_at', { ascending: false })

      if (!error) setAnuncios(data)
      setLoading(false)
    }
    cargarAnuncios()
  }, [user.id])

  async function handleDesactivar(id) {
    await supabase.from('anuncios').update({ estado: 'VENDIDO' }).eq('id', id)
    setAnuncios(anuncios.map(a => a.id === id ? { ...a, estado: 'VENDIDO' } : a))
  }

  const estadoColor = {
    ACTIVO: 'bg-green-100 text-green-700',
    RESERVADO: 'bg-yellow-100 text-yellow-700',
    VENDIDO: 'bg-gray-100 text-gray-500'
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Panel del vendedor</h1>
            <button onClick={() => navigate('/crear-anuncio')}
              className="bg-black text-white rounded-lg px-6 py-3 font-semibold hover:bg-gray-800 transition">
              + Publicar anuncio
            </button>
          </div>

          {anuncios.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <p className="text-xl">No tienes anuncios publicados</p>
              <button onClick={() => navigate('/crear-anuncio')}
                className="mt-4 bg-black text-white rounded-lg px-6 py-3 font-semibold hover:bg-gray-800 transition">
                Publicar primer anuncio
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {anuncios.map(anuncio => (
                <div key={anuncio.id} className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">{anuncio.productos?.marca}</p>
                    <h2 className="text-lg font-bold">{anuncio.productos?.nombre}</h2>
                    <p className="text-sm text-gray-500">{anuncio.productos?.modelo} — Talla {anuncio.talla}</p>
                    <p className="text-sm text-gray-400 mt-1">{anuncio.estado_conservacion.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <p className="text-2xl font-bold">{anuncio.precio} €</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${estadoColor[anuncio.estado]}`}>
                      {anuncio.estado}
                    </span>
                    {anuncio.estado === 'ACTIVO' && (
                      <button onClick={() => handleDesactivar(anuncio.id)}
                        className="text-xs text-red-500 hover:text-red-700 transition">
                        Desactivar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}