import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { enviarEmailPedido } from '../utils/email'

export default function DetalleAnuncio() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [anuncio, setAnuncio] = useState(null)
  const [imagenes, setImagenes] = useState([])
  const [imagenActual, setImagenActual] = useState(0)
  const [vendedor, setVendedor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [comprando, setComprando] = useState(false)
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(false)

  useEffect(() => {
    async function cargarAnuncio() {
      const { data, error } = await supabase
        .from('anuncios')
        .select(`*, productos (nombre, marca, modelo, referencia, descripcion)`)
        .eq('id', id)
        .single()

      if (!error) setAnuncio(data)

      const { data: imgs } = await supabase
        .from('imagenes_anuncio')
        .select('*')
        .eq('anuncio_id', id)
        .order('orden')

      if (imgs && imgs.length > 0) {
        setImagenes(imgs)
      } else if (data?.imagen_url) {
        setImagenes([{ url: data.imagen_url }])
      }

      if (data?.vendedor_id) {
        const { data: vendedorData } = await supabase
          .from('usuarios')
          .select('id, nombre, avatar_url')
          .eq('id', data.vendedor_id)
          .single()
        setVendedor(vendedorData)
      }

      setLoading(false)
    }
    cargarAnuncio()
  }, [id])

  async function handleComprar() {
    setComprando(true)
    setError(null)

    const { error: errorPedido } = await supabase
      .from('pedidos')
      .insert({
        comprador_id: user.id,
        anuncio_id: anuncio.id,
        precio_final: anuncio.precio,
        estado: 'PENDIENTE'
      })

    if (errorPedido) {
      setError('Error al realizar el pedido. Inténtalo de nuevo.')
      setComprando(false)
      return
    }

    await supabase.from('anuncios').update({ estado: 'RESERVADO' }).eq('id', anuncio.id)

    const { data: vendedorData } = await supabase
      .from('usuarios')
      .select('email')
      .eq('id', anuncio.vendedor_id)
      .single()

    await enviarEmailPedido({
      emailComprador: user.email,
      emailVendedor: vendedorData?.email,
      producto: `${anuncio.productos?.marca} ${anuncio.productos?.nombre}`,
      precio: anuncio.precio,
      talla: anuncio.talla
    })

    setExito(true)
    setComprando(false)
    setTimeout(() => navigate('/catalogo'), 3000)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
  if (!anuncio) return <div className="min-h-screen flex items-center justify-center">Anuncio no encontrado</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto py-10 px-4">
        <button onClick={() => navigate('/catalogo')}
          className="text-sm text-gray-500 hover:text-black mb-8 inline-flex items-center gap-2 transition">
          ← Volver al catálogo
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Columna izquierda - imágenes */}
          <div>
            {imagenes.length > 0 ? (
              <div>
                <div className="bg-white rounded-2xl overflow-hidden mb-3 shadow-sm">
                  <img src={imagenes[imagenActual].url} alt={anuncio.productos?.nombre}
                    className="w-full h-96 object-contain p-6" />
                </div>
                {imagenes.length > 1 && (
                  <div className="flex gap-2">
                    {imagenes.map((img, i) => (
                      <img key={i} src={img.url} alt={`foto ${i}`}
                        onClick={() => setImagenActual(i)}
                        className={`w-20 h-20 object-contain rounded-xl cursor-pointer bg-white p-2 border-2 transition ${imagenActual === i ? 'border-black' : 'border-transparent'}`} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-96 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <span className="text-gray-400">Sin imagen</span>
              </div>
            )}
          </div>

          {/* Columna derecha - info */}
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">{anuncio.productos?.marca}</p>
              <h1 className="text-4xl font-bold mb-1">{anuncio.productos?.nombre}</h1>
              <p className="text-gray-500 mb-6">{anuncio.productos?.modelo}</p>

              <div className="flex gap-3 mb-6 flex-wrap">
                <span className="bg-gray-100 px-4 py-2 rounded-full text-sm font-medium">Talla {anuncio.talla}</span>
                <span className="bg-gray-100 px-4 py-2 rounded-full text-sm font-medium">{anuncio.estado_conservacion.replace(/_/g, ' ')}</span>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${anuncio.estado === 'ACTIVO' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {anuncio.estado}
                </span>
              </div>

              {anuncio.productos?.referencia && (
                <p className="text-sm text-gray-400 mb-4">Ref: {anuncio.productos.referencia}</p>
              )}

              {anuncio.productos?.descripcion && (
                <p className="text-gray-600 mb-6 leading-relaxed">{anuncio.productos.descripcion}</p>
              )}

              {vendedor && (
                <div
                  onClick={() => navigate(`/usuario/${vendedor.id}`)}
                  className="flex items-center gap-3 mb-6 cursor-pointer hover:opacity-80 transition bg-white rounded-xl p-4 shadow-sm"
                >
                  {vendedor.avatar_url ? (
                    <img src={vendedor.avatar_url} alt={vendedor.nombre}
                      className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span>👤</span>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-400">Vendido por</p>
                    <p className="font-semibold">{vendedor.nombre}</p>
                  </div>
                  <span className="ml-auto text-gray-400 text-sm">Ver perfil →</span>
                </div>
              )}
            </div>

            <div>
              <p className="text-5xl font-bold mb-6">{anuncio.precio} €</p>

              {exito ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                  <p className="text-green-700 font-bold text-lg">¡Pedido realizado!</p>
                  <p className="text-green-600 text-sm mt-1">Tu pedido está pendiente de verificación.</p>
                  <button onClick={() => navigate('/mis-pedidos')}
                    className="mt-4 bg-black text-white rounded-xl px-6 py-3 font-semibold hover:bg-gray-800 transition">
                    Ver mis pedidos
                  </button>
                </div>
              ) : (
                <>
                  {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-xl">{error}</p>}
                  {anuncio.vendedor_id === user.id ? (
                    <div className="bg-gray-100 rounded-2xl p-4 text-center text-gray-500 font-semibold">
                      Este es tu anuncio
                    </div>
                  ) : anuncio.estado === 'ACTIVO' ? (
                    <button onClick={handleComprar} disabled={comprando}
                      className="w-full bg-black text-white rounded-2xl py-4 font-bold text-lg hover:bg-gray-900 transition disabled:opacity-50 tracking-wide">
                      {comprando ? 'Procesando...' : 'Comprar ahora'}
                    </button>
                  ) : (
                    <div className="bg-gray-100 rounded-2xl p-4 text-center text-gray-500 font-semibold">
                      Este artículo ya no está disponible
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}