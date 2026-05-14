import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'

export default function Perfil() {
  const { user, perfil } = useAuth()
  const navigate = useNavigate()
  const [nombre, setNombre] = useState(perfil?.nombre || '')
  const [direccion, setDireccion] = useState(perfil?.direccion_envio || '')
  const [iban, setIban] = useState(perfil?.iban || '')
  const [loading, setLoading] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(perfil?.avatar_url || null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [saldo, setSaldo] = useState(0)
  const [retiros, setRetiros] = useState([])
  const [retirando, setRetirando] = useState(false)
  const [historialVentas, setHistorialVentas] = useState([])

  useEffect(() => {
    async function cargarDatos() {
      const { data: usuarioData } = await supabase
        .from('usuarios')
        .select('saldo, iban')
        .eq('id', user.id)
        .single()

      if (usuarioData) {
        setSaldo(usuarioData.saldo || 0)
        setIban(usuarioData.iban || '')
      }

      const { data: retirosData } = await supabase
        .from('retiros')
        .select('*')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false })

      if (retirosData) setRetiros(retirosData)

      const { data: ventasData } = await supabase
        .from('pedidos')
        .select(`
          *,
          anuncios (
            vendedor_id,
            productos (nombre, marca)
          )
        `)
        .eq('estado', 'COMPLETADO')

      if (ventasData) {
        const misVentas = ventasData.filter(p => p.anuncios?.vendedor_id === user.id)
        setHistorialVentas(misVentas)
      }
    }
    cargarDatos()
  }, [user.id])

  function handleAvatar(e) {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  async function handleGuardar(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setExito(false)

    let avatar_url = perfil?.avatar_url

    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `${user.id}.${ext}`
      const { error: errorStorage } = await supabase.storage
        .from('avatares')
        .upload(path, avatarFile, { upsert: true })

      if (!errorStorage) {
        const { data: urlData } = supabase.storage
          .from('avatares')
          .getPublicUrl(path)
        avatar_url = urlData.publicUrl
      }
    }

    const { error } = await supabase
      .from('usuarios')
      .update({ nombre, direccion_envio: direccion, avatar_url, iban })
      .eq('id', user.id)

    if (error) {
      setError('Error al guardar los cambios')
    } else {
      setExito(true)
    }
    setLoading(false)
  }

  async function handleRetirar() {
    if (saldo <= 0) return
    if (!iban) {
      setError('Introduce tu IBAN antes de retirar fondos')
      return
    }
    setRetirando(true)

    await supabase.from('retiros').insert({
      usuario_id: user.id,
      importe: saldo,
      estado: 'SOLICITADO'
    })

    await supabase.from('usuarios').update({ saldo: 0 }).eq('id', user.id)

    setSaldo(0)
    const { data: retirosData } = await supabase
      .from('retiros')
      .select('*')
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false })
    if (retirosData) setRetiros(retirosData)
    setRetirando(false)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="py-10 px-4">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">

          {/* DATOS DEL PERFIL */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h1 className="text-2xl font-bold mb-6">Mi perfil</h1>

            <div className="flex items-center gap-6 mb-6">
              <div onClick={() => document.getElementById('input-avatar').click()} className="cursor-pointer relative">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-2xl">👤</span>
                  </div>
                )}
                <div className="absolute bottom-0 right-0 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">+</div>
                <input id="input-avatar" type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
              </div>
              <div>
                <p className="font-semibold">{perfil?.nombre || 'Sin nombre'}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <p className="text-sm text-gray-500">Rol: {perfil?.rol}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <button onClick={() => navigate(`/usuario/${user.id}`)} className="text-sm text-blue-600 hover:underline">
                Ver mi perfil público →
              </button>
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {exito && <p className="text-green-600 text-sm mb-4">¡Cambios guardados correctamente!</p>}

            <form onSubmit={handleGuardar} className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Nombre</label>
                <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                  className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-black" required />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Dirección de envío</label>
                <input type="text" value={direccion} onChange={e => setDireccion(e.target.value)}
                  placeholder="Calle, número, ciudad..."
                  className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <button type="submit" disabled={loading}
                className="bg-black text-white rounded-lg p-3 font-semibold hover:bg-gray-800 transition disabled:opacity-50">
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          </div>

          {/* MONEDERO */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-xl font-bold mb-6">💰 Monedero</h2>

            <div className="bg-gray-50 rounded-xl p-6 mb-6 text-center">
              <p className="text-sm text-gray-500 mb-1">Saldo disponible</p>
              <p className="text-4xl font-bold">{saldo.toFixed(2)} €</p>
              <p className="text-xs text-gray-400 mt-1">Después de la comisión del 8% de Berishop</p>
            </div>

            <div className="mb-6">
              <label className="text-sm text-gray-500 mb-1 block">IBAN para cobros</label>
              <input type="text" value={iban} onChange={e => setIban(e.target.value)}
                placeholder="ES91 2100 0418 4502 0005 1332"
                className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-black" />
              <button
                onClick={async () => {
                  await supabase.from('usuarios').update({ iban }).eq('id', user.id)
                  setExito(true)
                }}
                className="mt-2 text-sm text-gray-600 hover:text-black underline transition">
                Guardar IBAN
              </button>
            </div>

            <button
              onClick={handleRetirar}
              disabled={retirando || saldo <= 0 || !iban}
              className="w-full bg-black text-white rounded-lg p-3 font-semibold hover:bg-gray-800 transition disabled:opacity-50"
            >
              {retirando ? 'Procesando...' : `Retirar ${saldo.toFixed(2)} €`}
            </button>
            {!iban && <p className="text-xs text-gray-400 mt-2 text-center">Introduce tu IBAN para poder retirar fondos</p>}
          </div>

          {/* HISTORIAL */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-xl font-bold mb-4">📋 Historial</h2>

            {historialVentas.length === 0 && retiros.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay movimientos todavía</p>
            ) : (
              <div className="flex flex-col gap-2">
                {historialVentas.map(venta => (
                  <div key={venta.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="text-sm font-medium text-green-600">+ {venta.importe_vendedor?.toFixed(2)} €</p>
                      <p className="text-xs text-gray-400">{venta.anuncios?.productos?.marca} {venta.anuncios?.productos?.nombre}</p>
                      <p className="text-xs text-gray-400">Comisión Berishop: {venta.comision?.toFixed(2)} €</p>
                    </div>
                    <p className="text-xs text-gray-400">{new Date(venta.fecha_pedido).toLocaleDateString('es-ES')}</p>
                  </div>
                ))}
                {retiros.map(retiro => (
                  <div key={retiro.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="text-sm font-medium text-red-500">- {retiro.importe.toFixed(2)} €</p>
                      <p className="text-xs text-gray-400">Retirada solicitada</p>
                    </div>
                    <p className="text-xs text-gray-400">{new Date(retiro.created_at).toLocaleDateString('es-ES')}</p>
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