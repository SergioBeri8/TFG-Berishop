import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'
import { enviarEmailVerificacion } from '../utils/email'

export default function PanelAdmin() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [comisionTotal, setComisionTotal] = useState(0)

  const cargarPedidos = useCallback(async () => {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        anuncios (
          id, talla, vendedor_id,
          productos (nombre, marca, modelo)
        )
      `)
      .order('fecha_pedido', { ascending: false })

    if (!error) {
      const pedidosConUsuarios = await Promise.all(data.map(async (pedido) => {
        const { data: comprador } = await supabase
          .from('usuarios')
          .select('nombre, email')
          .eq('id', pedido.comprador_id)
          .single()

        const { data: vendedor } = await supabase
          .from('usuarios')
          .select('nombre, email')
          .eq('id', pedido.anuncios?.vendedor_id)
          .single()

        return {
          ...pedido,
          comprador_nombre: comprador?.nombre,
          comprador_email: comprador?.email,
          vendedor_nombre: vendedor?.nombre,
          vendedor_email: vendedor?.email,
          anuncio_tabla_id: pedido.anuncios?.id,
          producto_marca: pedido.anuncios?.productos?.marca,
          producto_nombre: pedido.anuncios?.productos?.nombre,
          producto_modelo: pedido.anuncios?.productos?.modelo,
          talla: pedido.anuncios?.talla
        }
      }))
      setPedidos(pedidosConUsuarios)

      const total = pedidosConUsuarios
        .filter(p => p.estado === 'COMPLETADO')
        .reduce((sum, p) => sum + (p.comision || 0), 0)
      setComisionTotal(parseFloat(total.toFixed(2)))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    cargarPedidos()
  }, [cargarPedidos])

  async function handleVerificar(pedidoId, resultado) {
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('verificaciones').insert({
      pedido_id: pedidoId,
      admin_id: user.id,
      resultado
    })

    const nuevoEstado = resultado === 'APROBADO' ? 'COMPLETADO' : 'CANCELADO'
    await supabase.from('pedidos').update({ estado: nuevoEstado }).eq('id', pedidoId)

    const pedido = pedidos.find(p => p.id === pedidoId)

    if (resultado === 'APROBADO') {
      const comision = parseFloat((pedido.precio_final * 0.08).toFixed(2))
      const importeVendedor = parseFloat((pedido.precio_final - comision).toFixed(2))

      await supabase.from('pedidos').update({
        comision,
        importe_vendedor: importeVendedor
      }).eq('id', pedidoId)

      const { data: vendedorActual } = await supabase
        .from('usuarios')
        .select('saldo')
        .eq('id', pedido.anuncios?.vendedor_id)
        .single()

      await supabase.from('usuarios').update({
        saldo: (vendedorActual?.saldo || 0) + importeVendedor
      }).eq('id', pedido.anuncios?.vendedor_id)
    }

    await supabase.from('anuncios').update({ estado: 'VENDIDO' }).eq('id', pedido.anuncio_tabla_id)

    await enviarEmailVerificacion({
      emailComprador: pedido.comprador_email,
      producto: `${pedido.producto_marca} ${pedido.producto_nombre}`,
      resultado
    })

    await cargarPedidos()
  }

  const estadoColor = {
    PENDIENTE: 'bg-yellow-100 text-yellow-700',
    EN_VERIFICACION: 'bg-blue-100 text-blue-700',
    COMPLETADO: 'bg-green-100 text-green-700',
    CANCELADO: 'bg-red-100 text-red-700'
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto py-10 px-4">

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">Panel de administración</h1>
            <p className="text-gray-500 mt-1">Gestiona y verifica los pedidos</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm px-6 py-4 text-right">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Comisiones recaudadas</p>
            <p className="text-3xl font-bold text-green-600">{comisionTotal} €</p>
            <p className="text-xs text-gray-400 mt-1">8% por venta completada</p>
          </div>
        </div>

        {/* Lista pedidos */}
        {pedidos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <p className="text-5xl mb-4">📋</p>
            <p className="text-xl font-semibold text-gray-700">No hay pedidos todavía</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {pedidos.map(pedido => (
              <div key={pedido.id} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                <div className="flex justify-between items-start">

                  {/* Info izquierda */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                      {pedido.producto_marca}
                    </p>
                    <h2 className="text-lg font-bold">{pedido.producto_nombre}</h2>
                    <p className="text-sm text-gray-500 mb-3">
                      {pedido.producto_modelo} — Talla {pedido.talla}
                    </p>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-gray-500">
                        <span className="font-medium text-gray-700">Comprador:</span>{' '}
                        {pedido.comprador_nombre}
                        <span className="text-gray-400"> ({pedido.comprador_email})</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium text-gray-700">Vendedor:</span>{' '}
                        {pedido.vendedor_nombre}
                        <span className="text-gray-400"> ({pedido.vendedor_email})</span>
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">
                      {new Date(pedido.fecha_pedido).toLocaleDateString('es-ES', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Info derecha */}
                  <div className="text-right flex flex-col items-end gap-2">
                    <p className="text-2xl font-bold">{pedido.precio_final} €</p>

                    {pedido.estado === 'COMPLETADO' && pedido.comision > 0 && (
                      <div className="bg-gray-50 rounded-xl px-4 py-2 text-xs text-gray-500 text-right">
                        <p>Comisión: <span className="font-semibold text-gray-700">{pedido.comision} €</span></p>
                        <p>Vendedor recibe: <span className="font-semibold text-gray-700">{pedido.importe_vendedor} €</span></p>
                      </div>
                    )}

                    <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${estadoColor[pedido.estado]}`}>
                      {pedido.estado.replace('_', ' ')}
                    </span>

                    {(pedido.estado === 'PENDIENTE' || pedido.estado === 'EN_VERIFICACION') && (
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => handleVerificar(pedido.id, 'APROBADO')}
                          className="text-xs bg-green-500 text-white px-4 py-1.5 rounded-xl font-semibold hover:bg-green-600 transition">
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleVerificar(pedido.id, 'RECHAZADO')}
                          className="text-xs bg-red-500 text-white px-4 py-1.5 rounded-xl font-semibold hover:bg-red-600 transition">
                          Rechazar
                        </button>
                      </div>
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