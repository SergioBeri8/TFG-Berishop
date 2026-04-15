import { useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

export default function Registro() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function handleRegistro(e) {
    e.preventDefault()
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError('Error al registrarse. Prueba con otro email.')
      return
    }
    await supabase.from('usuarios').insert({
      id: data.user.id,
      nombre,
      email,
      rol: 'CLIENTE'
    })
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Crear cuenta</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleRegistro} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black"
            required
          />
          <button
            type="submit"
            className="bg-black text-white rounded-lg p-3 font-semibold hover:bg-gray-800 transition"
          >
            Registrarse
          </button>
        </form>
        <p className="text-center text-sm mt-4">
          ¿Ya tienes cuenta?{' '}
          <a href="/login" className="font-semibold underline">Inicia sesión</a>
        </p>
      </div>
    </div>
  )
}