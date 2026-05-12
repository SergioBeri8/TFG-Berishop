import { useState } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'

export default function Perfil() {
  const { user, perfil } = useAuth()
  const navigate = useNavigate()
  const [nombre, setNombre] = useState(perfil?.nombre || '')
  const [direccion, setDireccion] = useState(perfil?.direccion_envio || '')
  const [loading, setLoading] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(perfil?.avatar_url || null)
  const [avatarFile, setAvatarFile] = useState(null)

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
      .update({ nombre, direccion_envio: direccion, avatar_url })
      .eq('id', user.id)

    if (error) {
      setError('Error al guardar los cambios')
    } else {
      setExito(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="py-10 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md p-8">
          <h1 className="text-2xl font-bold mb-6">Mi perfil</h1>

          <div className="flex items-center gap-6 mb-6">
            <div
              onClick={() => document.getElementById('input-avatar').click()}
              className="cursor-pointer relative"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-2xl">👤</span>
                </div>
              )}
              <div className="absolute bottom-0 right-0 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">+</div>
              <input id="input-avatar" type="file" accept="image/*"
                onChange={handleAvatar} className="hidden" />
            </div>
            <div>
              <p className="font-semibold">{perfil?.nombre || 'Sin nombre'}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-sm text-gray-500">Rol: {perfil?.rol}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <button
              onClick={() => navigate(`/usuario/${user.id}`)}
              className="text-sm text-blue-600 hover:underline"
            >
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
      </div>
    </div>
  )
}