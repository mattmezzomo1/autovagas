import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import { Dashboard } from './pages/Dashboard';
import { RobotPanel } from './pages/RobotPanel';
import { Jobs } from './pages/Jobs';
import { Resume } from './pages/Resume';
import { Courses } from './pages/Courses';
import { Profile } from './pages/Profile';
import { JobDetails } from './pages/JobDetails';
import { InterviewSimulation } from './pages/InterviewSimulation';
import { InterviewRoom } from './pages/InterviewRoom';
import { CareerRoadmap } from './pages/CareerRoadmap';
import { CourseProgress } from './pages/CourseProgress';
import { LessonView } from './pages/LessonView';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/robot" element={<RobotPanel />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/resume" element={<Resume />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/job/:jobId" element={<JobDetails />} />
        <Route path="/interview-simulation" element={<InterviewSimulation />} />
        <Route path="/interview/:interviewId" element={<InterviewRoom />} />
        <Route path="/career-roadmap" element={<CareerRoadmap />} />
        <Route path="/course/:courseId" element={<CourseProgress />} />
        <Route path="/course/:courseId/lesson/:moduleId/:lessonId" element={<LessonView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
