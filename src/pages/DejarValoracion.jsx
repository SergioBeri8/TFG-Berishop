import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

export default function DejarValoracion() {
  const { pedidoId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [pedido, setPedido] = useState(null)
  const [puntuacion, setPuntuacion] = useState(0)
  const [comentario, setComentario] = useState('')
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [yaValorado, setYaValorado] = useState(false)

  useEffect(() => {
    async function cargar() {
      const { data: pedidoData } = await supabase
        .from('pedidos')
        .select(`
          *,
          anuncios (
            vendedor_id,
            productos (nombre, marca)
          )
        `)
        .eq('id', pedidoId)
        .eq('comprador_id', user.id)
        .eq('estado', 'COMPLETADO')
        .single()

      if (!pedidoData) {
        navigate('/mis-pedidos')
        return
      }

      const { data: valoracionExistente } = await supabase
        .from('valoraciones')
        .select('id')
        .eq('pedido_id', pedidoId)
        .single()

      if (valoracionExistente) setYaValorado(true)

      const { data: vendedorData } = await supabase
        .from('usuarios')
        .select('nombre, avatar_url')
        .eq('id', pedidoData.anuncios?.vendedor_id)
        .single()

      setPedido({ ...pedidoData, vendedor: vendedorData })
      setLoading(false)
    }
    cargar()
  }, [pedidoId, user.id, navigate])

  async function handleEnviar(e) {
    e.preventDefault()
    if (puntuacion === 0) return
    setEnviando(true)

    await supabase.from('valoraciones').insert({
      vendedor_id: pedido.anuncios?.vendedor_id,
      comprador_id: user.id,
      pedido_id: pedidoId,
      puntuacion,
      comentario: comentario || null
    })

    navigate('/mis-pedidos')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="py-10 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md p-8">
          <h1 className="text-2xl font-bold mb-6">Valorar vendedor</h1>

          {yaValorado ? (
            <div className="text-center">
              <p className="text-gray-600 mb-4">Ya has valorado esta compra.</p>
              <button onClick={() => navigate('/mis-pedidos')}
                className="bg-black text-white rounded-lg px-6 py-2 font-semibold hover:bg-gray-800 transition">
                Volver a mis pedidos
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-6 bg-gray-50 rounded-lg p-4">
                {pedido?.vendedor?.avatar_url ? (
                  <img src={pedido.vendedor.avatar_url} alt={pedido.vendedor.nombre}
                    className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                )}
                <div>
                  <p className="font-semibold">{pedido?.vendedor?.nombre}</p>
                  <p className="text-sm text-gray-500">{pedido?.anuncios?.productos?.marca} {pedido?.anuncios?.productos?.nombre}</p>
                </div>
              </div>

              <form onSubmit={handleEnviar} className="flex flex-col gap-4">
                <div>
                  <label className="text-sm text-gray-500 mb-2 block">Puntuación</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPuntuacion(i)}
                        className="text-3xl transition hover:scale-110"
                      >
                        {i <= puntuacion ? '★' : '☆'}
                      </button>
                    ))}
                  </div>
                  {puntuacion === 0 && <p className="text-red-500 text-xs mt-1">Selecciona una puntuación</p>}
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Comentario (opcional)</label>
                  <textarea
                    value={comentario}
                    onChange={e => setComentario(e.target.value)}
                    placeholder="Cuéntanos tu experiencia con este vendedor..."
                    rows={3}
                    className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  />
                </div>
                <button type="submit" disabled={enviando || puntuacion === 0}
                  className="bg-black text-white rounded-lg p-3 font-semibold hover:bg-gray-800 transition disabled:opacity-50">
                  {enviando ? 'Enviando...' : 'Enviar valoración'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}