import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts & Core (always needed - not lazy)
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';

// Lazy-loaded Pages (loaded only when navigated to)
const Home = lazy(() => import('../pages/Home/Home'));
const Login = lazy(() => import('../pages/Auth/Login'));
const Register = lazy(() => import('../pages/Auth/Register'));
const ForgotPassword = lazy(() => import('../pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/Auth/ResetPassword'));
const UniversityInfo = lazy(() => import('../pages/About/UniversityInfo'));
const ExamHome = lazy(() => import('../pages/ExamSchedule/ScheduleTemplate'));

// Sports
const Sports = lazy(() => import('../pages/Sports/Sports'));
const Cricket = lazy(() => import('../pages/Sports/Cricket'));
const Basketball = lazy(() => import('../pages/Sports/Basketball'));
const Kabaddi = lazy(() => import('../pages/Sports/Kabaddi'));
const Badminton = lazy(() => import('../pages/Sports/Badminton'));
const Throwball = lazy(() => import('../pages/Sports/Throwball'));
const KhoKho = lazy(() => import('../pages/Sports/KhoKho'));
const Running = lazy(() => import('../pages/Sports/Running'));
const Volleyball = lazy(() => import('../pages/Sports/Volleyball'));

// Placements
const Placements = lazy(() => import('../pages/Placements/Placements'));
const Internships = lazy(() => import('../pages/Placements/Internships'));
const Jobs = lazy(() => import('../pages/Placements/Jobs'));

// Exam Schedule
const E1 = lazy(() => import('../pages/ExamSchedule/E1/E1'));
const E2 = lazy(() => import('../pages/ExamSchedule/E2/E2'));
const E3 = lazy(() => import('../pages/ExamSchedule/E3/E3'));
const E4 = lazy(() => import('../pages/ExamSchedule/E4/E4'));

// Events & Achievements & Clubs
const StudentAchievements = lazy(() => import('../pages/Achievements/StudentAchievements'));
const AchievementDetail = lazy(() => import('../pages/Achievements/AchievementDetail'));
const UpcomingEvents = lazy(() => import('../pages/Events/UpcomingEvents'));
const EventDetail = lazy(() => import('../pages/Events/EventDetail'));
const Clubs = lazy(() => import('../pages/Clubs/Clubs'));
const ClubDetail = lazy(() => import('../pages/Clubs/ClubDetail'));
const ClubEventDetail = lazy(() => import('../pages/Clubs/ClubEventDetail'));

// Admin
const AdminDashboard = lazy(() => import('../pages/Admin/AdminDashboard'));
const AddNews = lazy(() => import('../pages/Admin/AddNews'));
const ManageEvents = lazy(() => import('../pages/Admin/ManageEvents'));
const ManageClubs = lazy(() => import('../pages/Admin/ManageClubs'));
const UploadExam = lazy(() => import('../pages/Admin/UploadExam'));
const ManageSports = lazy(() => import('../pages/Admin/ManageSports'));
const ManagePlacements = lazy(() => import('../pages/Admin/ManagePlacements'));
const SportDetail = lazy(() => import('../pages/Sports/SportDetail'));
const SportEventDetail = lazy(() => import('../pages/Sports/SportEventDetail'));
const AddAchievement = lazy(() => import('../pages/Admin/AddAchievement'));
const CreateEvent = lazy(() => import('../pages/Admin/CreateEvent'));
const EditEvent = lazy(() => import('../pages/Admin/EditEvent'));
const ManageHomeCarousel = lazy(() => import('../pages/Admin/ManageHomeCarousel'));
const ManageFooter = lazy(() => import('../pages/Admin/ManageFooter'));
const ManageSocialLinks = lazy(() => import('../pages/Admin/ManageSocialLinks'));
const ManageBranding = lazy(() => import('../pages/Admin/ManageBranding'));
const AdminManagementCard = lazy(() => import('../components/Admin/AdminManagementCard'));

// Placements Detail (NEW)
const PlacementDetail = lazy(() => import('../pages/Placements/PlacementDetail'));

// Global page-loading spinner
const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
);

const AppRoutes = () => {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    {/* Public Routes */}
                    <Route index element={<Home />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="forgot-password" element={<ForgotPassword />} />
                    <Route path="reset-password/:token" element={<ResetPassword />} />
                    <Route path="about" element={<UniversityInfo />} />

                    {/* Sports Routes */}
                    <Route path="sports">
                        <Route index element={<Sports />} />
                        <Route path=":sportType/:id" element={<SportEventDetail />} />
                        <Route path=":sportType" element={<SportDetail />} />
                    </Route>

                    {/* Protected Placements Routes */}
                    <Route path="placements">
                        <Route index element={<ProtectedRoute><Placements /></ProtectedRoute>} />
                        <Route path="internships" element={<ProtectedRoute><Internships /></ProtectedRoute>} />
                        <Route path="jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
                        <Route path="detail/:id" element={<ProtectedRoute><PlacementDetail /></ProtectedRoute>} />
                    </Route>

                    {/* Exam Schedule Routes — Login Required */}
                    <Route path="exams">
                        <Route index element={<ProtectedRoute><ExamHome /></ProtectedRoute>} />
                        <Route path="e1" element={<ProtectedRoute><E1 /></ProtectedRoute>} />
                        <Route path="e2" element={<ProtectedRoute><E2 /></ProtectedRoute>} />
                        <Route path="e3" element={<ProtectedRoute><E3 /></ProtectedRoute>} />
                        <Route path="e4" element={<ProtectedRoute><E4 /></ProtectedRoute>} />
                    </Route>

                    {/* Events, Achievements, Clubs */}
                    <Route path="events">
                        <Route index element={<UpcomingEvents />} />
                        <Route path=":id" element={<EventDetail />} />
                    </Route>
                    <Route path="achievements">
                        <Route index element={<StudentAchievements />} />
                        <Route path=":id" element={<AchievementDetail />} />
                    </Route>

                    <Route path="clubs">
                        <Route index element={<Clubs />} />
                        <Route path=":clubName/:id" element={<ClubEventDetail />} />
                        <Route path=":clubName" element={<ClubDetail />} />
                    </Route>

                    {/* Admin Routes */}
                    <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                    <Route path="admin/add-news" element={<AdminRoute><AddNews /></AdminRoute>} />
                    <Route path="admin/manage-events" element={<AdminRoute><ManageEvents /></AdminRoute>} />
                    <Route path="admin/manage-clubs" element={<AdminRoute><ManageClubs /></AdminRoute>} />
                    <Route path="admin/upload-exam" element={<AdminRoute><UploadExam /></AdminRoute>} />
                    <Route path="admin/manage-sports" element={<AdminRoute><ManageSports /></AdminRoute>} />
                    <Route path="admin/add-sports" element={<AdminRoute><ManageSports /></AdminRoute>} />
                    <Route path="admin/manage-placements" element={<AdminRoute><ManagePlacements /></AdminRoute>} />
                    <Route path="admin/add-achievements" element={<AdminRoute><AddAchievement /></AdminRoute>} />
                    <Route path="admin/create-event" element={<AdminRoute><CreateEvent /></AdminRoute>} />
                    <Route path="admin/edit-event/:id" element={<AdminRoute><EditEvent /></AdminRoute>} />
                    <Route path="admin/manage-home-carousel" element={<AdminRoute><ManageHomeCarousel /></AdminRoute>} />
                    <Route path="admin/manage-footer" element={<AdminRoute><ManageFooter /></AdminRoute>} />
                    <Route path="admin/manage-social" element={<AdminRoute><ManageSocialLinks /></AdminRoute>} />
                    <Route path="admin/manage-branding" element={<AdminRoute><ManageBranding /></AdminRoute>} />
                    <Route path="admin/manage-admins" element={<AdminRoute><AdminManagementCard /></AdminRoute>} />


                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;

