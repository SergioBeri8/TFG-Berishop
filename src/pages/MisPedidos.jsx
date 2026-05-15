import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function MisPedidos() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [valorados, setValorados] = useState([])

  useEffect(() => {
    async function cargarPedidos() {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          anuncios (
            talla, precio, estado_conservacion, vendedor_id,
            productos (nombre, marca, modelo)
          )
        `)
        .eq('comprador_id', user.id)
        .order('fecha_pedido', { ascending: false })

      if (!error) setPedidos(data)

      const { data: valoracionesData } = await supabase
        .from('valoraciones')
        .select('pedido_id')
        .eq('comprador_id', user.id)

      if (valoracionesData) setValorados(valoracionesData.map(v => v.pedido_id))
      setLoading(false)
    }
    cargarPedidos()
  }, [user.id])

  const estadoConfig = {
    PENDIENTE: { color: 'bg-yellow-100 text-yellow-700', label: 'Pendiente' },
    EN_VERIFICACION: { color: 'bg-blue-100 text-blue-700', label: 'En verificación' },
    COMPLETADO: { color: 'bg-green-100 text-green-700', label: 'Completado' },
    CANCELADO: { color: 'bg-red-100 text-red-700', label: 'Cancelado' }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8">Mis pedidos</h1>

        {pedidos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">📦</p>
            <p className="text-xl font-semibold text-gray-700 mb-2">No tienes pedidos todavía</p>
            <p className="text-gray-400 mb-6">Explora el catálogo y encuentra tu próxima zapatilla</p>
            <button onClick={() => navigate('/catalogo')}
              className="bg-black text-white rounded-xl px-8 py-3 font-semibold hover:bg-gray-800 transition">
              Ver catálogo
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {pedidos.map(pedido => (
              <div key={pedido.id} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                      {pedido.anuncios?.productos?.marca}
                    </p>
                    <h2 className="text-xl font-bold">{pedido.anuncios?.productos?.nombre}</h2>
                    <p className="text-sm text-gray-500">{pedido.anuncios?.productos?.modelo}</p>
                    <p className="text-sm text-gray-400 mt-1">Talla {pedido.anuncios?.talla}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{pedido.precio_final} €</p>
                    <span className={`text-xs px-3 py-1 rounded-full mt-2 inline-block font-medium ${estadoConfig[pedido.estado]?.color}`}>
                      {estadoConfig[pedido.estado]?.label}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    Pedido el {new Date(pedido.fecha_pedido).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <div className="flex gap-2">
                    {pedido.anuncios?.vendedor_id && (
                      <button onClick={() => navigate(`/usuario/${pedido.anuncios.vendedor_id}`)}
                        className="text-xs text-gray-500 hover:text-black border border-gray-200 rounded-lg px-3 py-1.5 transition">
                        Ver vendedor
                      </button>
                    )}
                    {pedido.estado === 'COMPLETADO' && !valorados.includes(pedido.id) && (
                      <button onClick={() => navigate(`/valorar/${pedido.id}`)}
                        className="text-xs bg-black text-white rounded-lg px-3 py-1.5 hover:bg-gray-800 transition font-medium">
                        ⭐ Valorar
                      </button>
                    )}
                    {pedido.estado === 'COMPLETADO' && valorados.includes(pedido.id) && (
                      <span className="text-xs text-green-600 font-medium">✓ Valorado</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}