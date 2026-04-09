import axios from 'axios';

/**
 * Backend base URL (Express + MongoDB). Chatbot uses POST /chat → loads live DB context.
 * Set VITE_API_URL in .env — e.g. https://your-api.onrender.com/api for production.
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

// Add a request interceptor to attach the auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Events
export const getEvents = (params) => api.get('/events', { params });
export const getEventById = (id) => api.get(`/events/${id}`);
export const getUpcomingEvents = () => api.get('/events/upcoming');
export const createEvent = (formData) => api.post('/events', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateEvent = (id, formData) => api.put(`/events/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteEvent = (id) => api.delete(`/events/${id}`);

// Exams
export const getExams = (params) => api.get('/exams', { params });
export const createExam = (data) => api.post('/exams', data);
export const updateExam = (id, data) => api.put(`/exams/${id}`, data);
export const deleteExam = (id) => api.delete(`/exams/${id}`);

// Clubs
export const getClubEvents = (params) => getEvents({ ...params, type: 'clubs' });
export const getClubEvent = (id) => getEventById(id);
export const createClubEvent = createEvent;
export const updateClubEvent = updateEvent;
export const deleteClubEvent = deleteEvent;

export const getClubTypes = () => api.get('/club-types');
export const createClubType = (data) => api.post('/club-types', data);
export const updateClubType = (id, data) => api.put(`/club-types/${id}`, data);
export const deleteClubType = (id) => api.delete(`/club-types/${id}`);

// Sports
export const getSportEvents = (params) => getEvents({ ...params, type: 'sports' });
export const getSportEvent = (id) => getEventById(id);
export const createSportEvent = createEvent;
export const updateSportEvent = updateEvent;
export const deleteSportEvent = deleteEvent;

export const getSportTypes = () => api.get('/sport-types');
export const createSportType = (formData) => api.post('/sport-types', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateSportType = (id, formData) => api.put(`/sport-types/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteSportType = (id) => api.delete(`/sport-types/${id}`);

export const getSportAchievements = (params) => api.get('/sports/achievements', { params });
export const createSportAchievement = (data) => api.post('/sports/achievements', data);
export const deleteSportAchievement = (id) => api.delete(`/sports/achievements/${id}`);

// Backward compatibility aliases
export const getClubs = () => api.get('/clubs');
export const getSports = () => api.get('/sports');
export const createSports = createSportEvent;
export const updateSports = updateSportEvent;
export const deleteSports = deleteSportEvent;

// Placements
export const getPlacements = (params) => api.get('/placements', { params });
export const getSinglePlacement = (id) => api.get(`/placements/${id}`);
export const createPlacement = (formData) => api.post('/placements', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updatePlacement = (id, formData) => api.put(`/placements/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deletePlacement = (id) => api.delete(`/placements/${id}`);

// Achievements
export const getAchievements = (params) => api.get('/achievements', { params });
export const getAchievementById = (id) => api.get(`/achievements/${id}`);
export const createAchievement = (formData) => api.post('/achievements', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateAchievement = (id, formData) => api.put(`/achievements/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteAchievement = (id) => api.delete(`/achievements/${id}`);

// Chat
export const sendChatMessage = (message, history = []) => {
    return api.post('/chat', { message, history });
};

// News
export const getNews = (params) => api.get('/news', { params });
export const getLatestNews = () => api.get('/news/latest');
export const getRecentNews = () => api.get('/news/recent');

// Announcements
export const getAnnouncements = (params) => api.get('/announcements', { params });
export const getTodayAnnouncements = () => api.get('/announcements/today');
export const getRecentAnnouncements = () => api.get('/announcements/recent');

// Holidays
export const getHolidays = (params) => api.get('/holidays', { params });
export const getUpcomingHolidays = () => api.get('/holidays/upcoming');

// Results
export const getResults = (params) => api.get('/results', { params });
export const getLatestResults = () => api.get('/results/latest');
export const checkResultsReleased = () => api.get('/results/status');

// Internships
export const getInternships = (params) => api.get('/internships', { params });
export const getLatestInternships = () => api.get('/internships/latest');

// Scholarships
export const getScholarships = (params) => api.get('/scholarships', { params });
export const getLatestScholarships = () => api.get('/scholarships/latest');

// Auth
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const verifyEmail = (data) => api.post('/auth/verify', data);
export const adminLogin = (credentials) => api.post('/auth/admin-login', credentials);
export const forgotPassword = (data) => api.post('/auth/forgot-password', data);
export const resetPassword = (token, data) => api.post(`/auth/reset-password/${token}`, data);

// Home Carousel
export const getHomeCarousels = () => api.get('/home-carousel');
export const createHomeCarousel = (formData) => api.post('/home-carousel', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateHomeCarousel = (id, formData) => api.put(`/home-carousel/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteHomeCarousel = (id) => api.delete(`/home-carousel/${id}`);

// Footer (Singleton)
export const getFooter = () => api.get('/footer');
export const updateFooter = (data) => api.put('/footer', data);

// Social Media
export const getSocialMedia = () => api.get('/social-media');
export const createSocialMedia = (data) => api.post('/social-media', data);
export const updateSocialMedia = (id, data) => api.put(`/social-media/${id}`, data);
export const deleteSocialMedia = (id) => api.delete(`/social-media/${id}`);

// Branding (Singleton)
export const getBranding = () => api.get('/branding');
export const updateBranding = (data) => api.put('/branding/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });

// Main Site Stats
export const getWebsiteStats = () => api.get('/stats');
export const getAdmins = () => api.get('/admins');
export const createAdmin = (data) => api.post('/admins', data);
export const updateAdmin = (id, data) => api.put(`/admins/${id}`, data);
export const deleteAdmin = (id) => api.delete(`/admins/${id}`);

export default api;

