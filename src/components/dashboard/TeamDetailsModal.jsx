import React, { useState, useEffect } from 'react';
import { 
  Users, 
  X, 
  Check, 
  AlertCircle, 
  UserPlus, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  GraduationCap, 
  Building, 
  Phone, 
  Mail, 
  Hash, 
  Sparkles,
  Save,
  CheckCircle2
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Artificial Intelligence & Data Science',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'MBA / MCA'
];

export const YEARS_OF_STUDY = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year'
];

export default function TeamDetailsModal({ 
  isOpen, 
  onClose, 
  team, 
  onTeamUpdate, 
  onToast 
}) {
  const [members, setMembers] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form input state for adding/editing a member
  const [formData, setFormData] = useState({
    name: '',
    registerNumber: '',
    email: '',
    year: '3rd Year',
    department: 'Computer Science & Engineering',
    phone: ''
  });

  // Initialize members list from team data or pre-fill leader
  useEffect(() => {
    if (team) {
      if (team.members && team.members.length > 0) {
        setMembers(team.members);
      } else {
        // Pre-fill leader as member #1 if empty
        const initialLeader = {
          id: `mem-leader-${Date.now()}`,
          name: '',
          registerNumber: '',
          email: team.email || '',
          year: '3rd Year',
          department: 'Computer Science & Engineering',
          phone: '',
          isLeader: true
        };
        setMembers([initialLeader]);
        setEditingIndex(0);
        setFormData(initialLeader);
      }
    }
  }, [team, isOpen]);

  if (!isOpen) return null;

  const handleOpenAdd = () => {
    if (members.length >= 4) {
      setError('A team can have a maximum of 4 members including the team leader.');
      return;
    }
    soundFx.playClick();
    setError('');
    setSuccess('');
    setFormData({
      name: '',
      registerNumber: '',
      email: '',
      year: '3rd Year',
      department: 'Computer Science & Engineering',
      phone: ''
    });
    setEditingIndex(null);
    setIsAddingNew(true);
  };

  const handleStartEdit = (index) => {
    soundFx.playClick();
    setError('');
    setSuccess('');
    setFormData({ ...members[index] });
    setEditingIndex(index);
    setIsAddingNew(false);
  };

  const handleCancelForm = () => {
    soundFx.playClick();
    setEditingIndex(null);
    setIsAddingNew(false);
    setError('');
  };

  // Save member form to local state & validate
  const handleSaveMemberLocally = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const name = formData.name.trim();
    const registerNumber = formData.registerNumber.trim().toUpperCase();
    const email = formData.email.trim().toLowerCase();
    const year = formData.year.trim();
    const department = formData.department.trim();
    const phone = formData.phone.trim().replace(/\D/g, '');

    // Validation
    if (!name || !registerNumber || !email || !year || !department || !phone) {
      setError('All 6 fields are mandatory for every squad member.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please provide a valid college email address.');
      return;
    }

    if (phone.length !== 10) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    // Check duplicate register number in current members
    const isDuplicate = members.some((m, idx) => {
      if (editingIndex !== null && idx === editingIndex) return false;
      return (m.registerNumber || '').toUpperCase() === registerNumber;
    });

    if (isDuplicate) {
      setError(`Register Number "${registerNumber}" is already assigned to another member in your team.`);
      return;
    }

    let updatedList;
    if (editingIndex !== null) {
      // Editing existing member
      updatedList = members.map((m, idx) => {
        if (idx === editingIndex) {
          return {
            ...m,
            name,
            registerNumber,
            email,
            year,
            department,
            phone,
            isLeader: idx === 0
          };
        }
        return m;
      });
    } else {
      // Adding new member
      if (members.length >= 4) {
        setError('Maximum 4 members reached.');
        return;
      }
      const newMember = {
        id: `mem-${Date.now()}`,
        name,
        registerNumber,
        email,
        year,
        department,
        phone,
        isLeader: members.length === 0
      };
      updatedList = [...members, newMember];
    }

    setMembers(updatedList);
    setEditingIndex(null);
    setIsAddingNew(false);
    soundFx.playSuccess();
    setSuccess('Member details added to roster. Click "Save Team Details" to persist to database.');
  };

  const handleRemoveMember = (index) => {
    if (index === 0) {
      setError('Team Leader slot (Member 1) cannot be removed. You may edit the details.');
      return;
    }
    soundFx.playClick();
    const updated = members.filter((_, idx) => idx !== index);
    setMembers(updated);
    if (editingIndex === index) {
      setEditingIndex(null);
      setIsAddingNew(false);
    }
    setSuccess('Member removed from roster. Click "Save Team Details" to sync.');
  };

  // Submit all members to backend API
  const handlePersistToBackend = async () => {
    setError('');
    setSuccess('');

    if (members.length === 0) {
      setError('Please add at least the Team Leader details.');
      return;
    }

    // Check if any member has incomplete fields
    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.name || !m.registerNumber || !m.email || !m.phone) {
        setError(`Member #${i + 1} (${m.name || 'Unnamed'}) has incomplete details. Please complete all fields before saving.`);
        return;
      }
    }

    try {
      setLoading(true);
      soundFx.playClick();

      const token = localStorage.getItem('elitex_token');
      const res = await fetch('/api/team/members', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ members })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save team member details.');
      }

      soundFx.playSuccess();
      setMembers(data.members || members);
      setSuccess('Team details securely saved to the ELITEX database!');

      // Update parent team state
      if (onTeamUpdate && data.team) {
        onTeamUpdate(data.team);
        localStorage.setItem('elitex_team', JSON.stringify(data.team));
      }

      if (onToast) {
        onToast(`Team Details Updated: ${data.members.length}/4 Members saved.`);
      }

      setTimeout(() => {
        onClose();
      }, 900);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 overflow-hidden max-h-[90vh] flex flex-col justify-between">
        
        {/* Top Decorative Color Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-600"></div>

        {/* Close Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-700 uppercase tracking-widest mb-1">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>TEAM LEADER ROSTER MANAGEMENT · SQUAD ID: {team.teamId}</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-navy-950">
            TEAM DETAILS — {team.teamName}
          </h2>
          <p className="text-xs font-sans text-slate-500 mt-1">
            Configure your 4-member squad. The team leader is Member #1. Exactly four members are permitted per team.
          </p>

          {/* Progress Bar: X/4 Members Added */}
          <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-tech font-bold text-sm text-navy-900 uppercase">
                  Roster Progress:
                </span>
                <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                  members.length === 4 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-blue-100 text-blue-800 border border-blue-300'
                }`}>
                  {members.length}/4 Members Added
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                {members.length === 4 ? 'Squad roster complete and ready for prelims.' : `${4 - members.length} member slot(s) remaining.`}
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full sm:w-48 bg-slate-200 h-2.5 rounded-full overflow-hidden shrink-0">
              <div 
                className={`h-full transition-all duration-300 ${
                  members.length === 4 ? 'bg-emerald-500' : 'bg-blue-600'
                }`}
                style={{ width: `${(members.length / 4) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="my-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-sans leading-relaxed">{error}</span>
          </div>
        )}

        {success && (
          <div className="my-3 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 flex items-start space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="font-sans font-medium leading-relaxed">{success}</span>
          </div>
        )}

        {/* Scrollable Center Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          
          {/* Member Slots (4 total) */}
          <div className="space-y-3">
            {[0, 1, 2, 3].map((slotIdx) => {
              const member = members[slotIdx];
              const isLeader = slotIdx === 0;
              const isSlotEditing = editingIndex === slotIdx;

              if (isSlotEditing) {
                // Inline Edit Form for this slot
                return (
                  <form 
                    key={slotIdx}
                    onSubmit={handleSaveMemberLocally}
                    className="p-5 rounded-2xl bg-slate-50 border-2 border-emerald-500 shadow-sm space-y-4 animate-in fade-in"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="font-tech font-bold text-xs text-emerald-800 uppercase">
                        {isLeader ? 'Member 1 — Team Leader Details' : `Member ${slotIdx + 1} Details`}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">All 6 fields required</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* 1. Full Name */}
                      <div>
                        <label className="block font-mono font-bold text-slate-700 uppercase mb-1">
                          1. Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Deepika P"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      {/* 2. Register Number */}
                      <div>
                        <label className="block font-mono font-bold text-slate-700 uppercase mb-1">
                          2. Register Number *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 950721104015"
                          value={formData.registerNumber}
                          onChange={(e) => setFormData({ ...formData, registerNumber: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      {/* 3. College Email ID */}
                      <div>
                        <label className="block font-mono font-bold text-slate-700 uppercase mb-1">
                          3. College Email ID *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="student@college.edu"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      {/* 4. Year of Study */}
                      <div>
                        <label className="block font-mono font-bold text-slate-700 uppercase mb-1">
                          4. Year of Study *
                        </label>
                        <select
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                        >
                          {YEARS_OF_STUDY.map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>

                      {/* 5. Department */}
                      <div>
                        <label className="block font-mono font-bold text-slate-700 uppercase mb-1">
                          5. Department *
                        </label>
                        <select
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                        >
                          {DEPARTMENTS.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      {/* 6. Phone Number */}
                      <div>
                        <label className="block font-mono font-bold text-slate-700 uppercase mb-1">
                          6. Phone Number (10 Digits) *
                        </label>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          placeholder="e.g. 9876543210"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                          className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={handleCancelForm}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-tech uppercase"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-tech font-bold text-xs uppercase flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm Member Details</span>
                      </button>
                    </div>
                  </form>
                );
              }

              if (member) {
                // Member Card (Filled Slot)
                return (
                  <div 
                    key={slotIdx}
                    className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                        isLeader 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}>
                        #{slotIdx + 1}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-tech font-bold text-base text-navy-950">
                            {member.name || '(Details Incomplete)'}
                          </h4>
                          {isLeader && (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                              TEAM LEADER
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-slate-500 mt-1">
                          <span>Reg: <strong className="text-slate-800">{member.registerNumber || 'Pending'}</strong></span>
                          <span>•</span>
                          <span>Dept: <strong className="text-slate-800">{member.department}</strong> ({member.year})</span>
                          <span>•</span>
                          <span>Ph: <strong className="text-slate-800">{member.phone}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <button
                        onClick={() => handleStartEdit(slotIdx)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-navy-900 transition-colors flex items-center space-x-1 text-xs font-mono"
                        title="Edit member details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      {!isLeader && (
                        <button
                          onClick={() => handleRemoveMember(slotIdx)}
                          className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors text-xs font-mono"
                          title="Remove member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              }

              // Empty Slot
              return (
                <div 
                  key={slotIdx}
                  className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-300 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
                    <span className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center font-bold">
                      #{slotIdx + 1}
                    </span>
                    <span>Slot {slotIdx + 1} Open (Empty Member Slot)</span>
                  </div>

                  {editingIndex === null && !isAddingNew && slotIdx === members.length && (
                    <button
                      onClick={handleOpenAdd}
                      className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-emerald-500 text-slate-700 hover:text-emerald-700 font-tech font-bold text-xs uppercase flex items-center space-x-1.5 transition-colors shadow-xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Add Member #{slotIdx + 1}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add New Member Form (if triggered) */}
          {isAddingNew && (
            <form 
              onSubmit={handleSaveMemberLocally}
              className="p-5 rounded-2xl bg-slate-50 border-2 border-emerald-500 shadow-sm space-y-4 animate-in fade-in"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-tech font-bold text-xs text-emerald-800 uppercase">
                  Add Member #{members.length + 1}
                </span>
                <span className="text-[10px] font-mono text-slate-500">All 6 fields required</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-mono font-bold text-slate-700 uppercase mb-1">
                    1. Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arun Kumar S"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-mono font-bold text-slate-700 uppercase mb-1">
                    2. Register Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 950721104005"
                    value={formData.registerNumber}
                    onChange={(e) => setFormData({ ...formData, registerNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-mono font-bold text-slate-700 uppercase mb-1">
                    3. College Email ID *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@francisxavier.ac.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-mono font-bold text-slate-700 uppercase mb-1">
                    4. Year of Study *
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    {YEARS_OF_STUDY.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono font-bold text-slate-700 uppercase mb-1">
                    5. Department *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono font-bold text-slate-700 uppercase mb-1">
                    6. Phone Number (10 Digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="e.g. 9840123456"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-tech uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-tech font-bold text-xs uppercase flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Add To Roster</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Modal Bottom Action Footer */}
        <div className="pt-4 mt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] font-mono text-slate-500 text-center sm:text-left">
            Maximum 4 members · Associated with <strong className="text-navy-950">{team.teamId}</strong>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-tech font-bold text-xs uppercase transition-colors"
            >
              Close
            </button>

            <button
              type="button"
              disabled={loading || editingIndex !== null || isAddingNew}
              onClick={handlePersistToBackend}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-tech font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>SAVING DETAILS...</span>
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>SAVE TEAM DETAILS</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
