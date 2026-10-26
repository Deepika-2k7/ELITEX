import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Send, 
  Trash2, 
  Clock, 
  Sparkles, 
  AlertCircle,
  Megaphone
} from 'lucide-react';
import { soundFx } from '../../../utils/audio';

export default function AdminAnnouncementsView({ onToast }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [sending, setSending] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('elitex_admin_token');
      const res = await fetch('/api/admin/announcements', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load announcements.');
      setAnnouncements(data.announcements || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    try {
      setSending(true);
      soundFx.playClick();
      const token = localStorage.getItem('elitex_admin_token');
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, message, priority })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      soundFx.playSuccess();
      if (onToast) onToast('Announcement broadcasted to participants.');
      setTitle('');
      setMessage('');
      setPriority('NORMAL');
      fetchAnnouncements();
    } catch (err) {
      soundFx.playError();
      alert(`Broadcast Error: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('elitex_admin_token');
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      soundFx.playSuccess();
      if (onToast) onToast('Announcement removed.');
      fetchAnnouncements();
    } catch (err) {
      soundFx.playError();
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <h2 className="text-xl font-display font-black text-navy-900 tracking-tight flex items-center space-x-2">
          <Megaphone className="w-5 h-5 text-emerald-600" />
          <span>Hackathon Dispatch & Announcements</span>
        </h2>
        <p className="text-xs text-slate-500 font-tech">
          Broadcast official scheduling changes, prelims guidelines, or emergency notices to all participants.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Broadcast Form */}
      <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-display font-bold text-navy-900 mb-3">
          Create New Participant Dispatch
        </h3>

        <form onSubmit={handleBroadcast} className="space-y-4 text-xs font-tech">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-mono font-bold text-slate-700 uppercase mb-1">Title *</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g., Slot 1 Screening Commences at 9:30 AM Sharp"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div>
              <label className="block font-mono font-bold text-slate-700 uppercase mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono font-bold text-slate-800"
              >
                <option value="NORMAL">Normal Information</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent Alert</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-mono font-bold text-slate-700 uppercase mb-1">Message Content *</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows="3"
              placeholder="Enter announcement text to broadcast..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending || !title.trim() || !message.trim()}
              className="px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-slate-900 text-white font-mono font-bold flex items-center space-x-1.5 shadow-md shadow-navy-900/20 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              <span>{sending ? 'Broadcasting...' : 'Broadcast Dispatch'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        <h3 className="text-sm font-mono font-bold uppercase text-slate-500 tracking-wider">
          Active Dispatches ({announcements.length})
        </h3>

        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-slate-400 bg-white rounded-2xl border border-slate-200">
            Loading announcements...
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-slate-400 bg-white rounded-2xl border border-slate-200">
            No active announcements. Broadcast your first notice above.
          </div>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                    a.priority === 'URGENT' ? 'bg-rose-100 text-rose-800' :
                    a.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {a.priority}
                  </span>
                  <h4 className="font-bold text-navy-900 text-sm">{a.title}</h4>
                </div>
                <p className="text-xs text-slate-600 font-tech leading-relaxed max-w-2xl">{a.message}</p>
                <div className="text-[10px] font-mono text-slate-400">
                  {new Date(a.createdAt).toLocaleString()} · Dispatched by {a.createdBy}
                </div>
              </div>

              <button
                onClick={() => handleDelete(a.id)}
                title="Delete Announcement"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
