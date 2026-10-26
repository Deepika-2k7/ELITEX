import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Edit3, 
  ArrowRightLeft, 
  Trash2, 
  AlertCircle, 
  Calendar, 
  Award, 
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';
import { soundFx } from '../../../utils/audio';

export default function AdminParticipantsView({ onToast }) {
  const [participants, setParticipants] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [slotFilter, setSlotFilter] = useState('');

  // Modals
  const [editParticipant, setEditParticipant] = useState(null);
  const [moveParticipant, setMoveParticipant] = useState(null);
  const [deleteConfirmPart, setDeleteConfirmPart] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editIsLeader, setEditIsLeader] = useState(false);

  // Move form state
  const [targetTeamId, setTargetTeamId] = useState('');

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('elitex_admin_token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (teamFilter) params.append('teamId', teamFilter);
      if (slotFilter) params.append('slotId', slotFilter);

      const res = await fetch(`/api/admin/participants?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch participants.');
      setParticipants(data.participants || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem('elitex_admin_token');
      const res = await fetch('/api/admin/teams', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setTeams(data.teams || []);
    } catch (err) {
      console.warn('Failed to load teams for dropdown:', err);
    }
  };

  useEffect(() => {
    fetchParticipants();
    fetchTeams();
  }, [teamFilter, slotFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchParticipants();
  };

  const openEditModal = (p) => {
    setEditParticipant(p);
    setEditName(p.name);
    setEditEmail(p.email);
    setEditPhone(p.phone);
    setEditYear(p.year);
    setEditDept(p.department);
    setEditIsLeader(Boolean(p.isLeader));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      soundFx.playClick();
      const token = localStorage.getItem('elitex_admin_token');
      const res = await fetch(`/api/admin/participants/${editParticipant.registerNumber}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          phone: editPhone,
          year: editYear,
          department: editDept,
          isLeader: editIsLeader
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      soundFx.playSuccess();
      if (onToast) onToast(`Participant ${editParticipant.registerNumber} updated.`);
      setEditParticipant(null);
      fetchParticipants();
    } catch (err) {
      soundFx.playError();
      alert(`Edit Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveMove = async (e) => {
    e.preventDefault();
    if (!targetTeamId) return;

    try {
      setActionLoading(true);
      soundFx.playClick();
      const token = localStorage.getItem('elitex_admin_token');
      const res = await fetch(`/api/admin/participants/${moveParticipant.registerNumber}/move`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ targetTeamId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      soundFx.playSuccess();
      if (onToast) onToast(`Participant ${moveParticipant.name} transferred to Team ${targetTeamId}.`);
      setMoveParticipant(null);
      fetchParticipants();
      fetchTeams();
    } catch (err) {
      soundFx.playError();
      alert(`Transfer Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmPart) return;
    try {
      setActionLoading(true);
      soundFx.playClick();
      const token = localStorage.getItem('elitex_admin_token');
      const res = await fetch(`/api/admin/participants/${deleteConfirmPart.registerNumber}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      soundFx.playSuccess();
      if (onToast) onToast(`Participant ${deleteConfirmPart.registerNumber} removed.`);
      setDeleteConfirmPart(null);
      fetchParticipants();
      fetchTeams();
    } catch (err) {
      soundFx.playError();
      alert(`Delete Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <h2 className="text-xl font-display font-black text-navy-900 tracking-tight">
            Participant Roster ({participants.length})
          </h2>
          <p className="text-xs text-slate-500 font-tech">
            Individual student registration records, assigned tracks, assessment marks, and compliance status.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, reg no, email..."
              className="w-full pl-9 pr-3 py-1.5 text-xs font-tech bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </form>

          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="w-full sm:w-auto text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-slate-700"
          >
            <option value="">All Teams</option>
            {teams.map(t => (
              <option key={t.teamId} value={t.teamId}>{t.teamId} · {t.teamName}</option>
            ))}
          </select>

          <select
            value={slotFilter}
            onChange={(e) => setSlotFilter(e.target.value)}
            className="w-full sm:w-auto text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-slate-700"
          >
            <option value="">All Slots</option>
            <option value="slot-1">Slot 1 (9:30 AM)</option>
            <option value="slot-2">Slot 2 (11:00 AM)</option>
            <option value="slot-3">Slot 3 (1:30 PM)</option>
            <option value="slot-4">Slot 4 (2:45 PM)</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Participants Table */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Participant</th>
                <th className="py-3.5 px-4">Register No</th>
                <th className="py-3.5 px-4">Team Association</th>
                <th className="py-3.5 px-4">Dept / Year</th>
                <th className="py-3.5 px-4">Phase 1 Slot</th>
                <th className="py-3.5 px-4 text-center">Score</th>
                <th className="py-3.5 px-4 text-center">Flags</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-tech">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 font-mono">
                    Retrieving participant records...
                  </td>
                </tr>
              ) : participants.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 font-mono">
                    No participants found matching the criteria.
                  </td>
                </tr>
              ) : (
                participants.map((p) => {
                  return (
                    <tr key={p.registerNumber} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-navy-900 flex items-center space-x-1.5">
                          <span>{p.name}</span>
                          {p.isLeader && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold">
                              LEADER
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">{p.email}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {p.registerNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-navy-900">{p.teamId}</div>
                        <div className="text-[11px] text-slate-500">{p.teamName}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                        <div>{p.department}</div>
                        <div className="font-mono text-slate-400">{p.year}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        {p.slotId ? (
                          <span className="text-emerald-700 font-bold">{p.slotTime}</span>
                        ) : (
                          <span className="text-amber-500">Unbooked</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono">
                        {p.score !== null && p.score !== undefined ? (
                          <span className="font-bold text-emerald-600">
                            {p.score}/{p.maxScore || 12} ({p.percentage}%)
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {p.hasMalpractice ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-mono font-bold flex items-center justify-center space-x-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>FLAGGED</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] font-mono">Clean</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => openEditModal(p)}
                          title="Edit Information"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setMoveParticipant(p);
                            setTargetTeamId('');
                          }}
                          title="Move to Another Team"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmPart(p)}
                          title="Remove Participant"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------- EDIT PARTICIPANT MODAL ----------------- */}
      {editParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-display font-black text-navy-900 mb-1">
              Edit Participant Details
            </h3>
            <p className="text-xs text-slate-500 font-tech mb-4">
              Reg No: <span className="font-mono font-bold text-navy-900">{editParticipant.registerNumber}</span>
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs font-tech">
              <div>
                <label className="block font-mono font-bold text-slate-700 uppercase mb-1">Full Name</label>
                <input 
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="block font-mono font-bold text-slate-700 uppercase mb-1">Email ID</label>
                <input 
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono font-bold text-slate-700 uppercase mb-1">Phone</label>
                  <input 
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-mono font-bold text-slate-700 uppercase mb-1">Year</label>
                  <input 
                    type="text"
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono font-bold text-slate-700 uppercase mb-1">Department</label>
                <input 
                  type="text"
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input 
                  type="checkbox"
                  id="isLeaderCheck"
                  checked={editIsLeader}
                  onChange={(e) => setEditIsLeader(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-400"
                />
                <label htmlFor="isLeaderCheck" className="font-mono font-bold text-slate-700 text-xs">
                  Designate as Team Leader
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditParticipant(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-navy-900 hover:bg-slate-900 text-white font-mono font-bold"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MOVE PARTICIPANT MODAL ----------------- */}
      {moveParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-display font-black text-navy-900 mb-1">
              Transfer Participant to Another Team
            </h3>
            <p className="text-xs text-slate-500 font-tech mb-4">
              Moving <span className="font-bold text-navy-900">{moveParticipant.name}</span> ({moveParticipant.registerNumber}) from current Team <span className="font-mono font-bold">{moveParticipant.teamId}</span>.
            </p>

            <form onSubmit={handleSaveMove} className="space-y-4 text-xs font-tech">
              <div>
                <label className="block font-mono font-bold text-slate-700 uppercase mb-1">
                  Select Target Destination Team
                </label>
                <select
                  value={targetTeamId}
                  onChange={(e) => setTargetTeamId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono font-bold text-slate-800"
                >
                  <option value="">Choose target team...</option>
                  {teams
                    .filter(t => t.teamId !== moveParticipant.teamId && (t.membersCount || 0) < 4)
                    .map(t => (
                      <option key={t.teamId} value={t.teamId}>
                        {t.teamId} · {t.teamName} ({t.membersCount || 0}/4 members)
                      </option>
                    ))
                  }
                </select>
                <div className="text-[10px] text-slate-400 mt-1">
                  Only teams with vacancies (under 4 members) are eligible.
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMoveParticipant(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !targetTeamId}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-mono font-bold disabled:opacity-50"
                >
                  {actionLoading ? 'Transferring...' : 'Transfer Participant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- DELETE PARTICIPANT CONFIRMATION ----------------- */}
      {deleteConfirmPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-rose-200 p-6">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-display font-black text-navy-900 mb-1">
              Remove Participant {deleteConfirmPart.name}?
            </h3>
            <p className="text-xs text-slate-600 font-tech mb-4 leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-navy-900">{deleteConfirmPart.name}</span> (Register No: {deleteConfirmPart.registerNumber}) from Team {deleteConfirmPart.teamId}?
              Their slot booking and assessment score will also be deleted.
            </p>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmPart(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs shadow-md shadow-rose-600/20"
              >
                {actionLoading ? 'Removing...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
