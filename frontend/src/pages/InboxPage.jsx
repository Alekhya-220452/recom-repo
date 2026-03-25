import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { MessageSquare, User, Clock, ChevronRight, Briefcase } from 'lucide-react';
import PageBackground from '../components/PageBackground';

const STYLES = `
@keyframes fadeUp {
  0% { opacity: 0; transform: translateY(15px); }
  100% { opacity: 1; transform: translateY(0); }
}
`;

const InboxPage = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [latestMessages, setLatestMessages] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInboxData = async () => {
      try {
        const [projRes, usersRes] = await Promise.all([
          api.get('/projects'),
          api.get('/auth/users').catch(() => ({ data: [] }))
        ]);

        const fetchedProjects = projRes.data;
        setProjects(fetchedProjects);

        const uMap = {};
        if (usersRes?.data) {
          usersRes.data.forEach(u => uMap[u.user_id] = u);
          setUserMap(uMap);
        }

        // Fetch latest message for each project to show snippet
        const msgs = {};
        await Promise.all(
          fetchedProjects.map(async (p) => {
            try {
              const mRes = await api.get(`/messages/project/${p.project_id}`);
              if (mRes.data && mRes.data.length > 0) {
                msgs[p.project_id] = mRes.data[mRes.data.length - 1];
              }
            } catch (err) {
              console.error(err);
            }
          })
        );
        setLatestMessages(msgs);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchInboxData();
  }, [user]);

  if (!user) return null;

  const getOtherUser = (project) => {
    const otherUserId = user.role === 'client' ? project.freelancer_id : project.client_id;
    return userMap[otherUserId] || { name: `User #${otherUserId}` };
  };

  return (
    <div className="min-h-screen pt-24 pb-20 relative bg-[#070e1c] text-white">
      <style>{STYLES}</style>
      <PageBackground variant="dark" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" style={{ animation: 'fadeUp 0.5s ease' }}>
        
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-indigo-400" />
            Messages
          </h1>
          <p className="text-slate-400 font-medium">Connect with your {user.role === 'client' ? 'freelancers' : 'clients'} across active projects.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/5 animate-pulse h-24 rounded-2xl"></div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white/[0.02] backdrop-blur-2xl rounded-[32px] border border-white/[0.08] p-12 text-center shadow-lg">
            <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2 tracking-tight">No active conversations</h2>
            <p className="text-slate-400 max-w-sm mx-auto">
              Once you have an active project, your messaging channels will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="bg-white/[0.02] backdrop-blur-2xl rounded-[32px] border border-white/[0.08] p-6 shadow-2xl overflow-hidden relative">
            {/* Subtle glow behind card content */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none -mr-40 -mt-40"></div>
            
            <div className="space-y-3 relative z-10">
              {(() => {
                const userConversations = {};
                projects.forEach(p => {
                  const otherUserId = user.role === 'client' ? p.freelancer_id : p.client_id;
                  if (!userConversations[otherUserId]) {
                    userConversations[otherUserId] = {
                      otherUserId,
                      otherUser: getOtherUser(p),
                      project: p,
                      lastMessage: latestMessages[p.project_id]
                    };
                  } else {
                    const currentLast = userConversations[otherUserId].lastMessage;
                    const newLast = latestMessages[p.project_id];
                    if (newLast && (!currentLast || new Date(newLast.created_at) > new Date(currentLast.created_at))) {
                      userConversations[otherUserId].lastMessage = newLast;
                      userConversations[otherUserId].project = p;
                    }
                  }
                });

                const conversationsList = Object.values(userConversations).sort((a, b) => {
                  if (!a.lastMessage) return 1;
                  if (!b.lastMessage) return -1;
                  return new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at);
                });

                return conversationsList.map(conv => {
                  const { otherUserId, otherUser, project, lastMessage } = conv;
                  const hasUnread = lastMessage && !lastMessage.is_read && lastMessage.sender_id !== user.user_id;

                  return (
                    <Link 
                      key={otherUserId} 
                      to={`/messages/${otherUserId}`}
                      className={`group flex items-center justify-between p-5 rounded-2xl transition-all duration-300 border ${
                        hasUnread 
                        ? 'bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/15'
                        : 'bg-white/[0.03] border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.1]'
                      }`}
                    >
                      <div className="flex items-center gap-5 min-w-0">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-inner flex-shrink-0 relative">
                          {otherUser.name.charAt(0)}
                          {hasUnread && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-[#070e1c]"></span>
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-base font-bold truncate transition-colors ${hasUnread ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                              {otherUser.name}
                            </h3>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
                            <Briefcase className="w-3.5 h-3.5" />
                            <span className="truncate">{project.job_title || `Project #${project.project_id}`}</span>
                          </div>

                          {lastMessage ? (
                            <p className={`text-sm truncate max-w-md ${hasUnread ? 'text-indigo-200 font-semibold' : 'text-slate-500'}`}>
                              {lastMessage.sender_id === user.user_id ? 'You: ' : ''}{lastMessage.content}
                            </p>
                          ) : (
                            <p className="text-sm text-slate-500 italic">No messages yet. Start the conversation!</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3 flex-shrink-0 pl-4">
                        {lastMessage && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(lastMessage.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          hasUnread 
                          ? 'bg-indigo-500 text-white' 
                          : 'bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white'
                        }`}>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </Link>
                  );
                });
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxPage;
