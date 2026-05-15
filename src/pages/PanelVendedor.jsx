import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function PanelVendedor() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [anuncios, setAnuncios] = useState([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(null)
  const [nuevoPrecio, setNuevoPrecio] = useState('')
  const [nuevoEstado, setNuevoEstado] = useState('')
  const [nuevasImagenes, setNuevasImagenes] = useState([])
  const [previews, setPreviews] = useState([])
  const [imagenesActuales, setImagenesActuales] = useState([])

  useEffect(() => {
    async function cargarAnuncios() {
      const { data, error } = await supabase
        .from('anuncios')
        .select(`*, productos (nombre, marca, modelo)`)
        .eq('vendedor_id', user.id)
        .order('created_at', { ascending: false })

      if (!error) setAnuncios(data)
      setLoading(false)
    }
    cargarAnuncios()
  }, [user.id])

  async function handleEditar(anuncio) {
    setEditando(anuncio.id)
    setNuevoPrecio(anuncio.precio)
    setNuevoEstado(anuncio.estado)
    setNuevasImagenes([])
    setPreviews([])

    const { data: imgs } = await supabase
      .from('imagenes_anuncio')
      .select('*')
      .eq('anuncio_id', anuncio.id)
      .order('orden')

    setImagenesActuales(imgs || [])
  }

  async function handleEliminarImagen(imagenId) {
    await supabase.from('imagenes_anuncio').delete().eq('id', imagenId)
    setImagenesActuales(imagenesActuales.filter(img => img.id !== imagenId))
  }

  function handleNuevasImagenes(e) {
    const files = Array.from(e.target.files)
    setNuevasImagenes(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  async function handleGuardarEdicion(anuncioId) {
    await supabase
      .from('anuncios')
      .update({ precio: parseFloat(nuevoPrecio), estado: nuevoEstado })
      .eq('id', anuncioId)

    if (nuevasImagenes.length > 0) {
      const ordenInicial = imagenesActuales.length
      for (let i = 0; i < nuevasImagenes.length; i++) {
        const ext = nuevasImagenes[i].name.split('.').pop()
        const path = `${user.id}/${anuncioId}_new_${Date.now()}_${i}.${ext}`
        const { error: errImg } = await supabase.storage
          .from('anuncios')
          .upload(path, nuevasImagenes[i])

        if (!errImg) {
          const { data: urlData } = supabase.storage
            .from('anuncios')
            .getPublicUrl(path)
          await supabase.from('imagenes_anuncio').insert({
            anuncio_id: anuncioId,
            url: urlData.publicUrl,
            orden: ordenInicial + i
          })
        }
      }
    }

    const { data: todasImagenes } = await supabase
  .from('imagenes_anuncio')
  .select('url')
  .eq('anuncio_id', anuncioId)
  .order('orden')
  .limit(1)
  .single()

if (todasImagenes) {
  await supabase
    .from('anuncios')
    .update({ imagen_url: todasImagenes.url })
    .eq('id', anuncioId)
}

    setAnuncios(anuncios.map(a => a.id === anuncioId
      ? { ...a, precio: parseFloat(nuevoPrecio), estado: nuevoEstado }
      : a
    ))
    setEditando(null)
    setNuevasImagenes([])
    setPreviews([])
    setImagenesActuales([])
  }

  async function handleEliminar(id) {
    if (!confirm('¿Seguro que quieres eliminar este anuncio?')) return
    await supabase.from('anuncios').delete().eq('id', id)
    setAnuncios(anuncios.filter(a => a.id !== id))
  }

  const estadoColor = {
    ACTIVO: 'bg-green-100 text-green-700',
    RESERVADO: 'bg-yellow-100 text-yellow-700',
    VENDIDO: 'bg-gray-100 text-gray-500'
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Panel del vendedor</h1>
            <button onClick={() => navigate('/crear-anuncio')}
              className="bg-black text-white rounded-lg px-6 py-3 font-semibold hover:bg-gray-800 transition">
              + Publicar anuncio
            </button>
          </div>

          {anuncios.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <p className="text-xl">No tienes anuncios publicados</p>
              <button onClick={() => navigate('/crear-anuncio')}
                className="mt-4 bg-black text-white rounded-lg px-6 py-3 font-semibold hover:bg-gray-800 transition">
                Publicar primer anuncio
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {anuncios.map(anuncio => (
                <div key={anuncio.id} className="bg-white rounded-xl shadow-md p-6">
                  {editando === anuncio.id ? (
                    <div className="flex flex-col gap-4">
                      <p className="font-bold text-lg">{anuncio.productos?.marca} — {anuncio.productos?.nombre}</p>

                      <div className="flex gap-3 items-end flex-wrap">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-gray-500">Precio (€)</label>
                          <input type="number" value={nuevoPrecio} min="1"
                            onChange={e => setNuevoPrecio(e.target.value)}
                            className="border rounded-lg p-2 w-32 focus:outline-none focus:ring-2 focus:ring-black" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-gray-500">Estado</label>
                          <select value={nuevoEstado} onChange={e => setNuevoEstado(e.target.value)}
                            className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-black">
                            <option value="ACTIVO">Activo</option>
                            <option value="RESERVADO">Reservado</option>
                            <option value="VENDIDO">Vendido</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-gray-500 mb-2 block">Imágenes actuales</label>
                        {imagenesActuales.length === 0 ? (
                          <p className="text-sm text-gray-400">Sin imágenes</p>
                        ) : (
                          <div className="flex gap-2 flex-wrap">
                            {imagenesActuales.map(img => (
                              <div key={img.id} className="relative">
                                <img src={img.url} alt="imagen"
                                  className="w-20 h-20 object-contain rounded-lg bg-gray-50 border" />
                                <button
                                  onClick={() => handleEliminarImagen(img.id)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-xs text-gray-500 mb-2 block">Añadir nuevas imágenes</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 cursor-pointer hover:border-black transition"
                          onClick={() => document.getElementById(`input-imgs-${anuncio.id}`).click()}>
                          {previews.length > 0 ? (
                            <div className="flex gap-2 flex-wrap">
                              {previews.map((src, i) => (
                                <img key={i} src={src} alt="preview"
                                  className="w-20 h-20 object-contain rounded-lg bg-gray-50" />
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 text-center">Haz clic para añadir fotos</p>
                          )}
                          <input id={`input-imgs-${anuncio.id}`} type="file" accept="image/*" multiple
                            onChange={handleNuevasImagenes} className="hidden" />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => handleGuardarEdicion(anuncio.id)}
                          className="bg-black text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-gray-800 transition">
                          Guardar
                        </button>
                        <button onClick={() => setEditando(null)}
                          className="border rounded-lg px-4 py-2 text-sm hover:bg-gray-50 transition">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div className="flex gap-4 items-center">
                        {anuncio.imagen_url && (
                          <img src={anuncio.imagen_url} alt={anuncio.productos?.nombre}
                            className="w-16 h-16 object-contain rounded-lg bg-gray-50 border" />
                        )}
                        <div>
                          <p className="text-sm text-gray-500">{anuncio.productos?.marca}</p>
                          <h2 className="text-lg font-bold">{anuncio.productos?.nombre}</h2>
                          <p className="text-sm text-gray-500">{anuncio.productos?.modelo} — Talla {anuncio.talla}</p>
                          <p className="text-sm text-gray-400 mt-1">{anuncio.estado_conservacion.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="text-2xl font-bold">{anuncio.precio} €</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${estadoColor[anuncio.estado]}`}>
                          {anuncio.estado}
                        </span>
                        <div className="flex gap-2 mt-1">
                          <button onClick={() => handleEditar(anuncio)}
                            className="text-xs border rounded-lg px-3 py-1 hover:bg-gray-50 transition">
                            Editar
                          </button>
                          <button onClick={() => handleEliminar(anuncio.id)}
                            className="text-xs text-red-500 border border-red-200 rounded-lg px-3 py-1 hover:bg-red-50 transition">
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}