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

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://tfg-berishop.vercel.app/catalogo' }
    })
  }

  return (
    <div className="min-h-screen flex">
      {/* Lado izquierdo - imagen */}
      <div className="hidden lg:flex w-1/2 bg-black flex-col justify-between p-12">
        <span className="text-white font-bold text-2xl tracking-widest">BERISHOP</span>
        <div>
          <h1 className="text-white text-5xl font-bold leading-tight mb-4">
            El mercado de<br />las zapatillas<br />exclusivas.
          </h1>
          <p className="text-gray-400 text-lg">Compra y vende con total seguridad.</p>
        </div>
        <p className="text-gray-600 text-sm">© 2026 Berishop</p>
      </div>

      {/* Lado derecho - formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <span className="text-black font-bold text-2xl tracking-widest">BERISHOP</span>
          </div>

          <h2 className="text-3xl font-bold mb-2">Bienvenido</h2>
          <p className="text-gray-500 mb-8">Inicia sesión en tu cuenta</p>

          {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}
          {mensajeRecuperacion && <p className="text-green-600 text-sm mb-4 bg-green-50 p-3 rounded-lg">{mensajeRecuperacion}</p>}

          <form onSubmit={handleLogin} className="flex flex-col gap-4 mb-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-black bg-white"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-black bg-white"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-black text-white rounded-lg p-3 font-semibold hover:bg-gray-800 transition mt-2"
            >
              Iniciar sesión
            </button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 text-gray-400">o continúa con</span>
            </div>
          </div>

          <button
            onClick={handleGoogle}
            className="w-full border border-gray-300 rounded-lg p-3 font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-3 bg-white mb-6"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
            Continuar con Google
          </button>

          <div className="text-center flex flex-col gap-3">
            <button onClick={handleRecuperar} className="text-sm text-gray-500 hover:text-black transition">
              ¿Olvidaste tu contraseña?
            </button>
            <p className="text-sm text-gray-500">
              ¿No tienes cuenta?{' '}
              <span onClick={() => navigate('/registro')} className="font-semibold text-black cursor-pointer hover:underline">
                Regístrate
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}