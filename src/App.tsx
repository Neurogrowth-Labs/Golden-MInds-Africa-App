import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Assignments from './pages/Assignments';
import Attendance from './pages/Attendance';
import LearningHub from './pages/LearningHub';
import Forum from './pages/Forum';
import Debates from './pages/Debates';
import AINotes from './pages/AINotes';
import Admin from './pages/Admin';
import VirtualRooms from './pages/VirtualRooms';
import LectureRoom from './pages/LectureRoom';
import Onboarding from './pages/Onboarding';
import Network from './pages/Network';
import Projects from './pages/Projects';
import Simulations from './pages/Simulations';
import Achievements from './pages/Achievements';
import CollaborationRooms from './pages/CollaborationRooms';
import Certifications from './pages/Certifications';
import KnowledgeVault from './pages/KnowledgeVault';
import Opportunities from './pages/Opportunities';
import Portfolio from './pages/Portfolio';
import Mentors from './pages/Mentors';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="learning" element={<LearningHub />} />
            <Route path="rooms" element={<VirtualRooms />} />
            <Route path="room/:roomId" element={<LectureRoom />} />
            <Route path="forum" element={<Forum />} />
            <Route path="debates" element={<Debates />} />
            <Route path="notes" element={<AINotes />} />
            <Route path="network" element={<Network />} />
            <Route path="projects" element={<Projects />} />
            <Route path="simulations" element={<Simulations />} />
            <Route path="achievements" element={<Achievements />} />
            <Route path="collaboration" element={<CollaborationRooms />} />
            <Route path="certifications" element={<Certifications />} />
            <Route path="vault" element={<KnowledgeVault />} />
            <Route path="opportunities" element={<Opportunities />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="mentors" element={<Mentors />} />
            <Route path="admin" element={<Admin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
