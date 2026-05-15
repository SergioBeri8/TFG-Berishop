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
    <div className="min-h-screen flex">
      {/* Lado izquierdo */}
      <div className="hidden lg:flex w-1/2 bg-black flex-col justify-between p-12">
        <span className="text-white font-bold text-2xl tracking-widest">BERISHOP</span>
        <div>
          <h1 className="text-white text-5xl font-bold leading-tight mb-4">
            Únete a la<br />comunidad<br />sneaker.
          </h1>
          <p className="text-gray-400 text-lg">Miles de zapatillas exclusivas te esperan.</p>
        </div>
        <p className="text-gray-600 text-sm">© 2026 Berishop</p>
      </div>

      {/* Lado derecho */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <span className="text-black font-bold text-2xl tracking-widest">BERISHOP</span>
          </div>

          <h2 className="text-3xl font-bold mb-2">Crear cuenta</h2>
          <p className="text-gray-500 mb-8">Empieza a comprar y vender hoy</p>

          {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}

          <form onSubmit={handleRegistro} className="flex flex-col gap-4 mb-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Nombre completo</label>
              <input
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-black bg-white"
                required
              />
            </div>
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
                placeholder="Mínimo 6 caracteres"
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
              Crear cuenta
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <span onClick={() => navigate('/login')} className="font-semibold text-black cursor-pointer hover:underline">
              Inicia sesión
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}