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

  useEffect(() => {
    async function cargarPedidos() {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          anuncios (
            talla, precio, estado_conservacion,
            productos (nombre, marca, modelo)
          )
        `)
        .eq('comprador_id', user.id)
        .order('fecha_pedido', { ascending: false })

      if (!error) setPedidos(data)
      setLoading(false)
    }
    cargarPedidos()
  }, [user.id])

  const estadoColor = {
    PENDIENTE: 'bg-yellow-100 text-yellow-700',
    EN_VERIFICACION: 'bg-blue-100 text-blue-700',
    COMPLETADO: 'bg-green-100 text-green-700',
    CANCELADO: 'bg-red-100 text-red-700'
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>

  return (
  <div className="min-h-screen bg-gray-100">
    <Navbar />
    <div className="py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mis pedidos</h1>

        {pedidos.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-xl">No tienes pedidos todavía</p>
            <button onClick={() => navigate('/catalogo')}
              className="mt-4 bg-black text-white rounded-lg px-6 py-3 font-semibold hover:bg-gray-800 transition">
              Ver catálogo
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {pedidos.map(pedido => (
              <div key={pedido.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">{pedido.anuncios?.productos?.marca}</p>
                    <h2 className="text-lg font-bold">{pedido.anuncios?.productos?.nombre}</h2>
                    <p className="text-sm text-gray-500">{pedido.anuncios?.productos?.modelo}</p>
                    <p className="text-sm text-gray-400 mt-1">Talla {pedido.anuncios?.talla}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{pedido.precio_final} €</p>
                    <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${estadoColor[pedido.estado]}`}>
                      {pedido.estado.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  Pedido el {new Date(pedido.fecha_pedido).toLocaleDateString('es-ES')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
)
}