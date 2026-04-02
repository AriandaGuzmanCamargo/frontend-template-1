import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Lock, Mail, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            setError('Completa correo y contraseña.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await api.post('/auth/login', { email, password });
            const token = data?.token || data?.accessToken || data?.jwt;

            if (!token) {
                setError('Usuario o contraseña incorrectos.');
                return;
            }

            // Guardar token en contexto y localStorage
            login(token);
            if (data?.user) {
                localStorage.setItem('auth_user', JSON.stringify(data.user));
            }

            // Navegar al dashboard
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError('Usuario o contraseña incorrectos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 rounded-full bg-purple-200 mx-auto flex items-center justify-center mb-4">
                        <Lock className="text-pink-600" size={24} />
                    </div>
                    <h1 className="text-pink-800 text-2xl font-bold text-slate-800">Iniciar sesión</h1>
                    <p className="text-slate-500 mt-1">Accede al panel de administración</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-red-600 block text-sm font-medium text-slate-700 mb-1">Correo</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="tu@correo.com"
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-red-600 block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 flex items-center gap-2 text-sm">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-400 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span>Ingresando...</span>
                        ) : (
                            <>
                                <LogIn size={18} />
                                <span>Entrar</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;