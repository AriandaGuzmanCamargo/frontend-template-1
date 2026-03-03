import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, LogOut } from 'lucide-react';

const AUTH_TOKEN_KEY = 'auth_token';

const Sidebar = () => {
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 transition-all duration-200 rounded-lg mx-2 mb-1 ${
      isActive 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`;

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem('auth_user');
    navigate('/login', { replace: true });
  };

  return (
    <div className="w-64 h-screen bg-slate-900 text-white fixed left-0 top-0 flex flex-col shadow-xl z-50">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold tracking-wider">
          ADMIN<span className="text-blue-500">PRO</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Panel de Control v1.0</p>
      </div>

      {/* Navegación */}
      <nav className="flex-1 mt-6">
        <NavLink to="/dashboard" className={linkClass}>
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>
        <NavLink to="/productos" className={linkClass}>
          <ShoppingBag size={20} /> Productos
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-slate-800 w-full px-4 py-3 rounded-lg transition"
        >
          <LogOut size={20} /> Salir
        </button>
      </div>
    </div>
  );
};

export default Sidebar;