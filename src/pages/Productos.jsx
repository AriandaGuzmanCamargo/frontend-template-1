import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ShoppingBag, Loader, AlertCircle } from 'lucide-react';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    stock: '',
    id_categoria: '',
    descripcion: '',
    imagen_url: ''
  });

  useEffect(() => {
    cargarProductos();
  }, []);

  const getMensajeErrorCreacion = (error) => {
    const status = error?.status;
    const apiMessage = error?.message;

    if (status === 401 || status === 403) {
      return 'Tu sesión no es válida o expiró. Vuelve a iniciar sesión.';
    }

    if (status === 404) {
      return 'El endpoint protegido de creación no existe en tu API. Verifica la ruta del backend.';
    }

    if (status === 400 || status === 422) {
      return apiMessage || 'Datos inválidos. Revisa los campos del formulario.';
    }

    if (apiMessage) {
      return apiMessage;
    }

    return 'No se pudo crear el producto. Verifica tu sesión y el endpoint protegido.';
  };

  const cargarProductos = async () => {
    try {
      const data = await api.get('/productos'); 
      setProductos(data);
    } catch (err) {
      setError("No se pudo conectar con el servidor. ¿Está encendido?");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const limpiarFormulario = () => {
    setFormData({
      nombre: '',
      precio: '',
      stock: '',
      id_categoria: '',
      descripcion: '',
      imagen_url: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorFormulario(null);

    const precioTexto = formData.precio.trim();
    const stockTexto = formData.stock.trim();
    const categoriaTexto = formData.id_categoria.trim();
    const precio = Number.parseFloat(precioTexto);
    const stock = Number.parseInt(stockTexto, 10);
    const id_categoria = Number.parseInt(categoriaTexto, 10);

    if (!precioTexto || !stockTexto || !categoriaTexto || Number.isNaN(precio) || Number.isNaN(stock) || Number.isNaN(id_categoria)) {
      setErrorFormulario('Precio debe ser numérico; stock y categoría deben ser enteros válidos.');
      return;
    }

    setGuardando(true);

    try {
      const payload = {
        nombre: formData.nombre.trim(),
        precio,
        stock,
        id_categoria
      };

      if (formData.descripcion.trim()) {
        payload.descripcion = formData.descripcion.trim();
      }

      if (formData.imagen_url.trim()) {
        payload.imagen_url = formData.imagen_url.trim();
      }

      const endpointsCreacion = ['/productos/crear'];
      let ultimoError = null;

      for (const endpoint of endpointsCreacion) {
        try {
          await api.post(endpoint, payload);
          ultimoError = null;
          break;
        } catch (err) {
          ultimoError = err;
          if (err?.status !== 404) {
            throw err;
          }
        }
      }

      if (ultimoError) {
        throw ultimoError;
      }

      limpiarFormulario();
      setMostrarFormulario(false);
      await cargarProductos();
    } catch (err) {
      setErrorFormulario(getMensajeErrorCreacion(err));
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader className="animate-spin text-blue-600" size={48} />
    </div>
  );

  if (error) return (
    <div className="bg-red-100 text-red-700 p-4 rounded-lg flex items-center gap-2">
      <AlertCircle /> {error}
    </div>
  );

  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <ShoppingBag className="text-blue-600" /> Inventario
        </h1>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
          {productos.length} items
        </span>
      </header>

      <div className="mb-6">
        <button
          type="button"
          onClick={() => setMostrarFormulario((prev) => !prev)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Nuevo
        </button>
      </div>

      {mostrarFormulario && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-5 mb-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Crear nuevo producto</h2>

          {errorFormulario && (
            <p className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">{errorFormulario}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre"
              className="border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <input
              type="number"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              placeholder="Precio"
              className="border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
              required
            />

            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="Stock"
              className="border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              required
            />

            <input
              type="number"
              name="id_categoria"
              value={formData.id_categoria}
              onChange={handleChange}
              placeholder="Categoría ID"
              className="border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              required
            />

            <input
              type="url"
              name="imagen_url"
              value={formData.imagen_url}
              onChange={handleChange}
              placeholder="URL de imagen (opcional)"
              className="border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Descripción"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />

          <div>
            <button
              type="submit"
              disabled={guardando}
              className="bg-slate-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-900 transition-colors disabled:opacity-60"
            >
              {guardando ? 'Guardando...' : 'Crear producto'}
            </button>
          </div>
        </form>
      )}

      {/* Grid Responsivo: 1 col móvil, 2 tablet, 3 desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {productos.map((prod) => (
          <div key={prod.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 overflow-hidden flex flex-col">
            
            {/* Imagen del producto */}
            <div className="h-48 p-4 bg-white flex items-center justify-center border-b border-slate-50">
              <img 
                src={prod.imagen_url || "https://via.placeholder.com/150"} 
                alt={prod.nombre} 
                className="max-h-full object-contain"
              />
            </div>

            {/* Cuerpo de la tarjeta */}
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-slate-800 line-clamp-1" title={prod.nombre}>
                  {prod.nombre}
                </h3>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-bold">
                  ${prod.precio}
                </span>
              </div>
              
              <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">
                {prod.descripcion || "Sin descripción disponible."}
              </p>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                <span className="text-xs font-medium text-slate-400">
                  Stock: <span className={prod.stock < 10 ? "text-red-500 font-bold" : "text-slate-600"}>{prod.stock}</span>
                </span>
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Editar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Productos;