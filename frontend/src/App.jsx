import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import JobListPage from './pages/JobListPage';
import JobDetailsPage from './pages/JobDetailsPage';
import NewJobPage from './pages/NewJobPage';
import BidFormPage from './pages/BidFormPage';
import ProjectDashboard from './pages/ProjectDashboard';
import SubmitWorkPage from './pages/SubmitWorkPage';
import ReviewPage from './pages/ReviewPage';
import PaymentPage from './pages/PaymentPage';
import EscrowPaymentPage from './pages/EscrowPaymentPage';
import ProfilePage from './pages/ProfilePage';
import FreelancersPage from './pages/FreelancersPage';
import SavedJobsPage from './pages/SavedJobsPage';
import MessagesPage from './pages/MessagesPage';
import InboxPage from './pages/InboxPage';
import AdminDisputesPage from './pages/AdminDisputesPage';

const ProtectedRoute = ({ children }) => {
 const { user, loading } = useContext(AuthContext);
 if (loading) return (
 <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
 <div className="flex flex-col items-center gap-3">
 <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
 <p className="text-slate-300 text-sm">Loading...</p>
 </div>
 </div>
 );
 if (!user) return <Navigate to="/login" replace />;
 return children;
};

const App = () => {
 return (
 <Router>
   <div style={{ display: 'flex', minHeight: '100vh' }}>
     {/* Left sidebar — hidden on auth/home pages (Sidebar handles its own visibility) */}
     <Sidebar />

     {/* Main content column */}
     <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
       <Navbar />
       <Routes>
         <Route path="/" element={<HomePage />} />
         <Route path="/login" element={<LoginPage />} />
         <Route path="/signup" element={<SignupPage />} />

         {/* Protected Routes */}
         <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
         <Route path="/jobs" element={<ProtectedRoute><JobListPage /></ProtectedRoute>} />
         <Route path="/jobs/new" element={<ProtectedRoute><NewJobPage /></ProtectedRoute>} />
         <Route path="/jobs/:id" element={<ProtectedRoute><JobDetailsPage /></ProtectedRoute>} />
         <Route path="/jobs/:id/bid" element={<ProtectedRoute><BidFormPage /></ProtectedRoute>} />
         <Route path="/saved-jobs" element={<ProtectedRoute><SavedJobsPage /></ProtectedRoute>} />
         <Route path="/freelancers" element={<ProtectedRoute><FreelancersPage /></ProtectedRoute>} />
         <Route path="/profile/:id" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
         <Route path="/projects/:id" element={<ProtectedRoute><ProjectDashboard /></ProtectedRoute>} />
         <Route path="/projects/:id/submit" element={<ProtectedRoute><SubmitWorkPage /></ProtectedRoute>} />
         <Route path="/projects/:id/review" element={<ProtectedRoute><ReviewPage /></ProtectedRoute>} />
         <Route path="/projects/:id/escrow" element={<ProtectedRoute><EscrowPaymentPage /></ProtectedRoute>} />
         <Route path="/projects/:id/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
         <Route path="/messages/:id" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
         <Route path="/messages" element={<ProtectedRoute><InboxPage /></ProtectedRoute>} />
         <Route path="/admin/disputes" element={<ProtectedRoute><AdminDisputesPage /></ProtectedRoute>} />

         {/* Fallback */}
         <Route path="*" element={<Navigate to="/" replace />} />
       </Routes>
     </div>
   </div>
 </Router>
 );
};

export default App;
