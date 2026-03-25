import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  ArrowLeft, Send, MessageSquare, Lock, CheckCheck, Check,
  User, Briefcase, AlertTriangle
} from 'lucide-react';

/* ── tiny helpers ── */
const fmt = (iso) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const isToday = (iso) => {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
};

const DateDivider = ({ label }) => (
  <div className="flex items-center gap-3 my-6">
    <div className="flex-1 h-px bg-white/[0.06]" />
    <span className="text-[10px] font-semibold text-white/25 uppercase tracking-widest">{label}</span>
    <div className="flex-1 h-px bg-white/[0.06]" />
  </div>
);

/* ── Bubble ── */
const Bubble = ({ msg, isMine }) => (
  <div className={`flex items-end gap-2.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
    {/* avatar */}
    <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${
      isMine ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/10 text-white/50'
    }`}>
      {msg.sender_name?.charAt(0)?.toUpperCase() || '?'}
    </div>

    <div className={`max-w-[72%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
      {!isMine && (
        <p className="text-[10px] font-semibold text-white/30 px-1">{msg.sender_name}</p>
      )}
      <div className={`px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed ${
        isMine
          ? 'bg-indigo-600 text-white rounded-br-sm'
          : 'bg-white/[0.07] text-white/85 rounded-bl-sm border border-white/[0.06]'
      }`}>
        {msg.content}
      </div>
      <div className={`flex items-center gap-1.5 px-1 ${isMine ? 'flex-row-reverse' : ''}`}>
        <span className="text-[10px] text-white/20 font-medium">{fmt(msg.created_at)}</span>
        {isMine && (
          msg.is_read
            ? <CheckCheck size={11} className="text-indigo-400" />
            : <Check size={11} className="text-white/25" />
        )}
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════ */
const MessagesPage = () => {
  const { id } = useParams(); // Now this is OTHER USER ID
  const { user } = useContext(AuthContext);
  const [project, setProject]   = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText]         = useState('');
  const [loading, setLoading]   = useState(true);
  const [sending, setSending]   = useState(false);
  const [error, setError]       = useState('');
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const pollRef   = useRef(null);
  const navigate  = useNavigate();

  /* ── fetch other user & shared project ── */
  useEffect(() => {
    // Get the other user's name
    api.get('/auth/users').then(res => {
      const u = res.data.find(x => x.user_id === parseInt(id));
      if (u) setOtherUser(u);
    }).catch(() => {});

    // Try to find a linked project (for UI reasons to show "Project #XX")
    api.get('/projects').then(res => {
      const p = res.data.find(x => x.client_id === parseInt(id) || x.freelancer_id === parseInt(id));
      if (p) setProject(p);
    }).catch(() => {});
  }, [id]);

  /* ── fetch messages ── */
  const fetchMessages = useCallback(async () => {
    try {
      const res = await api.get(`/messages/user/${id}`);
      setMessages(res.data);
    } catch (e) {
      setError('Could not access messages for this user.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMessages();
    // Poll every 5s for new messages
    pollRef.current = setInterval(fetchMessages, 5000);
    return () => clearInterval(pollRef.current);
  }, [fetchMessages]);

  /* ── scroll to bottom on new messages ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ── send ── */
  const handleSend = async (e) => {
    e?.preventDefault();
    const content = text.trim();
    if (!content || sending) return;

    setSending(true);
    setText('');
    try {
      const res = await api.post(`/messages/user/${id}`, { content });
      setMessages(prev => [...prev, res.data]);
    } catch (err) {
      setError('Failed to send message.');
      setText(content); // restore
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ── loading ── */
  if (loading) return (
    <div className="min-h-screen bg-[#070e1c] flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#070e1c] flex items-center justify-center flex-col gap-4 text-center px-4">
      <AlertTriangle size={36} className="text-white/20" />
      <p className="text-sm font-semibold text-white/50">{error}</p>
      <button onClick={() => navigate(-1)} className="text-sm text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
        ← Go back
      </button>
    </div>
  );

  const otherPartyName = otherUser ? otherUser.name : `User #${id}`;

  /* group messages with date dividers */
  let lastDate = null;
  const grouped = [];
  for (const msg of messages) {
    const dateStr = new Date(msg.created_at).toDateString();
    if (dateStr !== lastDate) {
      const label = isToday(msg.created_at) ? 'Today' : new Date(msg.created_at).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
      grouped.push({ type: 'divider', label, key: `d-${dateStr}` });
      lastDate = dateStr;
    }
    grouped.push({ type: 'msg', msg, key: msg.message_id });
  }

  return (
    <div className="bg-[#070e1c] flex flex-col pt-[4.5rem]" style={{ height: '100vh' }}>

      {/* ── HEADER ── */}
      <div
        className="flex-shrink-0 flex items-center gap-4 px-5 py-4 border-b border-white/[0.07]"
        style={{ background: 'rgba(7,14,28,0.95)', backdropFilter: 'blur(20px)', zIndex: 10 }}
      >
        <button
          onClick={() => navigate('/messages')}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
            <MessageSquare size={15} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">{otherPartyName}</p>
            {project && (
              <p className="text-xs text-white/30 font-medium truncate">
                {project.job_title || `Project #${project.project_id}`}
              </p>
            )}
          </div>
        </div>

        {project && (
          <Link
            to={`/projects/${project.project_id}`}
            className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-white/40 hover:text-white/70 border border-white/[0.06] hover:bg-white/[0.04] transition-all"
          >
            <Briefcase size={12} />
            Project
          </Link>
        )}
      </div>

      {/* ── MESSAGES ── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6" style={{ scrollBehavior: 'smooth' }}>
        <div className="max-w-2xl mx-auto">

          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-4">
                <MessageSquare size={22} className="text-white/20" />
              </div>
              <p className="text-sm font-semibold text-white/40">No messages yet</p>
              <p className="text-xs text-white/20 font-medium mt-1">Send the first message to get started</p>
            </div>
          )}

          <div className="space-y-3">
            {grouped.map(item =>
              item.type === 'divider'
                ? <DateDivider key={item.key} label={item.label} />
                : <Bubble key={item.key} msg={item.msg} isMine={item.msg.sender_id === user.user_id} />
            )}
          </div>

          <div ref={bottomRef} className="h-2" />
        </div>
      </div>

      {/* ── INPUT BAR ── */}
      <div
        className="flex-shrink-0 border-t border-white/[0.07] px-4 sm:px-8 py-4"
        style={{ background: 'rgba(7,14,28,0.97)', backdropFilter: 'blur(20px)' }}
      >
        <form onSubmit={handleSend} className="max-w-2xl mx-auto flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send)"
            rows={1}
            className="flex-1 px-4 py-3 bg-white/[0.05] border border-white/[0.09] rounded-2xl text-white text-sm font-medium placeholder-white/20 focus:outline-none focus:border-indigo-500/40 resize-none transition-colors leading-relaxed"
            style={{ maxHeight: '120px', overflowY: 'auto' }}
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-30"
            style={text.trim() && !sending ? {
              background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
              boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
            } : {
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {sending
              ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Send size={14} className={text.trim() ? 'text-white' : 'text-white/30'} />
            }
          </button>
        </form>
        <p className="text-center text-[10px] text-white/15 font-medium mt-2 max-w-2xl mx-auto">
          Messages are only visible to the client and freelancer on this project
        </p>
      </div>
    </div>
  );
};

export default MessagesPage;
