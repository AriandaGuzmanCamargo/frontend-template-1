import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('auth_token');
    
    // Si no hay token, redirige a login
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    
    // Si hay token, renderiza el contenido
    return children;
};

export default ProtectedRoute;