import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/login';
import Productos from './pages/Productos';
import ProtectedRoute from './components/layout/ProtectedRoute';
const AUTH_TOKEN_KEY = 'auth_token';

const isAuthenticated = () => Boolean(localStorage.getItem(AUTH_TOKEN_KEY));

const PublicRoute = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const Dashboard = () => (
  <div>
    <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
    <p className="mt-4 text-slate-600">Bienvenido al sistema. Selecciona una opción del menú.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={(<PublicRoute><Login /> </PublicRoute>)}
      />

      <Route element = {<ProtectedRoute/>}>
        <Route
          path="/*" element={(
              <Layout>
                <Routes>
                  <Route path='/' element={<Navigate to="/dashboard" replace />}></Route>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/productos" element={<Productos />} />
                </Routes>
              </Layout>
          )}
        />
      </Route>


        <Route
          path="/"
          element={<Navigate to={isAuthenticated() ? '/dashboard' : '/login'} replace />}
        />

        <Route path="*" element={<Navigate to={isAuthenticated() ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;