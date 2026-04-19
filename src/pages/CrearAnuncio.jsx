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
  const [imagen, setImagen] = useState(null)
  const [preview, setPreview] = useState(null)

  function handleImagen(e) {
    const file = e.target.files[0]
    if (file) {
      setImagen(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: producto, error: errorProducto } = await supabase
      .from('productos')
      .insert({ nombre, marca, modelo, referencia })
      .select()
      .single()

    if (errorProducto) {
      setError('Error al crear el producto')
      setLoading(false)
      return
    }

    let imagen_url = null
    if (imagen) {
      const extension = imagen.name.split('.').pop()
      const path = `${user.id}/${producto.id}.${extension}`
      const { error: errorStorage } = await supabase.storage
        .from('anuncios')
        .upload(path, imagen)

      if (!errorStorage) {
        const { data: urlData } = supabase.storage
          .from('anuncios')
          .getPublicUrl(path)
        imagen_url = urlData.publicUrl
      }
    }

    const { error: errorAnuncio } = await supabase
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

    if (errorAnuncio) {
      setError('Error al crear el anuncio')
      setLoading(false)
      return
    }

    navigate('/catalogo')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="py-10 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md p-8">
          <h1 className="text-2xl font-bold mb-6">Publicar anuncio</h1>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input type="text" placeholder="Marca (ej: Nike)" value={marca}
              onChange={e => setMarca(e.target.value)}
              className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black" required />
            <input type="text" placeholder="Nombre (ej: Air Force 1)" value={nombre}
              onChange={e => setNombre(e.target.value)}
              className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black" required />
            <input type="text" placeholder="Modelo" value={modelo}
              onChange={e => setModelo(e.target.value)}
              className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black" required />
            <input type="text" placeholder="Referencia (ej: CW2288-111)" value={referencia}
              onChange={e => setReferencia(e.target.value)}
              className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black" />
            <input type="number" placeholder="Talla (ej: 42)" value={talla}
              onChange={e => setTalla(e.target.value)}
              className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black" required />
            <input type="number" placeholder="Precio (€)" value={precio}
              onChange={e => setPrecio(e.target.value)}
              className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black" required />
            <select value={conservacion} onChange={e => setConservacion(e.target.value)}
              className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black">
              <option value="NUEVO">Nuevo</option>
              <option value="COMO_NUEVO">Como nuevo</option>
              <option value="BUENAS_CONDICIONES">Buenas condiciones</option>
              <option value="USADO">Usado</option>
              <option value="MUY_USADO">Muy usado</option>
            </select>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-black transition"
              onClick={() => document.getElementById('input-imagen').click()}>
              {preview ? (
                <img src={preview} alt="preview" className="max-h-48 mx-auto rounded-lg object-cover" />
              ) : (
                <p className="text-gray-400 text-sm">Haz clic para subir una foto</p>
              )}
              <input id="input-imagen" type="file" accept="image/*"
                onChange={handleImagen} className="hidden" />
            </div>

            <button type="submit" disabled={loading}
              className="bg-black text-white rounded-lg p-3 font-semibold hover:bg-gray-800 transition disabled:opacity-50">
              {loading ? 'Publicando...' : 'Publicar anuncio'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}