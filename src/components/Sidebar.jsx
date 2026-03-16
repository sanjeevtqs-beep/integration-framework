import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    MessageSquarePlus,
    CheckSquare,
    BarChart3,
    LogOut,
    Users,
    Zap
} from 'lucide-react';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Daily Stand-up', path: '/standup', icon: MessageSquarePlus },
        { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    ];

    if (user?.role === 'Manager/Admin') {
        navItems.push({ name: 'Admin View', path: '/admin', icon: BarChart3 });
    }

    return (
        <div className="w-72 glass-panel border-r border-white/5 flex flex-col h-full hidden md:flex transition-all duration-500 hover:border-indigo-500/20">
            <div className="p-8">
                <div className="flex items-center gap-3 mb-2 group">
                    <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform duration-300">
                        <Zap size={22} className="text-white fill-white" />
                    </div>
                    <h1 className="text-2xl font-black bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent tracking-tight">
                        QualitySync Pro
                    </h1>
                </div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-[0.2em] mt-6 flex items-center gap-2">
                    Main Menu
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname.startsWith(item.path);

                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${isActive
                                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 ring-1 ring-white/10'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon size={20} className={`transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`} />
                            <span className="font-semibold tracking-wide">{item.name}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"></div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="px-6 py-6 border-t border-white/5 bg-slate-950/20">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-sm font-bold shadow-lg ring-2 ring-white/5">
                        {user?.name?.[0] || 'U'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-slate-100 truncate">{user?.name || 'User'}</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{user?.role || 'Team Member'}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-1">Team Online</h3>
                    <div className="grid grid-cols-4 gap-2 px-1">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="relative group">
                                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center text-[10px] text-slate-400 group-hover:border-indigo-500/50 group-hover:text-indigo-400 transition-all cursor-pointer">
                                    {String.fromCharCode(64 + i)}
                                </div>
                                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950 shadow-emerald-500/20 shadow-sm"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-white/5">
                <button
                    onClick={logout}
                    className="flex items-center gap-4 w-full px-5 py-3.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 rounded-2xl transition-all duration-300 font-semibold group"
                >
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
