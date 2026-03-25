import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Shield, Search, Filter, AlertTriangle, CheckCircle, ArrowRight, User, Users, DollarSign, Flag, FileText } from 'lucide-react';
import PageBackground from '../components/PageBackground';

export default function AdminDisputesPage() {
  const { user } = useContext(AuthContext);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [actionNotes, setActionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmPending, setConfirmPending] = useState(null); // 'RELEASE' | 'REFUND' | null

  useEffect(() => {
    fetchDisputes();
  }, [filter]);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/support/disputes?status=${filter}`);
      setDisputes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDisputeDetails = async (id) => {
    try {
      const { data } = await api.get(`/support/disputes/${id}`);
      setSelectedDispute(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async () => {
    if (!confirmPending) return;
    setActionLoading(true);
    try {
      await api.post(`/support/disputes/${selectedDispute.dispute_id}/resolve`, {
        decision: confirmPending,
        notes: actionNotes
      });
      setSelectedDispute(null);
      setActionNotes('');
      setConfirmPending(null);
      fetchDisputes();
    } catch (err) {
      console.error(err.response?.data?.detail || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen pt-20 pb-16 bg-[#070e1c] flex items-center justify-center text-white">
        <PageBackground variant="dark" />
        <div className="z-10 text-center"><AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />Access Denied</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 bg-[#070e1c]">
      <PageBackground variant="dark" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 flex flex-col md:flex-row gap-6">
        
        {/* LEFT LIST */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-black text-white flex items-center gap-3">
              <Shield className="text-indigo-400" />
              Disputes Admin
            </h1>
          </div>

          <div className="flex bg-white/[0.04] border border-white/[0.08] rounded-xl p-1 mb-2">
            {['all', 'open', 'resolved'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 text-xs font-bold py-2 rounded-lg capitalize transition-all ${filter === f ? 'bg-indigo-500/20 text-indigo-400 shadow' : 'text-white/40 hover:text-white/80'}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="text-center py-10 text-white/30 text-sm font-bold">Loading...</div>
            ) : disputes.length === 0 ? (
              <div className="text-center py-10 text-white/30 text-sm font-bold">No disputes found</div>
            ) : disputes.map(d => (
              <div
                key={d.dispute_id}
                onClick={() => loadDisputeDetails(d.dispute_id)}
                className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                  selectedDispute?.dispute_id === d.dispute_id 
                  ? 'bg-indigo-500/10 border-indigo-500/30' 
                  : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold tracking-widest uppercase text-indigo-400/80">Dispute #{d.dispute_id}</span>
                  <span className={`w-2 h-2 rounded-full ${d.status === 'open' ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'}`}></span>
                </div>
                <p className="text-sm font-bold text-white mb-1 truncate">{d.reason}</p>
                <p className="text-xs text-white/40 font-medium">Job #{d.job_id} • Proj #{d.project_id}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT DETAILS */}
        <div className="w-full md:w-2/3">
          {selectedDispute ? (
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-3xl p-8 backdrop-blur-xl">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-white">{selectedDispute.job_title}</h2>
                  <p className="text-sm font-bold text-white/40 uppercase tracking-widest mt-1">Dispute #{selectedDispute.dispute_id} • Project #{selectedDispute.project_id}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${
                  selectedDispute.status === 'open' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                }`}>
                  {selectedDispute.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                  <p className="text-xs font-bold text-white/30 uppercase mb-3 flex items-center gap-2"><User size={12}/> Client</p>
                  <p className="text-base font-bold text-white mb-1">{selectedDispute.client_name}</p>
                  <p className="text-xs text-white/50">ID: {selectedDispute.project_id}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                  <p className="text-xs font-bold text-white/30 uppercase mb-3 flex items-center gap-2"><Users size={12}/> Freelancer</p>
                  <p className="text-base font-bold text-white mb-1">{selectedDispute.freelancer_name}</p>
                  <p className="text-xs text-white/50">Raised By: ID {selectedDispute.raised_by_id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                 <Link to={`/jobs/${selectedDispute.job_id}`} target="_blank" className="block p-5 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-colors group cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center gap-2 text-white/50 group-hover:text-white transition-colors">
                          <FileText size={16} />
                          <h3 className="text-xs font-black uppercase tracking-widest">Client Requirements</h3>
                       </div>
                       <ArrowRight size={14} className="text-white/30 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-sm font-medium text-indigo-400 mt-2">View Full Job Description &rarr;</p>
                 </Link>
                 
                 <Link to={`/projects/${selectedDispute.project_id}`} target="_blank" className="block p-5 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-colors group cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center gap-2 text-blue-400 group-hover:text-blue-300 transition-colors">
                          <CheckCircle size={16} />
                          <h3 className="text-xs font-black uppercase tracking-widest">Freelancer Submission</h3>
                       </div>
                       <ArrowRight size={14} className="text-white/30 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-sm font-medium text-blue-400 mt-2">View Submitted Work &rarr;</p>
                 </Link>
              </div>

              <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10 mb-8">
                 <div className="flex items-center gap-2 mb-3 text-red-400">
                    <Flag size={16} />
                    <h3 className="text-sm font-black uppercase tracking-widest">Dispute Claim</h3>
                 </div>
                 <h4 className="text-white font-bold mb-2">{selectedDispute.reason}</h4>
                 <p className="text-sm text-white/70 leading-relaxed bg-white/[0.03] p-4 rounded-xl whitespace-pre-wrap">{selectedDispute.description}</p>
              </div>

              <div className="flex items-center justify-between p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 mb-8">
                 <div>
                   <p className="text-xs font-bold text-indigo-400/60 uppercase tracking-widest mb-1">Escrow Amount</p>
                   <p className="text-2xl font-black text-white flex items-center"><DollarSign size={20}/>{selectedDispute.escrow_amount}</p>
                 </div>
                 {selectedDispute.status === 'open' && (
                   <div className="text-right">
                     <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1">Awaiting Action</p>
                     <p className="text-sm font-bold text-amber-400">Requires Admin Decision</p>
                   </div>
                 )}
              </div>

              {selectedDispute.status === 'open' ? (
                <div className="border-t border-white/[0.08] pt-8">
                  <h3 className="text-base font-black text-white mb-4">Admin Action</h3>
                  <textarea
                    rows="3"
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Internal resolution notes (optional)..."
                    className="w-full bg-white/[0.03] border border-white/[0.08] p-4 rounded-xl text-sm text-white focus:border-indigo-500/50 outline-none mb-4"
                  />

                  {/* Inline confirmation panel */}
                  {confirmPending ? (
                    <div className={`p-5 rounded-2xl border mb-4 ${
                      confirmPending === 'RELEASE'
                        ? 'bg-emerald-500/8 border-emerald-500/25'
                        : 'bg-red-500/8 border-red-500/25'
                    }`}>
                      <p className="text-sm font-bold text-white mb-1">
                        {confirmPending === 'RELEASE'
                          ? '✅ Confirm: Release payment to the freelancer?'
                          : '🔄 Confirm: Refund payment to the client?'}
                      </p>
                      <p className="text-xs text-white/40 mb-4">This action is permanent and cannot be undone.</p>
                      <div className="flex gap-3">
                        <button
                          onClick={handleResolve}
                          disabled={actionLoading}
                          className={`flex-1 py-2.5 font-black rounded-xl text-sm transition-all ${
                            confirmPending === 'RELEASE'
                              ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40'
                              : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40'
                          }`}
                        >
                          {actionLoading ? 'Processing...' : 'Yes, Confirm'}
                        </button>
                        <button
                          onClick={() => setConfirmPending(null)}
                          disabled={actionLoading}
                          className="flex-1 py-2.5 font-black rounded-xl text-sm bg-white/[0.04] hover:bg-white/[0.07] text-white/50 border border-white/[0.08] transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <button
                        onClick={() => setConfirmPending('RELEASE')}
                        className="flex-1 py-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black rounded-xl transition-all"
                      >
                        Release to Freelancer
                      </button>
                      <button
                        onClick={() => setConfirmPending('REFUND')}
                        className="flex-1 py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-black rounded-xl transition-all"
                      >
                        Refund to Client
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-t border-white/[0.08] pt-8">
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex gap-4 items-center">
                    <CheckCircle className="text-green-400" size={32} />
                    <div>
                      <h4 className="text-white font-bold text-lg">Resolved: {selectedDispute.admin_decision}</h4>
                      <p className="text-white/50 text-sm font-medium">Action finalized on {new Date(selectedDispute.resolved_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {selectedDispute.admin_notes && (
                    <div className="mt-4 p-4 text-sm text-white/60 bg-white/[0.03] rounded-xl border border-white/[0.05]">
                      <span className="font-bold text-white/40 uppercase text-xs mr-2">Admin Note:</span> {selectedDispute.admin_notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border border-white/[0.05] border-dashed rounded-3xl bg-white/[0.01]">
               <div className="text-center">
                  <Shield size={48} className="mx-auto text-white/10 mb-4" />
                  <p className="text-white/30 font-bold text-sm">Select a dispute from the list to review</p>
               </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
