import { useEffect, useState, useCallback } from 'react'
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
    const [orden, setOrden] = useState('recientes')
    const navigate = useNavigate()

    const cargarAnuncios = useCallback(async () => {
        const { data, error } = await supabase
            .from('anuncios')
            .select(`*, productos (nombre, marca, modelo)`)
            .eq('estado', 'ACTIVO')
            .order('created_at', { ascending: false })

        if (!error) {
            setAnuncios(data)
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        cargarAnuncios()
        const intervalo = setInterval(cargarAnuncios, 10000)
        return () => clearInterval(intervalo)
    }, [cargarAnuncios])

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

        if (orden === 'precio_asc') {
            resultado = [...resultado].sort((a, b) => a.precio - b.precio)
        } else if (orden === 'precio_desc') {
            resultado = [...resultado].sort((a, b) => b.precio - a.precio)
        } else if (orden === 'talla_asc') {
            resultado = [...resultado].sort((a, b) => a.talla - b.talla)
        }

        setFiltrados(resultado)
    }, [busqueda, marcaFiltro, tallaFiltro, precioMax, orden, anuncios])

    const marcas = [...new Set(anuncios.map(a => a.productos?.marca).filter(Boolean))]

    function limpiarFiltros() {
        setBusqueda('')
        setMarcaFiltro('')
        setTallaFiltro('')
        setPrecioMax('')
        setOrden('recientes')
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
                                step="0.5"
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
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500">Ordenar por</label>
                            <select
                                value={orden}
                                onChange={e => setOrden(e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black w-40"
                            >
                                <option value="recientes">Más recientes</option>
                                <option value="precio_asc">Precio: menor a mayor</option>
                                <option value="precio_desc">Precio: mayor a menor</option>
                                <option value="talla_asc">Talla: menor a mayor</option>
                            </select>
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
                                <div key={anuncio.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    {anuncio.imagen_url ? (
                                        <img src={anuncio.imagen_url} alt={anuncio.productos?.nombre}
                                            className="w-full h-48 object-contain bg-gray-50" />
                                    ) : (
                                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                                            <span className="text-gray-400 text-sm">Sin imagen</span>
                                        </div>
                                    )}
                                    <div className="p-6">
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
className="mt-4 w-full bg-black text-white rounded-xl py-2.5 font-semibold hover:bg-gray-900 transition tracking-wide text-sm"                                        >
                                            Ver detalle
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}