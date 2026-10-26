import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  Calendar,
  Sparkles,
  TrendingUp,
  HelpCircle
} from 'lucide-react';

export default function AdminAssessmentsView({ onToast }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('elitex_admin_token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/admin/assessments?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to retrieve assessment records.');
      setResults(data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResults();
  };

  // Compute summary stats from actual results
  const completedList = results.filter(r => r.status === 'COMPLETED');
  const avgScore = completedList.length > 0 
    ? (completedList.reduce((acc, curr) => acc + (curr.score || 0), 0) / completedList.length).toFixed(1)
    : 0;
  const maxScoreAchieved = completedList.length > 0
    ? Math.max(...completedList.map(r => r.score || 0))
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <h2 className="text-xl font-display font-black text-navy-900 tracking-tight">
            Phase 1 Assessment Results & Scoring
          </h2>
          <p className="text-xs text-slate-500 font-tech">
            Evaluated live by the server scoring engine against official answer keys.
          </p>
        </div>

        <button
          onClick={fetchResults}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold transition-all disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Scores</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-display font-black text-navy-900">{completedList.length}</div>
            <div className="text-[11px] font-tech text-slate-500">Completed Assessments</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-display font-black text-navy-900">{avgScore} / 12</div>
            <div className="text-[11px] font-tech text-slate-500">Average Candidate Score</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-display font-black text-navy-900">{maxScoreAchieved} / 12</div>
            <div className="text-[11px] font-tech text-slate-500">Top Benchmark Score</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white/80 p-4 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate name, reg no, team..."
            className="w-full pl-9 pr-3 py-1.5 text-xs font-tech bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-slate-700"
        >
          <option value="">All Submission States</option>
          <option value="COMPLETED">Completed & Evaluated</option>
          <option value="IN_PROGRESS">In Progress</option>
        </select>
      </div>

      {/* Results Table */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Candidate</th>
                <th className="py-3.5 px-4">Register No</th>
                <th className="py-3.5 px-4">Team</th>
                <th className="py-3.5 px-4">Slot</th>
                <th className="py-3.5 px-4 text-center">Score</th>
                <th className="py-3.5 px-4 text-center">Percentage</th>
                <th className="py-3.5 px-4">Submitted At</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-tech">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 font-mono">
                    Loading evaluated scoreboards...
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 font-mono">
                    No assessment submissions recorded yet. Once participants start and submit the Phase 1 Prelims quiz, verified scores will appear here.
                  </td>
                </tr>
              ) : (
                results.map((r) => {
                  const passed = (r.percentage || 0) >= 50;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-navy-900">
                        {r.participantName}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {r.registerNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-navy-900">{r.teamId}</span> · {r.teamName}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                        {r.slotTime || 'Unassigned'}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-black text-sm">
                        <span className={passed ? 'text-emerald-600' : 'text-slate-700'}>
                          {r.score}
                        </span>
                        <span className="text-slate-400 font-normal text-xs">/{r.maxScore || 12}</span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                          passed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {r.percentage}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {r.submittedAt ? new Date(r.submittedAt).toLocaleTimeString() : 'In Session'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          r.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
