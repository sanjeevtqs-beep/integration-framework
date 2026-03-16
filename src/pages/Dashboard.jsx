import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TaskCard from '../components/TaskCard';
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    Zap,
    Users,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [standups, setStandups] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [tasksRes, standupsRes] = await Promise.all([
                api.get('/tasks'),
                api.get('/standup/today')
            ]);
            setTasks(tasksRes.data);
            setStandups(standupsRes.data);
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await api.put(`/tasks/${taskId}/status`, { status: newStatus });
            fetchData(); // Refresh list after update
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    // Derived stats
    const pending = tasks.filter(t => t.status !== 'Completed').length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const overdue = tasks.filter(t => new Date(t.due_date) < new Date() && t.status !== 'Completed').length;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-[0.3em] mb-2 px-1">
                        <TrendingUp size={14} />
                        Performance Overview
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
                        Welcome, <span className="bg-gradient-to-br from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">QualitySync Pro</span>
                    </h1>
                    <p className="text-slate-500 mt-3 font-medium text-lg max-w-lg">
                        You have <span className="text-white underline decoration-indigo-500/50 decoration-2">{pending} active commitments</span> for today. Keep pushing!
                    </p>
                </div>
                <Link
                    to="/standup"
                    className="btn-primary group !px-8 !py-4"
                >
                    <ArrowUpRight size={20} className="group-hover:rotate-45 transition-transform duration-300" />
                    SUBMIT STANDUP
                </Link>
            </header>

            {/* Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                    { label: 'Pending Commitments', value: pending, icon: Clock, color: 'indigo' },
                    { label: 'Overdue Tasks', value: overdue, icon: AlertCircle, color: 'rose' },
                    { label: 'Completed Today', value: completed, icon: CheckCircle2, color: 'emerald' }
                ].map((stat) => (
                    <div key={stat.label} className="glass-card hover:border-indigo-500/30 transition-all duration-500 group relative p-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]"></div>
                        <div className="p-7 relative flex items-center gap-6">
                            <div className={`p-5 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-400 ring-1 ring-${stat.color}-500/20 group-hover:scale-110 transition-transform duration-500`}>
                                <stat.icon size={32} />
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                <p className="text-4xl font-black text-white">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-12">
                    <section>
                        <div className="flex justify-between items-end mb-8 px-2">
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight">Active Commitments</h2>
                                <p className="text-slate-500 text-sm font-medium mt-1">Tasks specifically assigned to you</p>
                            </div>
                            <Link to="/tasks" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors group">
                                VIEW ALL <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {tasks.length === 0 ? (
                            <div className="glass-panel py-20 px-6 rounded-[2.5rem] text-center">
                                <div className="w-16 h-16 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Zap size={32} className="text-slate-700" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-300">Clean Slate!</h3>
                                <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">No pending tasks found. Time to relax or take on something new.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {tasks.map(task => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        onStatusChange={handleStatusChange}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                    {/* Completed Today Section */}
                    <section>
                        <div className="flex items-center gap-3 mb-8 px-2">
                            <h2 className="text-2xl font-black text-white tracking-tight">Completed Today</h2>
                            <div className="h-px flex-1 bg-white/5"></div>
                        </div>

                        {tasks.filter(t => t.status === 'Completed').length === 0 ? (
                            <p className="text-slate-600 text-sm font-bold uppercase tracking-widest italic text-center py-10">No tasks completed yet</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80">
                                {tasks.filter(t => t.status === 'Completed').map(task => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        onStatusChange={handleStatusChange}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar Style Updates Area */}
                <div className="lg:col-span-4 space-y-8">
                    <section className="glass-panel p-8 rounded-[2.5rem] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 text-indigo-500/10 pointer-events-none">
                            <Users size={80} />
                        </div>

                        <div className="relative">
                            <h2 className="text-2xl font-black text-white tracking-tight mb-8">Team Updates</h2>
                            <div className="space-y-6">
                                {standups.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <p className="text-slate-600 text-sm font-bold uppercase tracking-widest italic">Waiting for updates...</p>
                                    </div>
                                ) : (
                                    standups.map(update => (
                                        <div key={update.id} className="relative pl-6 border-l-2 border-indigo-500/20 group">
                                            <div className="absolute top-0 -left-[9px] w-4 h-4 rounded-full bg-slate-950 border-2 border-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all group-hover:scale-125"></div>

                                            <div className="mb-4">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-white/5 flex items-center justify-center text-xs font-black text-white shadow-lg">
                                                        {update.User?.name?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white leading-tight">{update.User?.name}</p>
                                                        <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-0.5">
                                                            {new Date(update.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4 px-1">
                                                    <div>
                                                        <p className="text-[10px] uppercase font-black text-slate-500 tracking-[0.25em] mb-1.5 flex items-center gap-2">
                                                            <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
                                                            Yesterday
                                                        </p>
                                                        <p className="text-xs text-slate-300 leading-relaxed font-medium line-clamp-2 italic">"{update.yesterday_work}"</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase font-black text-slate-500 tracking-[0.25em] mb-1.5 flex items-center gap-2">
                                                            <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                                                            Today
                                                        </p>
                                                        <p className="text-xs text-slate-100 leading-relaxed font-bold">"{update.today_plan}"</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
