import { useState, useEffect } from 'react';
import api from '../services/api';
import TaskCard from '../components/TaskCard';
import { Plus, Filter, Search, Sparkles, X, ChevronDown, Check } from 'lucide-react';

export default function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        due_date: new Date().toISOString().split('T')[0],
        assigned_to: ''
    });

    const fetchData = async () => {
        try {
            const [tasksRes, usersRes] = await Promise.all([
                api.get('/tasks'),
                api.get('/auth/users')
            ]);
            setTasks(tasksRes.data);
            setUsers(usersRes.data);
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await api.put(`/tasks/${taskId}/status`, { status: newStatus });
            fetchData();
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tasks', formData);
            setShowModal(false);
            setFormData({
                title: '',
                description: '',
                priority: 'Medium',
                due_date: new Date().toISOString().split('T')[0],
                assigned_to: ''
            });
            fetchData();
        } catch (err) {
            console.error("Failed to create task", err);
        }
    };

    if (loading) return (
        <div className="p-20 text-center flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Loading Galaxy...</p>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em] mb-3">
                        <Sparkles size={14} />
                        Team Mission Control
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Team Tasks</h1>
                    <p className="text-slate-500 mt-2 font-medium">Coordinate and track collective objectives in real-time.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary !px-8 !py-4 shadow-2xl hover:scale-105 active:scale-95"
                >
                    <Plus size={20} />
                    NEW OBJECTIVE
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {tasks.map(task => (
                    <div key={task.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <TaskCard
                            task={task}
                            onStatusChange={handleStatusChange}
                        />
                    </div>
                ))}

                {/* Empty State Card */}
                {tasks.length === 0 && (
                    <div className="lg:col-span-12 glass-panel py-32 rounded-[3rem] text-center border-dashed border-2 border-white/5">
                        <div className="w-20 h-20 bg-slate-900 border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner shadow-black/50">
                            <Plus size={40} className="text-slate-700" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-300">No Objectives Set</h3>
                        <p className="text-slate-500 mt-3 max-w-sm mx-auto font-medium">Ready to start something big? Create your first team task to begin tracking progress.</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="mt-8 text-indigo-400 hover:text-indigo-300 font-black text-xs uppercase tracking-widest flex items-center gap-2 mx-auto transition-colors"
                        >
                            ADD FIRST TASK <Plus size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Create Task Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
                    <div className="glass-card w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.15)] ring-1 ring-white/10 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                        <div className="p-8 md:p-12 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
                            <div>
                                <h2 className="text-3xl font-black text-white tracking-tight">New Objective</h2>
                                <p className="text-slate-500 font-medium mt-1">Define project goals and assign ownership.</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-500/20 hover:text-rose-400 transition-all duration-300 shadow-lg border border-white/5"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTask} className="p-8 md:p-12 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Task Identity</label>
                                <input
                                    required
                                    type="text"
                                    className="input-field w-full text-lg font-bold"
                                    placeholder="Task Title (e.g. Protocol Upgrade)"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Context & Details</label>
                                <textarea
                                    className="input-field w-full resize-none min-h-[120px]"
                                    placeholder="Provide details about the mission..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Priority Level</label>
                                    <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/5">
                                        {['Low', 'Medium', 'High'].map(p => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, priority: p })}
                                                className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${formData.priority === p
                                                        ? 'bg-indigo-600 text-white shadow-lg'
                                                        : 'text-slate-500 hover:text-slate-300'
                                                    }`}
                                            >
                                                {p.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Deadline</label>
                                    <input
                                        required
                                        type="date"
                                        className="input-field w-full"
                                        value={formData.due_date}
                                        onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Assign Ownership</label>
                                <select
                                    required
                                    className="input-field w-full appearance-none cursor-pointer"
                                    value={formData.assigned_to}
                                    onChange={e => setFormData({ ...formData, assigned_to: e.target.value })}
                                >
                                    <option value="" disabled className="bg-slate-950">Select Agent</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id} className="bg-slate-950 py-4">
                                            {u.name} — {u.role}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-8 py-4 rounded-2xl bg-slate-800 text-slate-300 font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-colors"
                                >
                                    ABORT
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 btn-primary !py-4 shadow-[0_0_30px_rgba(79,70,229,0.3)]"
                                >
                                    INITIATE MISSION
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
