import { useState } from 'react';
import { Clock, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, History } from 'lucide-react';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Completed'];

export default function TaskCard({ task, onStatusChange }) {
    const [showLog, setShowLog] = useState(false);
    const [changing, setChanging] = useState(false);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'text-rose-400 bg-rose-400/10 border-rose-400/20 shadow-rose-900/10';
            case 'Medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20 shadow-amber-900/10';
            default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20 shadow-blue-900/10';
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Completed': return 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20';
            case 'In Progress': return 'text-indigo-400 bg-indigo-400/10 border-indigo-500/20';
            default: return 'text-slate-400 bg-slate-800/20 border-white/5';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completed': return <CheckCircle2 size={16} />;
            case 'In Progress': return <Clock size={16} />;
            default: return <AlertCircle size={16} />;
        }
    };

    const handleStatusSelect = async (e) => {
        const newStatus = e.target.value;
        if (newStatus === task.status || !onStatusChange) return;
        setChanging(true);
        await onStatusChange(task.id, newStatus);
        setChanging(false);
    };

    const formatTime = (ts) => {
        const d = new Date(ts);
        return d.toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="glass-card p-6 rounded-[2rem] group hover:scale-[1.01] transition-all duration-500 relative overflow-hidden flex flex-col">
            {/* Background Glow */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 blur-[50px] opacity-20 pointer-events-none transition-all duration-700 group-hover:opacity-40 ${
                task.status === 'Completed' ? 'bg-emerald-500' :
                task.status === 'In Progress' ? 'bg-indigo-500 animate-pulse' : 'bg-slate-500'
            }`} />

            {/* Priority + Status Badge */}
            <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getPriorityColor(task.priority)}`}>
                    {task.priority || 'Normal'}
                </span>
                <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${getStatusStyle(task.status)}`}>
                    {getStatusIcon(task.status)}
                    <span className="uppercase tracking-widest">{task.status}</span>
                </div>
            </div>

            {/* Title + Description */}
            <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-indigo-300 transition-colors">
                {task.title}
            </h3>
            <p className="text-sm mb-4 line-clamp-2 leading-relaxed font-medium text-slate-400">
                {task.description || 'No description provided.'}
            </p>

            {/* Due Date */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold border-t border-white/5 pt-4 mb-4">
                <Clock size={14} className="text-slate-600" />
                <span>DUE: {new Date(task.due_date).toLocaleDateString('en-IN')}</span>
            </div>

            {/* ✅ Status Editor Dropdown */}
            <div className="mb-4">
                <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 font-bold">Update Status</label>
                <select
                    value={task.status}
                    onChange={handleStatusSelect}
                    disabled={changing}
                    className="w-full bg-slate-900 border border-white/10 text-slate-200 text-sm font-medium rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-50 transition-all"
                >
                    {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            {/* ✅ Activity Time Log Toggle */}
            {task.history && task.history.length > 0 && (
                <div>
                    <button
                        onClick={() => setShowLog(!showLog)}
                        className="flex items-center gap-2 text-xs text-slate-400 hover:text-indigo-400 font-bold transition-colors w-full"
                    >
                        <History size={14} />
                        <span>Activity Log ({task.history.length})</span>
                        {showLog ? <ChevronUp size={14} className="ml-auto" /> : <ChevronDown size={14} className="ml-auto" />}
                    </button>

                    {showLog && (
                        <div className="mt-3 space-y-2 border-l-2 border-indigo-500/30 pl-3">
                            {task.history.map((entry, i) => (
                                <div key={i} className="text-xs">
                                    <p className="text-slate-300 font-medium">{entry.update_text}</p>
                                    <p className="text-slate-600 mt-0.5 flex items-center gap-1">
                                        <Clock size={10} />
                                        {formatTime(entry.timestamp)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
