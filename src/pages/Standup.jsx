import { useState } from 'react';
import api from '../services/api';
import { Send, LayoutDashboard, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Standup() {
    const [yesterday, setYesterday] = useState('');
    const [today, setToday] = useState('');
    const [blockers, setBlockers] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e, isDraft = false) => {
        if (e) e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            await api.post('/standup', {
                yesterday_work: yesterday,
                today_plan: today,
                blockers,
                is_draft: isDraft
            });
            if (isDraft) {
                setMessage('Draft saved successfully! You can resume it later.');
            } else {
                setMessage('Stand-up submitted successfully!');
                setYesterday('');
                setToday('');
                setBlockers('');
            }
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to submit stand-up');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <header className="mb-12 relative">
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-pink-600/10 blur-[60px] pointer-events-none"></div>
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                        <Sparkles size={18} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Daily Ritual</span>
                </div>
                <h1 className="text-4xl font-black text-white tracking-tight">Daily Stand-up</h1>
                <p className="text-slate-500 mt-2 font-medium text-lg italic">"Small steps today, giant leaps tomorrow."</p>
            </header>

            {message && (
                <div className={`p-5 rounded-2xl mb-8 font-bold border animate-in fade-in slide-in-from-top-4 duration-300 flex items-center gap-3 ${message.includes('success')
                        ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/5 text-rose-400 border-rose-500/20'
                    }`}>
                    <div className={`w-2 h-2 rounded-full ${message.includes('success') ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'}`}></div>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="glass-card p-10 rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 text-white/5 pointer-events-none group-hover:text-pink-500/10 transition-colors duration-700">
                    <Send size={120} />
                </div>

                <div className="space-y-8 relative">
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                            Yesterday's Impact
                        </label>
                        <textarea
                            required
                            rows={3}
                            className="input-field w-full group-hover:border-pink-500/30 resize-none"
                            placeholder="What did you conquer yesterday?"
                            value={yesterday}
                            onChange={(e) => setYesterday(e.target.value)}
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                            Today's Mission
                        </label>
                        <textarea
                            required
                            rows={3}
                            className="input-field w-full group-hover:border-cyan-500/30 resize-none"
                            placeholder="What's your primary focus for today?"
                            value={today}
                            onChange={(e) => setToday(e.target.value)}
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Any Roadblocks?
                        </label>
                        <textarea
                            rows={2}
                            className="input-field w-full group-hover:border-rose-500/30 resize-none"
                            placeholder="Type any blockers here (or leave empty)..."
                            value={blockers}
                            onChange={(e) => setBlockers(e.target.value)}
                        />
                    </div>

                    <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                        <Link to="/dashboard" className="text-xs font-bold text-slate-500 hover:text-pink-400 transition-colors flex items-center gap-2">
                            <LayoutDashboard size={14} />
                            BACK TO DASHBOARD
                        </Link>
                        <div className="flex w-full md:w-auto gap-4">
                            <button
                                type="button"
                                onClick={(e) => handleSubmit(e, true)}
                                disabled={loading}
                                className="px-6 py-4 rounded-2xl bg-slate-800 text-slate-300 font-black text-xs uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-all w-full md:w-auto border border-slate-700"
                            >
                                SAVE DRAFT
                            </button>
                            <button
                                type="submit"
                                onClick={(e) => handleSubmit(e, false)}
                                disabled={loading || !yesterday || !today}
                                className="btn-primary !px-8 !py-4 w-full md:w-auto bg-gradient-to-r hover:from-pink-500 hover:to-fuchsia-400"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        SENDING...
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} />
                                        SUBMIT MISSION
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
