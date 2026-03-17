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
    ArrowUpRight,
    Target,
    Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [standups, setStandups] = useState([]);
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [focusMode, setFocusMode] = useState(false);

    const fetchData = async () => {
        try {
            const [tasksRes, standupsRes, metricsRes] = await Promise.all([
                api.get('/tasks'),
                api.get('/standup/today'),
                api.get('/analytics/dashboard')
            ]);
            setTasks(tasksRes.data);
            setStandups(standupsRes.data);
            setMetrics(metricsRes.data.metrics);
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
    const pending = metrics?.pendingCommitments || 0;
    const completed = metrics?.completedToday || 0;
    const overdue = metrics?.overdueTasks || 0;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-pink-600/30 border-t-pink-600 rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div className="w-full">
                    <div className="flex items-center justify-between mb-2 px-1">
                        <div className="flex items-center gap-2 text-pink-400 font-bold text-xs uppercase tracking-[0.3em]">
                            <TrendingUp size={14} />
                            Performance Overview
                        </div>
                        <button 
                            onClick={() => setFocusMode(!focusMode)}
                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${focusMode ? 'bg-amber-500 text-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'}`}
                        >
                            <Zap size={12}/> Focus Mode {focusMode ? 'ON' : 'OFF'}
                        </button>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
                        Welcome, <span className="bg-gradient-to-br from-pink-400 via-fuchsia-400 to-rose-400 bg-clip-text text-transparent">{user?.name || "QualitySync Pro"}</span>
                    </h1>
                    <p className="text-slate-400 text-xl font-bold text-pink-400 mt-2">
                        {metrics?.focusMessage || "Let's make today productive 🚀"}
                    </p>
                    <p className="text-slate-500 mt-3 font-medium text-lg max-w-lg">
                        You have <span className="text-white underline decoration-pink-500/50 decoration-2">{metrics?.activeCommitments || 0} active commitments</span> for today. Keep pushing!
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
            <section className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
                {/* AI Productivity Score Widget */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card hover:border-pink-500/30 transition-all duration-500 group relative p-1 md:col-span-2">
                    <div className="p-6 relative flex items-center justify-between h-full">
                        <div className="flex items-center gap-5">
                            <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20 group-hover:scale-110 transition-transform duration-500">
                                <Target size={28} />
                            </div>
                            <div>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">AI Productivity Score</p>
                                <div className="flex items-center gap-3">
                                    <p className="text-4xl font-black text-white">{metrics?.productivityScore || 0}%</p>
                                    {(metrics?.productivityScore || 0) >= 80 ? (
                                        <span className="text-emerald-400 text-xs font-bold flex items-center gap-1 bg-emerald-400/10 px-2 py-1 rounded-md"><Flame size={12}/> Top Performer</span>
                                    ) : (
                                        <span className="text-pink-400 text-xs font-bold flex items-center gap-1 bg-pink-400/10 px-2 py-1 rounded-md"><TrendingUp size={12}/> Keep Going</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="hidden sm:block text-right pl-4 border-l border-white/5">
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Streak</p>
                            <p className="text-2xl font-black text-amber-400 flex items-center justify-end gap-1"><Flame size={18}/> {metrics?.currentStreak || 0}</p>
                        </div>
                    </div>
                </motion.div>

                {[
                    { label: 'Pending task', value: pending, icon: Clock, color: 'pink' },
                    { label: 'Overdue', value: overdue, icon: AlertCircle, color: 'rose' },
                    { label: 'Done Today', value: completed, icon: CheckCircle2, color: 'emerald' }
                ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card hover:border-pink-500/30 transition-all duration-500 group relative p-1 md:col-span-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]"></div>
                        <div className="p-5 relative flex flex-col justify-between h-full gap-2">
                            <div className={`self-start p-3 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-400 ring-1 ring-${stat.color}-500/20 group-hover:scale-110 transition-transform duration-500`}>
                                <stat.icon size={20} />
                            </div>
                            <div>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1 whitespace-nowrap">{stat.label}</p>
                                <p className="text-3xl font-black text-white">{stat.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </section>

            <div className={`grid grid-cols-1 ${focusMode ? 'lg:grid-cols-1' : 'lg:grid-cols-12'} gap-12`}>
                {/* Main Content Area */}
                <div className={`${focusMode ? 'lg:col-span-1 border border-pink-500/20 rounded-3xl p-6 bg-slate-900/50 shadow-inner' : 'lg:col-span-8'} space-y-12 transition-all duration-500`}>
                    <section>
                        <div className="flex justify-between items-end mb-8 px-2">
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight">Active Commitments</h2>
                                <p className="text-slate-500 text-sm font-medium mt-1">Tasks specifically assigned to you</p>
                            </div>
                            <Link to="/tasks" className="text-xs font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1 transition-colors group">
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
                    {!focusMode && (
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
                    )}
                </div>

                {/* Sidebar Style Updates Area */}
                {!focusMode && (
                    <div className="lg:col-span-4 space-y-8">
                    <section className="glass-panel p-8 rounded-[2.5rem] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 text-pink-500/10 pointer-events-none">
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
                                        <div key={update.id} className="relative pl-6 border-l-2 border-pink-500/20 group">
                                            <div className="absolute top-0 -left-[9px] w-4 h-4 rounded-full bg-slate-950 border-2 border-pink-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all group-hover:scale-125"></div>

                                            <div className="mb-4">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-white/5 flex items-center justify-center text-xs font-black text-white shadow-lg">
                                                        {update.User?.name?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white leading-tight">{update.User?.name}</p>
                                                        <p className="text-[10px] text-pink-400 font-black uppercase tracking-widest mt-0.5">
                                                            {new Date(update.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4 px-1">
                                                    <div>
                                                        <p className="text-[10px] uppercase font-black text-slate-500 tracking-[0.25em] mb-1.5 flex items-center gap-2">
                                                            <div className="w-1 h-1 rounded-full bg-pink-500"></div>
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
                )}
            </div>
        </div>
    );
}
