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
  const [nuevaTalla, setNuevaTalla] = useState('')
const [nuevaConservacion, setNuevaConservacion] = useState('')
const [nuevaDescripcion, setNuevaDescripcion] = useState('')
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
    setNuevaTalla(anuncio.talla)
setNuevaConservacion(anuncio.estado_conservacion)
setNuevaDescripcion(anuncio.productos?.descripcion || '')
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
      .update({ precio: parseFloat(nuevoPrecio), estado: nuevoEstado, talla: parseFloat(nuevaTalla),
    estado_conservacion: nuevaConservacion })
      .eq('id', anuncioId)

      await supabase
  .from('productos')
  .update({ descripcion: nuevaDescripcion })
  .eq('id', anuncios.find(a => a.id === anuncioId)?.producto_id)

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Mis anuncios</h1>
            <button onClick={() => navigate('/crear-anuncio')}
              className="bg-black text-white rounded-xl px-6 py-3 font-semibold hover:bg-gray-900 transition">
              + Publicar anuncio
            </button>
          </div>

          {anuncios.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-6xl mb-4">👟</p>
              <p className="text-xl font-semibold text-gray-700 mb-2">No tienes anuncios publicados</p>
              <p className="text-gray-400 mb-6">Empieza a vender tus zapatillas ahora</p>
              <button onClick={() => navigate('/crear-anuncio')}
                className="bg-black text-white rounded-xl px-8 py-3 font-semibold hover:bg-gray-900 transition">
                Publicar primer anuncio
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {anuncios.map(anuncio => (
                <div key={anuncio.id} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                  {editando === anuncio.id ? (
                    <div className="flex flex-col gap-4">
                      <p className="font-bold text-lg">{anuncio.productos?.marca} — {anuncio.productos?.nombre}</p>

                      <div className="flex gap-3 items-end flex-wrap">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-gray-500">Precio (€)</label>
                          <input type="number" value={nuevoPrecio} min="1"
                            onChange={e => setNuevoPrecio(e.target.value)}
                            className="border rounded-xl p-2 w-32 focus:outline-none focus:ring-2 focus:ring-black" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-gray-500">Estado</label>
                          <select value={nuevoEstado} onChange={e => setNuevoEstado(e.target.value)}
                            className="border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-black">
                            <option value="ACTIVO">Activo</option>
                            <option value="RESERVADO">Reservado</option>
                            <option value="VENDIDO">Vendido</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-gray-500">Talla</label>
                          <input type="number" value={nuevaTalla} min="34" max="50" step="0.5"
                            onChange={e => setNuevaTalla(e.target.value)}
                            className="border rounded-xl p-2 w-24 focus:outline-none focus:ring-2 focus:ring-black" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-gray-500">Conservación</label>
                          <select value={nuevaConservacion} onChange={e => setNuevaConservacion(e.target.value)}
                            className="border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-black">
                            <option value="NUEVO">Nuevo</option>
                            <option value="COMO_NUEVO">Como nuevo</option>
                            <option value="BUENAS_CONDICIONES">Buenas condiciones</option>
                            <option value="USADO">Usado</option>
                            <option value="MUY_USADO">Muy usado</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Descripción</label>
                        <textarea value={nuevaDescripcion} onChange={e => setNuevaDescripcion(e.target.value)}
                          rows={2} placeholder="Descripción del artículo..."
                          className="border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-black resize-none" />
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
                                  className="w-20 h-20 object-contain rounded-xl bg-gray-50 border" />
                                <button onClick={() => handleEliminarImagen(img.id)}
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
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-3 cursor-pointer hover:border-black transition"
                          onClick={() => document.getElementById(`input-imgs-${anuncio.id}`).click()}>
                          {previews.length > 0 ? (
                            <div className="flex gap-2 flex-wrap">
                              {previews.map((src, i) => (
                                <img key={i} src={src} alt="preview"
                                  className="w-20 h-20 object-contain rounded-xl bg-gray-50" />
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
                          className="bg-black text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-gray-900 transition">
                          Guardar
                        </button>
                        <button onClick={() => setEditando(null)}
                          className="border rounded-xl px-4 py-2 text-sm hover:bg-gray-50 transition">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div className="flex gap-4 items-center">
                        {anuncio.imagen_url && (
                          <img src={anuncio.imagen_url} alt={anuncio.productos?.nombre}
                            className="w-16 h-16 object-contain rounded-xl bg-gray-50 border" />
                        )}
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{anuncio.productos?.marca}</p>
                          <h2 className="text-lg font-bold">{anuncio.productos?.nombre}</h2>
                          <p className="text-sm text-gray-500">{anuncio.productos?.modelo} — Talla {anuncio.talla}</p>
                          <p className="text-sm text-gray-400 mt-1">{anuncio.estado_conservacion.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="text-2xl font-bold">{anuncio.precio} €</p>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${estadoColor[anuncio.estado]}`}>
                          {anuncio.estado}
                        </span>
                        <div className="flex gap-2 mt-1">
                          <button onClick={() => handleEditar(anuncio)}
                            className="text-xs border rounded-xl px-3 py-1.5 hover:bg-gray-50 transition">
                            Editar
                          </button>
                          <button onClick={() => handleEliminar(anuncio.id)}
                            className="text-xs text-red-500 border border-red-200 rounded-xl px-3 py-1.5 hover:bg-red-50 transition">
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