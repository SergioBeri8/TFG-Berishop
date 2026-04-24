import { useState } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

export default function Perfil() {
  const { user, perfil } = useAuth()
  const [nombre, setNombre] = useState(perfil?.nombre || '')
  const [direccion, setDireccion] = useState(perfil?.direccion_envio || '')
  const [loading, setLoading] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState(null)

  async function handleGuardar(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setExito(false)

    const { error } = await supabase
      .from('usuarios')
      .update({ nombre, direccion_envio: direccion })
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

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-semibold">{user?.email}</p>
            <p className="text-sm text-gray-500 mt-2">Rol</p>
            <p className="font-semibold">{perfil?.rol}</p>
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {exito && <p className="text-green-600 text-sm mb-4">¡Cambios guardados correctamente!</p>}

          <form onSubmit={handleGuardar} className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Dirección de envío</label>
              <input
                type="text"
                value={direccion}
                onChange={e => setDireccion(e.target.value)}
                placeholder="Calle, número, ciudad..."
                className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white rounded-lg p-3 font-semibold hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}