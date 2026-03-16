import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Standup from './pages/Standup';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';

// Layout Wrapper
const ProtectedLayout = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="h-screen flex items-center justify-center text-slate-400">Loading Session...</div>;
    if (!user) return <Navigate to="/login" replace />;

    return (
        <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route path="/" element={<Navigate to="/dashboard" replace />} />

                    <Route path="/dashboard" element={
                        <ProtectedLayout>
                            <Dashboard />
                        </ProtectedLayout>
                    } />

                    <Route path="/standup" element={
                        <ProtectedLayout>
                            <Standup />
                        </ProtectedLayout>
                    } />

                    <Route path="/tasks" element={
                        <ProtectedLayout>
                            <Tasks />
                        </ProtectedLayout>
                    } />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
