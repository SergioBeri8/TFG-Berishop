import { useState } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function CrearAnuncio() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [marca, setMarca] = useState('')
  const [nombre, setNombre] = useState('')
  const [modelo, setModelo] = useState('')
  const [referencia, setReferencia] = useState('')
  const [talla, setTalla] = useState('')
  const [precio, setPrecio] = useState('')
  const [conservacion, setConservacion] = useState('NUEVO')
  const [descripcion, setDescripcion] = useState('')
  const [imagenes, setImagenes] = useState([])
  const [previews, setPreviews] = useState([])

  function handleImagenes(e) {
    const files = Array.from(e.target.files)
    if (files.length > 5) {
      alert('Máximo 5 imágenes')
      return
    }
    setImagenes(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: producto, error: errorProducto } = await supabase
      .from('productos')
      .insert({ nombre, marca, modelo, referencia, descripcion })
      .select()
      .single()

    if (errorProducto) {
      setError('Error al crear el producto')
      setLoading(false)
      return
    }

    let imagen_url = null

    if (imagenes.length > 0) {
      const extension = imagenes[0].name.split('.').pop()
      const path = `${user.id}/${producto.id}_0.${extension}`
      const { error: errorStorage } = await supabase.storage
        .from('anuncios')
        .upload(path, imagenes[0])

      if (!errorStorage) {
        const { data: urlData } = supabase.storage.from('anuncios').getPublicUrl(path)
        imagen_url = urlData.publicUrl
      }
    }

    const { data: anuncio, error: errorAnuncio } = await supabase
      .from('anuncios')
      .insert({
        producto_id: producto.id,
        vendedor_id: user.id,
        talla: parseFloat(talla),
        precio: parseFloat(precio),
        estado_conservacion: conservacion,
        estado: 'ACTIVO',
        imagen_url
      })
      .select()
      .single()

    if (errorAnuncio) {
      setError('Error al crear el anuncio')
      setLoading(false)
      return
    }

    if (imagenes.length > 0) {
      for (let i = 0; i < imagenes.length; i++) {
        const ext = imagenes[i].name.split('.').pop()
        const path = `${user.id}/${anuncio.id}_${i}.${ext}`
        const { error: errImg } = await supabase.storage.from('anuncios').upload(path, imagenes[i])
        if (!errImg) {
          const { data: urlData } = supabase.storage.from('anuncios').getPublicUrl(path)
          await supabase.from('imagenes_anuncio').insert({
            anuncio_id: anuncio.id,
            url: urlData.publicUrl,
            orden: i
          })
        }
      }
    }

    navigate('/catalogo')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-2">Publicar anuncio</h1>
        <p className="text-gray-500 mb-8">Rellena los datos de tu zapatilla</p>

        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-xl">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
            <h2 className="font-semibold text-gray-700">Información del producto</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Marca</label>
                <input type="text" placeholder="Nike, Adidas..." value={marca}
                  onChange={e => setMarca(e.target.value)}
                  className="border border-gray-200 rounded-xl p-3 w-full focus:outline-none focus:ring-2 focus:ring-black bg-gray-50" required />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Nombre</label>
                <input type="text" placeholder="Air Force 1, Dunk..." value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  className="border border-gray-200 rounded-xl p-3 w-full focus:outline-none focus:ring-2 focus:ring-black bg-gray-50" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Modelo</label>
                <input type="text" placeholder="Low, High..." value={modelo}
                  onChange={e => setModelo(e.target.value)}
                  className="border border-gray-200 rounded-xl p-3 w-full focus:outline-none focus:ring-2 focus:ring-black bg-gray-50" required />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Referencia (opcional)</label>
                <input type="text" placeholder="CW2288-111" value={referencia}
                  onChange={e => setReferencia(e.target.value)}
                  className="border border-gray-200 rounded-xl p-3 w-full focus:outline-none focus:ring-2 focus:ring-black bg-gray-50" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Descripción (opcional)</label>
              <textarea placeholder="Estado de las suelas, defectos, historia del artículo..." value={descripcion}
                onChange={e => setDescripcion(e.target.value)} rows={3}
                className="border border-gray-200 rounded-xl p-3 w-full focus:outline-none focus:ring-2 focus:ring-black bg-gray-50 resize-none" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
            <h2 className="font-semibold text-gray-700">Detalles de venta</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Talla</label>
                <input type="number" placeholder="42" min="34" max="50" step="0.5" value={talla}
                  onChange={e => setTalla(e.target.value)}
                  className="border border-gray-200 rounded-xl p-3 w-full focus:outline-none focus:ring-2 focus:ring-black bg-gray-50" required />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Precio (€)</label>
                <input type="number" placeholder="150" min="1" value={precio}
                  onChange={e => setPrecio(e.target.value)}
                  className="border border-gray-200 rounded-xl p-3 w-full focus:outline-none focus:ring-2 focus:ring-black bg-gray-50" required />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Estado</label>
                <select value={conservacion} onChange={e => setConservacion(e.target.value)}
                  className="border border-gray-200 rounded-xl p-3 w-full focus:outline-none focus:ring-2 focus:ring-black bg-gray-50">
                  <option value="NUEVO">Nuevo</option>
                  <option value="COMO_NUEVO">Como nuevo</option>
                  <option value="BUENAS_CONDICIONES">Buenas condiciones</option>
                  <option value="USADO">Usado</option>
                  <option value="MUY_USADO">Muy usado</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-700 mb-4">Fotos (máx. 5)</h2>
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:border-black transition"
              onClick={() => document.getElementById('input-imagenes').click()}>
              {previews.length > 0 ? (
                <div className="grid grid-cols-5 gap-2">
                  {previews.map((src, i) => (
                    <img key={i} src={src} alt={`preview ${i}`}
                      className="w-full aspect-square object-contain rounded-xl bg-gray-50" />
                  ))}
                </div>
              ) : (
                <div>
                  <p className="text-4xl mb-2">📸</p>
                  <p className="text-gray-500 font-medium">Haz clic para subir fotos</p>
                  <p className="text-gray-400 text-sm mt-1">JPG, PNG — máximo 5 imágenes</p>
                </div>
              )}
              <input id="input-imagenes" type="file" accept="image/*" multiple
                onChange={handleImagenes} className="hidden" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="bg-black text-white rounded-2xl p-4 font-bold text-lg hover:bg-gray-900 transition disabled:opacity-50 tracking-wide">
            {loading ? 'Publicando...' : 'Publicar anuncio'}
          </button>
        </form>
      </div>
    </div>
  )
}