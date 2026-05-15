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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
  if (!usuario) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500">Usuario no encontrado</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto py-10 px-4 flex flex-col gap-6">

        {/* Header perfil */}
        <div className="bg-white rounded-2xl shadow-sm p-8 flex items-center gap-6">
          {usuario.avatar_url ? (
            <img src={usuario.avatar_url} alt={usuario.nombre}
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-100" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-4xl">👤</span>
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{usuario.nombre}</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Miembro desde {new Date(usuario.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </p>
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              {mediaEstrellas ? (
                <div className="flex items-center gap-2">
                  <Estrellas puntuacion={Math.round(mediaEstrellas)} />
                  <span className="text-sm font-semibold">{mediaEstrellas}</span>
                  <span className="text-sm text-gray-400">({valoraciones.length} valoracion{valoraciones.length !== 1 ? 'es' : ''})</span>
                </div>
              ) : (
                <span className="text-sm text-gray-400">Sin valoraciones todavía</span>
              )}
              <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
                {anuncios.length} anuncio{anuncios.length !== 1 ? 's' : ''} activo{anuncios.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Anuncios activos */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-5">Anuncios activos</h2>
          {anuncios.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">👟</p>
              <p className="text-gray-500 text-sm">No tiene anuncios activos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {anuncios.map(anuncio => (
                <div key={anuncio.id}
                  onClick={() => navigate(`/anuncio/${anuncio.id}`)}
                  className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                  {anuncio.imagen_url ? (
                    <img src={anuncio.imagen_url} alt={anuncio.productos?.nombre}
                      className="w-full h-36 object-contain bg-white p-3" />
                  ) : (
                    <div className="w-full h-36 bg-white flex items-center justify-center">
                      <span className="text-gray-300 text-sm">Sin imagen</span>
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{anuncio.productos?.marca}</p>
                    <p className="font-semibold text-sm mt-0.5">{anuncio.productos?.nombre}</p>
                    <p className="text-base font-bold mt-1">{anuncio.precio} €</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Valoraciones */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-5">Valoraciones ({valoraciones.length})</h2>
          {valoraciones.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">⭐</p>
              <p className="text-gray-500 text-sm">Sin valoraciones todavía</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {valoraciones.map(v => (
                <div key={v.id} className="py-4 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3 mb-2">
                    {v.usuarios?.avatar_url ? (
                      <img src={v.usuarios.avatar_url} alt={v.usuarios.nombre}
                        className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-sm">👤</span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold">{v.usuarios?.nombre}</p>
                      <Estrellas puntuacion={v.puntuacion} />
                    </div>
                    <p className="text-xs text-gray-400 ml-auto">
                      {new Date(v.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  {v.comentario && (
                    <p className="text-sm text-gray-600 ml-12 leading-relaxed">{v.comentario}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}