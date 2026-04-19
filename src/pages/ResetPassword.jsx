import { useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(false)
  const navigate = useNavigate()

  async function handleReset(e) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError('Error al actualizar la contraseña')
    } else {
      setExito(true)
      setTimeout(() => navigate('/'), 2000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Nueva contraseña</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {exito ? (
          <p className="text-green-600 text-center">¡Contraseña actualizada! Redirigiendo...</p>
        ) : (
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
            <button
              type="submit"
              className="bg-black text-white rounded-lg p-3 font-semibold hover:bg-gray-800 transition"
            >
              Actualizar contraseña
            </button>
          </form>
        )}
      </div>
    </div>
  )
}