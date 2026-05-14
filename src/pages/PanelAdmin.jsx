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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Panel de administración</h1>
            <div className="bg-white rounded-xl shadow-md px-6 py-4 text-right">
              <p className="text-xs text-gray-500">Comisiones recaudadas</p>
              <p className="text-2xl font-bold text-green-600">{comisionTotal} €</p>
              <p className="text-xs text-gray-400">8% por venta</p>
            </div>
          </div>

          {pedidos.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <p className="text-xl">No hay pedidos todavía</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {pedidos.map(pedido => (
                <div key={pedido.id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500">{pedido.producto_marca}</p>
                      <h2 className="text-lg font-bold">{pedido.producto_nombre}</h2>
                      <p className="text-sm text-gray-500">{pedido.producto_modelo} — Talla {pedido.talla}</p>
                      <p className="text-sm text-gray-400 mt-2">
                        <span className="font-medium">Comprador:</span> {pedido.comprador_nombre} ({pedido.comprador_email})
                      </p>
                      <p className="text-sm text-gray-400">
                        <span className="font-medium">Vendedor:</span> {pedido.vendedor_nombre} ({pedido.vendedor_email})
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(pedido.fecha_pedido).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="text-2xl font-bold">{pedido.precio_final} €</p>
                      {pedido.estado === 'COMPLETADO' && pedido.comision > 0 && (
                        <div className="text-xs text-gray-400">
                          <p>Comisión: {pedido.comision} €</p>
                          <p>Vendedor recibe: {pedido.importe_vendedor} €</p>
                        </div>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${estadoColor[pedido.estado]}`}>
                        {pedido.estado.replace('_', ' ')}
                      </span>
                      {(pedido.estado === 'PENDIENTE' || pedido.estado === 'EN_VERIFICACION') && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleVerificar(pedido.id, 'APROBADO')}
                            className="text-xs bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition">
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleVerificar(pedido.id, 'RECHAZADO')}
                            className="text-xs bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition">
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
    </div>
  )
}