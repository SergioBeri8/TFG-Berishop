import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md text-center">
        <h1 className="text-3xl font-bold mb-2">Bienvenido a Berishop</h1>
        <p className="text-gray-500 mb-6">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="bg-black text-white rounded-lg px-6 py-3 font-semibold hover:bg-gray-800 transition"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}