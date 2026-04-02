import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/login';
import Productos from './pages/Productos';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

const Dashboard = () => (
  <div className="min-h-screen p-4">
    <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
    <p className="mt-4 text-slate-600">Bienvenido al sistema. Selecciona una opción del menú.</p>
    <div className="mt-8 grid grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded shadow">Card 1</div>
      <div className="bg-white p-4 rounded shadow">Card 2</div>
      <div className="bg-white p-4 rounded shadow">Card 3</div>
    </div>
  </div>
);

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/productos" element={<Layout><Productos /></Layout>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;