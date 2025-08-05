const express = require('express');
const router = express.Router();
const adminAuthMiddleware = require('../../middleware/adminAuth.middleware');

// Controladores
const adminUserController = require('../../controllers/admin/adminUser.controller');
const adminSubscriptionController = require('../../controllers/admin/adminSubscription.controller');
const adminStatsController = require('../../controllers/admin/adminStats.controller');
const adminSettingsController = require('../../controllers/admin/adminSettings.controller');

// Middleware de autenticação para todas as rotas de administração
router.use(adminAuthMiddleware);

// Rotas para gerenciamento de usuários
router.get('/users', adminUserController.getUsers);
router.get('/users/:id', adminUserController.getUserById);
router.post('/users', adminUserController.createUser);
router.put('/users/:id', adminUserController.updateUser);
router.delete('/users/:id', adminUserController.deleteUser);

// Rotas para gerenciamento de assinaturas
router.get('/subscriptions', adminSubscriptionController.getSubscriptions);
router.get('/subscriptions/:id', adminSubscriptionController.getSubscriptionById);
router.post('/subscriptions', adminSubscriptionController.createSubscription);
router.put('/subscriptions/:id', adminSubscriptionController.updateSubscription);
router.post('/subscriptions/:id/cancel', adminSubscriptionController.cancelSubscription);

// Rotas para estatísticas
router.get('/stats', adminStatsController.getAllStats);
router.get('/stats/general', adminStatsController.getGeneralStats);
router.get('/stats/users-by-plan', adminStatsController.getUsersByPlan);
router.get('/stats/monthly-revenue', adminStatsController.getMonthlyRevenue);
router.get('/stats/user-distribution', adminStatsController.getUserDistribution);
router.get('/stats/recent-activities', adminStatsController.getRecentActivities);

// Rotas para configurações
router.get('/settings', adminSettingsController.getSettings);
router.put('/settings', adminSettingsController.updateSettings);
router.get('/settings/:category', adminSettingsController.getSettingsByCategory);
router.put('/settings/:category', adminSettingsController.updateSettingsByCategory);

module.exports = router;
