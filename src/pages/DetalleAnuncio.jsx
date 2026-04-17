import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'

export default function DetalleAnuncio() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [anuncio, setAnuncio] = useState(null)
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

    await supabase
      .from('anuncios')
      .update({ estado: 'RESERVADO' })
      .eq('id', anuncio.id)

    setExito(true)
    setComprando(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  if (!anuncio) return <div className="min-h-screen flex items-center justify-center">Anuncio no encontrado</div>

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md p-8">
        <button onClick={() => navigate('/catalogo')}
          className="text-sm text-gray-500 hover:text-black mb-6 inline-block">
          ← Volver al catálogo
        </button>

        <p className="text-sm text-gray-500">{anuncio.productos?.marca}</p>
        <h1 className="text-3xl font-bold mb-1">{anuncio.productos?.nombre}</h1>
        <p className="text-gray-500 mb-4">{anuncio.productos?.modelo}</p>

        {anuncio.productos?.referencia && (
          <p className="text-sm text-gray-400 mb-4">Ref: {anuncio.productos.referencia}</p>
        )}

        {anuncio.productos?.descripcion && (
          <p className="text-gray-600 mb-4">{anuncio.productos.descripcion}</p>
        )}

        <div className="flex gap-4 mb-6">
          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Talla {anuncio.talla}</span>
          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">{anuncio.estado_conservacion.replace(/_/g, ' ')}</span>
          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">{anuncio.estado}</span>
        </div>

        <p className="text-4xl font-bold mb-8">{anuncio.precio} €</p>

        {exito ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-green-700 font-semibold">¡Pedido realizado con éxito!</p>
            <p className="text-green-600 text-sm mt-1">Tu pedido está pendiente de verificación.</p>
            <button onClick={() => navigate('/mis-pedidos')}
              className="mt-4 bg-black text-white rounded-lg px-6 py-2 font-semibold hover:bg-gray-800 transition">
              Ver mis pedidos
            </button>
          </div>
        ) : (
          <>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {anuncio.estado === 'ACTIVO' ? (
              <button onClick={handleComprar} disabled={comprando}
                className="w-full bg-black text-white rounded-lg py-3 font-semibold hover:bg-gray-800 transition disabled:opacity-50">
                {comprando ? 'Procesando...' : 'Comprar ahora'}
              </button>
            ) : (
              <p className="text-center text-gray-500 font-semibold">Este artículo ya no está disponible</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}