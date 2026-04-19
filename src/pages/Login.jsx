import { useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [recuperando, setRecuperando] = useState(false)
  const [mensajeRecuperacion, setMensajeRecuperacion] = useState(null)
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email o contraseña incorrectos')
    } else {
      navigate('/')
    }
  }

  async function handleRecuperar() {
    if (!email) {
      setError('Escribe tu email primero')
      return
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://tfg-berishop.vercel.app/reset-password'
    })
    if (error) {
      setError('Error al enviar el email')
    } else {
      setMensajeRecuperacion('Te hemos enviado un email para restablecer tu contraseña')
      setError(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {mensajeRecuperacion && <p className="text-green-600 text-sm mb-4">{mensajeRecuperacion}</p>}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
            Entrar
          </button>
        </form>
        <div className="text-center mt-4 flex flex-col gap-2">
          <button
            onClick={handleRecuperar}
            className="text-sm text-gray-500 hover:text-black transition"
          >
            ¿Olvidaste tu contraseña?
          </button>
          <p className="text-sm">
            ¿No tienes cuenta?{' '}
            <a href="/registro" className="font-semibold underline">Regístrate</a>
          </p>
        </div>
      </div>
    </div>
  )
}