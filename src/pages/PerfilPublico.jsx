import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

export default function PerfilPublico() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [anuncios, setAnuncios] = useState([])
  const [valoraciones, setValoraciones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargarPerfil() {
      const { data: usuarioData } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', id)
        .single()

      const { data: anunciosData } = await supabase
        .from('anuncios')
        .select(`*, productos (nombre, marca, modelo)`)
        .eq('vendedor_id', id)
        .eq('estado', 'ACTIVO')
        .order('created_at', { ascending: false })

      const { data: valoracionesData } = await supabase
        .from('valoraciones')
        .select(`*, usuarios!valoraciones_comprador_id_fkey (nombre, avatar_url)`)
        .eq('vendedor_id', id)
        .order('created_at', { ascending: false })

      setUsuario(usuarioData)
      setAnuncios(anunciosData || [])
      setValoraciones(valoracionesData || [])
      setLoading(false)
    }
    cargarPerfil()
  }, [id])

  const mediaEstrellas = valoraciones.length > 0
    ? (valoraciones.reduce((sum, v) => sum + v.puntuacion, 0) / valoraciones.length).toFixed(1)
    : null

  function Estrellas({ puntuacion, size = 'sm' }) {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <span key={i} className={size === 'sm' ? 'text-base' : 'text-2xl'}>
            {i <= puntuacion ? '★' : '☆'}
          </span>
        ))}
      </div>
    )
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  if (!usuario) return <div className="min-h-screen flex items-center justify-center">Usuario no encontrado</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="py-10 px-4">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">

          <div className="bg-white rounded-xl shadow-md p-8 flex items-center gap-6">
            {usuario.avatar_url ? (
              <img src={usuario.avatar_url} alt={usuario.nombre}
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-4xl">👤</span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{usuario.nombre}</h1>
              <p className="text-gray-500 text-sm">Miembro desde {new Date(usuario.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
              {mediaEstrellas && (
                <div className="flex items-center gap-2 mt-2">
                  <Estrellas puntuacion={Math.round(mediaEstrellas)} />
                  <span className="text-sm text-gray-600">{mediaEstrellas} ({valoraciones.length} valoracion{valoraciones.length !== 1 ? 'es' : ''})</span>
                </div>
              )}
              {!mediaEstrellas && <p className="text-sm text-gray-400 mt-2">Sin valoraciones todavía</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Anuncios activos ({anuncios.length})</h2>
            {anuncios.length === 0 ? (
              <p className="text-gray-500">No tiene anuncios activos</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {anuncios.map(anuncio => (
                  <div key={anuncio.id} className="border rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer"
                    onClick={() => navigate(`/anuncio/${anuncio.id}`)}>
                    {anuncio.imagen_url ? (
                      <img src={anuncio.imagen_url} alt={anuncio.productos?.nombre}
                        className="w-full h-36 object-contain bg-gray-50" />
                    ) : (
                      <div className="w-full h-36 bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">Sin imagen</span>
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-xs text-gray-500">{anuncio.productos?.marca}</p>
                      <p className="font-semibold text-sm">{anuncio.productos?.nombre}</p>
                      <p className="text-sm font-bold mt-1">{anuncio.precio} €</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Valoraciones ({valoraciones.length})</h2>
            {valoraciones.length === 0 ? (
              <p className="text-gray-500">Sin valoraciones todavía</p>
            ) : (
              <div className="flex flex-col gap-4">
                {valoraciones.map(v => (
                  <div key={v.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                      {v.usuarios?.avatar_url ? (
                        <img src={v.usuarios.avatar_url} alt={v.usuarios.nombre}
                          className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm">👤</span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold">{v.usuarios?.nombre}</p>
                        <Estrellas puntuacion={v.puntuacion} />
                      </div>
                      <p className="text-xs text-gray-400 ml-auto">
                        {new Date(v.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    {v.comentario && <p className="text-sm text-gray-600 ml-11">{v.comentario}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}