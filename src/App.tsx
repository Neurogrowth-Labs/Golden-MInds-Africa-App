import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import LearningHub from './pages/LearningHub';
import Forum from './pages/Forum';
import Debates from './pages/Debates';
import AINotes from './pages/AINotes';
import Admin from './pages/Admin';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="learning" element={<LearningHub />} />
            <Route path="forum" element={<Forum />} />
            <Route path="debates" element={<Debates />} />
            <Route path="notes" element={<AINotes />} />
            <Route path="admin" element={<Admin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
