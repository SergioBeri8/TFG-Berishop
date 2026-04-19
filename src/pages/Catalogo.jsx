import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Catalogo() {
  const [anuncios, setAnuncios] = useState([])
  const [filtrados, setFiltrados] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [marcaFiltro, setMarcaFiltro] = useState('')
  const [tallaFiltro, setTallaFiltro] = useState('')
  const [precioMax, setPrecioMax] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function cargarAnuncios() {
      const { data, error } = await supabase
        .from('anuncios')
        .select(`*, productos (nombre, marca, modelo)`)
        .eq('estado', 'ACTIVO')
        .order('created_at', { ascending: false })

      if (!error) {
        setAnuncios(data)
        setFiltrados(data)
      }
      setLoading(false)
    }
    cargarAnuncios()
  }, [])

  useEffect(() => {
    let resultado = anuncios

    if (busqueda) {
      const b = busqueda.toLowerCase()
      resultado = resultado.filter(a =>
        a.productos?.nombre?.toLowerCase().includes(b) ||
        a.productos?.marca?.toLowerCase().includes(b) ||
        a.productos?.modelo?.toLowerCase().includes(b)
      )
    }

    if (marcaFiltro) {
      resultado = resultado.filter(a =>
        a.productos?.marca?.toLowerCase() === marcaFiltro.toLowerCase()
      )
    }

    if (tallaFiltro) {
      resultado = resultado.filter(a => a.talla === parseFloat(tallaFiltro))
    }

    if (precioMax) {
      resultado = resultado.filter(a => a.precio <= parseFloat(precioMax))
    }

    setFiltrados(resultado)
  }, [busqueda, marcaFiltro, tallaFiltro, precioMax, anuncios])

  const marcas = [...new Set(anuncios.map(a => a.productos?.marca).filter(Boolean))]

  function limpiarFiltros() {
    setBusqueda('')
    setMarcaFiltro('')
    setTallaFiltro('')
    setPrecioMax('')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Catálogo</h1>
            <button
              onClick={() => navigate('/crear-anuncio')}
              className="bg-black text-white rounded-lg px-6 py-3 font-semibold hover:bg-gray-800 transition"
            >
              + Publicar anuncio
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Buscar</label>
              <input
                type="text"
                placeholder="Marca, modelo..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black w-48"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Marca</label>
              <select
                value={marcaFiltro}
                onChange={e => setMarcaFiltro(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black w-36"
              >
                <option value="">Todas</option>
                {marcas.map(marca => (
                  <option key={marca} value={marca}>{marca}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Talla</label>
              <input
                type="number"
                placeholder="Ej: 42"
                value={tallaFiltro}
                onChange={e => setTallaFiltro(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black w-24"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Precio máximo</label>
              <input
                type="number"
                placeholder="Ej: 200"
                value={precioMax}
                onChange={e => setPrecioMax(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black w-32"
              />
            </div>
            <button
              onClick={limpiarFiltros}
              className="text-sm text-gray-500 hover:text-black transition px-3 py-2"
            >
              Limpiar filtros
            </button>
            <span className="text-sm text-gray-400 ml-auto">
              {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filtrados.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <p className="text-xl">No hay anuncios que coincidan</p>
              <button onClick={limpiarFiltros} className="mt-4 text-sm underline">
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtrados.map(anuncio => (
                <div key={anuncio.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm text-gray-500">{anuncio.productos?.marca}</p>
                      <h2 className="text-lg font-bold">{anuncio.productos?.nombre}</h2>
                      <p className="text-sm text-gray-500">{anuncio.productos?.modelo}</p>
                    </div>
                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                      Talla {anuncio.talla}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-2xl font-bold">{anuncio.precio} €</span>
                    <span className="text-xs text-gray-500">{anuncio.estado_conservacion.replace(/_/g, ' ')}</span>
                  </div>
                  <button
                    onClick={() => navigate(`/anuncio/${anuncio.id}`)}
                    className="mt-4 w-full bg-black text-white rounded-lg py-2 font-semibold hover:bg-gray-800 transition"
                  >
                    Ver detalle
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}