const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth.middleware');
const companyAuthMiddleware = require('../../middleware/companyAuth.middleware');
const CacheMiddleware = require('../../middleware/cache.middleware');

// Controladores
const companyDashboardController = require('../../controllers/company/companyDashboard.controller');
const companyJobsController = require('../../controllers/company/companyJobs.controller');
const companyCandidatesController = require('../../controllers/company/companyCandidates.controller');
const companyAnalyticsController = require('../../controllers/company/companyAnalytics.controller');
const companyChatController = require('../../controllers/company/companyChat.controller');
const companyInterviewsController = require('../../controllers/company/companyInterviews.controller');
const companyCalendarController = require('../../controllers/company/companyCalendar.controller');
const companySettingsController = require('../../controllers/company/companySettings.controller');

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);
router.use(companyAuthMiddleware);

// ===== DASHBOARD =====
router.get('/dashboard', CacheMiddleware.dashboardCache(300), companyDashboardController.getDashboardData);
router.get('/dashboard/metrics', CacheMiddleware.cache(300), companyDashboardController.getMetrics);
router.get('/dashboard/activities', CacheMiddleware.cache(180), companyDashboardController.getRecentActivities);
router.get('/dashboard/top-candidates', CacheMiddleware.cache(600), companyDashboardController.getTopCandidates);

// ===== JOBS MANAGEMENT =====
router.get('/jobs', CacheMiddleware.listCache('jobs', 600), companyJobsController.getJobs);
router.post('/jobs', CacheMiddleware.invalidateCache(['jobs:{companyUserId}*', 'dashboard:{companyUserId}*']), companyJobsController.createJob);
router.get('/jobs/:id', CacheMiddleware.cache(300), companyJobsController.getJobById);
router.put('/jobs/:id', CacheMiddleware.invalidateCache(['jobs:{companyUserId}*', 'dashboard:{companyUserId}*']), companyJobsController.updateJob);
router.delete('/jobs/:id', CacheMiddleware.invalidateCache(['jobs:{companyUserId}*', 'dashboard:{companyUserId}*']), companyJobsController.deleteJob);
router.patch('/jobs/:id/status', CacheMiddleware.invalidateCache(['jobs:{companyUserId}*', 'dashboard:{companyUserId}*']), companyJobsController.updateJobStatus);
router.get('/jobs/:id/candidates', CacheMiddleware.listCache('job-candidates', 300), companyJobsController.getJobCandidates);
router.get('/jobs/:id/analytics', CacheMiddleware.analyticsCache(1800), companyJobsController.getJobAnalytics);
router.post('/jobs/ai-generate', companyJobsController.generateJobWithAI);
router.post('/jobs/ai-suggestions', companyJobsController.getJobSuggestions);

// ===== CANDIDATES MANAGEMENT =====
router.get('/candidates', CacheMiddleware.listCache('candidates', 600), companyCandidatesController.getCandidates);
router.get('/candidates/:id', CacheMiddleware.cache(300), companyCandidatesController.getCandidateById);
router.get('/candidates/:id/profile', CacheMiddleware.cache(600), companyCandidatesController.getCandidateProfile);
router.post('/candidates/:id/favorite', companyCandidatesController.toggleFavorite);
router.get('/candidates/:id/match-analysis', CacheMiddleware.cache(1800), companyCandidatesController.getMatchAnalysis);
router.post('/candidates/:id/ai-analysis', companyCandidatesController.generateAIAnalysis);
router.get('/candidates/search', CacheMiddleware.listCache('candidate-search', 300), companyCandidatesController.searchCandidates);
router.post('/candidates/invite', companyCandidatesController.inviteCandidate);

// ===== TALENT SEARCH =====
router.post('/talent-search', companyCandidatesController.searchTalents);
router.post('/talent-search/ai', companyCandidatesController.aiTalentSearch);

// ===== ANALYTICS =====
router.get('/analytics', CacheMiddleware.analyticsCache(1800), companyAnalyticsController.getAnalytics);
router.get('/analytics/jobs', CacheMiddleware.analyticsCache(1800), companyAnalyticsController.getJobsAnalytics);
router.get('/analytics/candidates', CacheMiddleware.analyticsCache(1800), companyAnalyticsController.getCandidatesAnalytics);
router.get('/analytics/performance', CacheMiddleware.analyticsCache(1800), companyAnalyticsController.getPerformanceAnalytics);
router.get('/analytics/reports', CacheMiddleware.analyticsCache(3600), companyAnalyticsController.generateReports);

// ===== CHAT & COMMUNICATION =====
router.get('/chat/conversations', companyChatController.getConversations);
router.get('/chat/conversations/:id', companyChatController.getConversation);
router.post('/chat/conversations', companyChatController.createConversation);
router.get('/chat/conversations/:id/messages', companyChatController.getMessages);
router.post('/chat/conversations/:id/messages', companyChatController.sendMessage);
router.patch('/chat/conversations/:id/read', companyChatController.markAsRead);

// ===== INTERVIEWS =====
router.get('/interviews', companyInterviewsController.getInterviews);
router.post('/interviews', companyInterviewsController.scheduleInterview);
router.get('/interviews/:id', companyInterviewsController.getInterviewById);
router.put('/interviews/:id', companyInterviewsController.updateInterview);
router.delete('/interviews/:id', companyInterviewsController.cancelInterview);
router.post('/interviews/:id/report', companyInterviewsController.createInterviewReport);
router.get('/interviews/:id/report', companyInterviewsController.getInterviewReport);

// ===== AI INTERVIEWS =====
router.get('/ai-interviews', companyInterviewsController.getAIInterviews);
router.post('/ai-interviews', companyInterviewsController.scheduleAIInterview);
router.get('/ai-interviews/:id', companyInterviewsController.getAIInterviewById);
router.patch('/ai-interviews/:id/complete', companyInterviewsController.completeAIInterview);

// ===== CALENDAR =====
router.get('/calendar/events', companyCalendarController.getEvents);
router.post('/calendar/events', companyCalendarController.createEvent);
router.get('/calendar/events/:id', companyCalendarController.getEventById);
router.put('/calendar/events/:id', companyCalendarController.updateEvent);
router.delete('/calendar/events/:id', companyCalendarController.deleteEvent);
router.get('/calendar/availability', companyCalendarController.getAvailability);

// ===== SETTINGS =====
router.get('/settings', companySettingsController.getSettings);
router.put('/settings', companySettingsController.updateSettings);
router.get('/settings/team', companySettingsController.getTeamMembers);
router.post('/settings/team', companySettingsController.addTeamMember);
router.put('/settings/team/:id', companySettingsController.updateTeamMember);
router.delete('/settings/team/:id', companySettingsController.removeTeamMember);
router.get('/settings/billing', companySettingsController.getBillingInfo);
router.put('/settings/billing', companySettingsController.updateBillingInfo);

// ===== ACTIVITIES =====
router.get('/activities', companyDashboardController.getActivities);
router.post('/activities', companyDashboardController.createActivity);

module.exports = router;
