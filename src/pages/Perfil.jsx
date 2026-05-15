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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto py-10 px-4 flex flex-col gap-6">

        {/* DATOS DEL PERFIL */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-8">Mi perfil</h1>

          {/* Avatar + info */}
          <div className="flex items-center gap-6 mb-8">
            <div onClick={() => document.getElementById('input-avatar').click()} className="cursor-pointer relative group">
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-100 group-hover:opacity-80 transition" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition">
                  <span className="text-gray-400 text-2xl">👤</span>
                </div>
              )}
              <div className="absolute bottom-0 right-0 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">+</div>
              <input id="input-avatar" type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
            </div>
            <div>
              <p className="font-bold text-lg">{perfil?.nombre || 'Sin nombre'}</p>
              <p className="text-sm text-gray-400">{user?.email}</p>
              <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full mt-1 inline-block">
                {perfil?.rol}
              </span>
            </div>
          </div>

          {/* Ver perfil público */}
          <button
            onClick={() => navigate(`/usuario/${user.id}`)}
            className="w-full text-sm font-semibold border border-gray-200 rounded-xl py-2.5 text-gray-600 hover:border-black hover:text-black transition mb-6"
          >
            Ver mi perfil público →
          </button>

          {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-xl">{error}</p>}
          {exito && <p className="text-green-600 text-sm mb-4 bg-green-50 p-3 rounded-xl">¡Cambios guardados correctamente!</p>}

          <form onSubmit={handleGuardar} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Nombre</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                className="border border-gray-200 rounded-xl p-3 w-full focus:outline-none focus:ring-2 focus:ring-black bg-gray-50" required />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Dirección de envío</label>
              <input type="text" value={direccion} onChange={e => setDireccion(e.target.value)}
                placeholder="Calle, número, ciudad..."
                className="border border-gray-200 rounded-xl p-3 w-full focus:outline-none focus:ring-2 focus:ring-black bg-gray-50" />
            </div>
            <button type="submit" disabled={loading}
              className="bg-black text-white rounded-xl p-3 font-semibold hover:bg-gray-900 transition disabled:opacity-50 mt-2">
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </div>

        {/* MONEDERO */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-xl font-bold mb-6">Monedero</h2>

          {/* Saldo */}
          <div className="bg-black rounded-2xl p-6 mb-6 text-center">
            <p className="text-sm text-gray-400 mb-1">Saldo disponible</p>
            <p className="text-5xl font-bold text-white">{saldo.toFixed(2)} €</p>
            <p className="text-xs text-gray-500 mt-2">Después de la comisión del 8% de Berishop</p>
          </div>

          {/* IBAN */}
          <div className="mb-6">
            <label className="text-xs font-medium text-gray-500 mb-1 block">IBAN para cobros</label>
            <input type="text" value={iban} onChange={e => setIban(e.target.value)}
              placeholder="ES91 2100 0418 4502 0005 1332"
              className="border border-gray-200 rounded-xl p-3 w-full focus:outline-none focus:ring-2 focus:ring-black bg-gray-50" />
            <button
              onClick={async () => {
                await supabase.from('usuarios').update({ iban }).eq('id', user.id)
                setExito(true)
              }}
              className="mt-2 text-sm text-gray-500 hover:text-black transition underline">
              Guardar IBAN
            </button>
          </div>

          <button
            onClick={handleRetirar}
            disabled={retirando || saldo <= 0 || !iban}
            className="w-full bg-black text-white rounded-xl p-3 font-semibold hover:bg-gray-900 transition disabled:opacity-50"
          >
            {retirando ? 'Procesando...' : `Retirar ${saldo.toFixed(2)} €`}
          </button>
          {!iban && (
            <p className="text-xs text-gray-400 mt-2 text-center">Introduce tu IBAN para poder retirar fondos</p>
          )}
        </div>

        {/* HISTORIAL */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-xl font-bold mb-6">Historial</h2>

          {historialVentas.length === 0 && retiros.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-gray-500 text-sm">No hay movimientos todavía</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {historialVentas.map(venta => (
                <div key={venta.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-bold text-green-600">+ {venta.importe_vendedor?.toFixed(2)} €</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {venta.anuncios?.productos?.marca} {venta.anuncios?.productos?.nombre}
                    </p>
                    <p className="text-xs text-gray-400">Comisión Berishop: {venta.comision?.toFixed(2)} €</p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(venta.fecha_pedido).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              ))}
              {retiros.map(retiro => (
                <div key={retiro.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-bold text-red-500">- {retiro.importe.toFixed(2)} €</p>
                    <p className="text-xs text-gray-400 mt-0.5">Retirada solicitada</p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(retiro.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
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