import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ShoppingBag, Loader, AlertCircle, Plus, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const extraerYoutubeId = (valor) => {
  const texto = String(valor || '').trim();

  if (!texto) {
    return '';
  }

  if (/^[\w-]{11}$/.test(texto)) {
    return texto;
  }

  const matchEmbed = texto.match(/youtube\.com\/embed\/([\w-]{11})/i);
  if (matchEmbed?.[1]) {
    return matchEmbed[1];
  }

  const matchWatch = texto.match(/[?&]v=([\w-]{11})/i);
  if (matchWatch?.[1]) {
    return matchWatch[1];
  }

  const matchShort = texto.match(/youtu\.be\/([\w-]{11})/i);
  if (matchShort?.[1]) {
    return matchShort[1];
  }

  const matchShorts = texto.match(/youtube\.com\/shorts\/([\w-]{11})/i);
  if (matchShorts?.[1]) {
    return matchShorts[1];
  }

  return '';
};

const Productos = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorFormulario, setErrorFormulario] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [formularioVisible, setFormularioVisible] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    precio: '',
    stock: '',
    descripcion: '',
    imagen_url: '',
    id_categoria: '',
    youtube_id: '',
    latitud: '',
    longitud: ''
  });

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const data = await api.get('/productos');
        setProductos(data);
      } catch (err) {
        if (err.message && err.message.includes('401')) {
          localStorage.removeItem('auth_token');
          navigate('/login');
        }
        setError("Error al conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    };
    cargarProductos();
  }, [navigate]);

  const handleCrear = async (e) => {
    e.preventDefault();

    setErrorFormulario('');
    setGuardando(true);

    const precio = Number.parseFloat(nuevoProducto.precio);
    const stock = Number.parseInt(nuevoProducto.stock, 10);
    const id_categoria = Number.parseInt(nuevoProducto.id_categoria, 10);
    const latitud = Number.parseFloat(nuevoProducto.latitud);
    const longitud = Number.parseFloat(nuevoProducto.longitud);
    const youtube_id = extraerYoutubeId(nuevoProducto.youtube_id);

    if (!nuevoProducto.nombre.trim()) {
      setErrorFormulario('El nombre es obligatorio.');
      setGuardando(false);
      return;
    }

    if (Number.isNaN(precio) || precio < 0) {
      setErrorFormulario('El precio debe ser un numero valido.');
      setGuardando(false);
      return;
    }

    if (Number.isNaN(stock) || stock < 0) {
      setErrorFormulario('El stock debe ser un entero valido.');
      setGuardando(false);
      return;
    }

    if (Number.isNaN(id_categoria) || id_categoria <= 0) {
      setErrorFormulario('La categoria debe ser un entero mayor a 0.');
      setGuardando(false);
      return;
    }

    if (nuevoProducto.youtube_id.trim() && !youtube_id) {
      setErrorFormulario('El YouTube ID o URL no es valido.');
      setGuardando(false);
      return;
    }

    if (nuevoProducto.latitud.trim() && Number.isNaN(latitud)) {
      setErrorFormulario('La latitud debe ser un numero valido.');
      setGuardando(false);
      return;
    }

    if (nuevoProducto.longitud.trim() && Number.isNaN(longitud)) {
      setErrorFormulario('La longitud debe ser un numero valido.');
      setGuardando(false);
      return;
    }

    const payload = {
      nombre: nuevoProducto.nombre.trim(),
      precio,
      stock,
      descripcion: nuevoProducto.descripcion.trim(),
      imagen_url: nuevoProducto.imagen_url.trim(),
      id_categoria
    };

    if (youtube_id) {
      payload.youtube_id = youtube_id;
    }

    if (nuevoProducto.latitud.trim()) {
      payload.latitud = latitud;
    }

    if (nuevoProducto.longitud.trim()) {
      payload.longitud = longitud;
    }

    try {
      let data;

      try {
        data = await api.post('/productos/crear', payload);
      } catch {
        data = await api.post('/productos', payload);
      }

      const creado = data?.producto || data;
      if (creado) {
        setProductos((prev) => [...prev, creado]);
      } else {
        const list = await api.get('/productos');
        setProductos(list);
      }

      setFormularioVisible(false);
      setNuevoProducto({
        nombre: '',
        precio: '',
        stock: '',
        descripcion: '',
        imagen_url: '',
        id_categoria: '',
        youtube_id: '',
        latitud: '',
        longitud: ''
      });
    } catch (err) {
      setErrorFormulario(err?.message || 'Error al crear el producto.');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-blue-600" size={48} /></div>;
  if (error) return <div className="bg-red-100 text-red-700 p-4 rounded-lg flex items-center gap-2"><AlertCircle /> {error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <ShoppingBag className="text-blue-600" /> Inventario
        </h1>
        <button onClick={() => setFormularioVisible(!formularioVisible)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          {formularioVisible ? <><X size={20}/> Cancelar</> : <><Plus size={20}/> Nuevo Producto</>}
        </button>
      </div>

      {formularioVisible && (
        <form onSubmit={handleCrear} className="bg-white p-6 rounded-xl shadow-sm mb-8 grid grid-cols-2 gap-4 border border-slate-200">
          {errorFormulario && (
            <p className="col-span-2 bg-red-100 text-red-700 p-3 rounded text-sm">{errorFormulario}</p>
          )}

          <input type="text" placeholder="Nombre" required className="p-2 border rounded" value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} />
          <input type="number" placeholder="Precio" required min="0" step="0.01" className="p-2 border rounded" value={nuevoProducto.precio} onChange={e => setNuevoProducto({...nuevoProducto, precio: e.target.value})} />
          <input type="number" placeholder="Stock" required min="0" className="p-2 border rounded" value={nuevoProducto.stock} onChange={e => setNuevoProducto({...nuevoProducto, stock: e.target.value})} />
          <input type="number" placeholder="ID categoria" required min="1" className="p-2 border rounded" value={nuevoProducto.id_categoria} onChange={e => setNuevoProducto({...nuevoProducto, id_categoria: e.target.value})} />
          <input type="url" placeholder="URL Imagen" className="p-2 border rounded" value={nuevoProducto.imagen_url} onChange={e => setNuevoProducto({...nuevoProducto, imagen_url: e.target.value})} />
          <input type="text" placeholder="ID o URL de YouTube" className="p-2 border rounded" value={nuevoProducto.youtube_id} onChange={e => setNuevoProducto({...nuevoProducto, youtube_id: e.target.value})} />
          <input type="number" placeholder="Latitud" step="any" className="p-2 border rounded" value={nuevoProducto.latitud} onChange={e => setNuevoProducto({...nuevoProducto, latitud: e.target.value})} />
          <input type="number" placeholder="Longitud" step="any" className="p-2 border rounded" value={nuevoProducto.longitud} onChange={e => setNuevoProducto({...nuevoProducto, longitud: e.target.value})} />
          <textarea placeholder="Descripcion" className="p-2 border rounded col-span-2" rows={3} value={nuevoProducto.descripcion} onChange={e => setNuevoProducto({...nuevoProducto, descripcion: e.target.value})} />
          <button type="submit" disabled={guardando} className="col-span-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold disabled:opacity-60">{guardando ? 'Guardando...' : 'Guardar Producto'}</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productos.map((prod) => (
          <div key={prod.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-slate-100 overflow-hidden flex flex-col">
            <div className="h-48 bg-slate-900 flex items-center justify-center border-b overflow-hidden">
              {prod.youtube_id ? (
                <iframe width="100%" height="100%"
                        src={`https://www.youtube.com/embed/${prod.youtube_id}`}
                        title="YouTube video player" frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen></iframe>
              ) : (
                <img src={prod.imagen_url || "https://via.placeholder.com/150"} alt={prod.nombre} className="max-h-full object-contain bg-white w-full" />
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{prod.nombre}</h3>
              <div className="flex justify-between items-center mt-auto pt-4">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">${prod.precio}</span>
                <span className="text-xs text-slate-400">Stock: {prod.stock}</span>
              </div>
            </div>
            
            {/*seccion del mapa*/}
            <div className='h-48 w-full border-t border-slate-100 z-0 relative'>
              <MapContainer 
                center={[prod.latitud ||19.432608, prod.longitud || -99.133209]}
                zoom={13}
                style={{ height: '100%', width: '100%', zIndex: 0 }}
              >
              {/*Este es el servidor de openstreetmap que nos arregla los maps gratis*/}
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap'
                />
                <Marker position={[prod.latitud ||19.432608, prod.longitud || -99.133209]}>
                  <Popup>
                    <div>
                      Ubicacion de: <strong>{prod.nombre}</strong>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default Productos;