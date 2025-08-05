const express = require('express');
const cors = require('cors');
const path = require('path');

// Carrega variáveis de ambiente
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:4200'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas de health check
try {
  const healthRoutes = require('./src/routes/health.routes');
  app.use('/api', healthRoutes);
} catch (error) {
  console.warn('Health routes não encontradas, criando rota básica');
  app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'API funcionando', timestamp: new Date().toISOString() });
  });
}

// Rotas administrativas
try {
  const adminRoutes = require('./src/routes/admin.routes');
  app.use('/api', adminRoutes);
} catch (error) {
  console.warn('Admin routes não encontradas, criando rotas básicas');

  // Rotas básicas de teste para admin
  app.get('/api/admin/users', (req, res) => {
    res.json({
      success: true,
      data: [],
      message: 'Endpoint de usuários (mock)'
    });
  });

  app.get('/api/admin/subscriptions', (req, res) => {
    res.json({
      success: true,
      data: [],
      message: 'Endpoint de assinaturas (mock)'
    });
  });

  app.get('/api/admin/stats', (req, res) => {
    res.json({
      success: true,
      data: {
        generalStats: {
          totalUsers: 0,
          activeSubscriptions: 0,
          botExecutions: 0,
          revenueMonth: 0,
          conversionRate: 0,
          retentionRate: 0
        },
        usersByPlan: { basic: 0, plus: 0, premium: 0 },
        monthlyRevenue: [],
        userDistribution: { percentages: { candidate: 0, company: 0, admin: 0 } },
        recentActivities: []
      },
      message: 'Endpoint de estatísticas (mock)'
    });
  });

  app.get('/api/admin/settings', (req, res) => {
    res.json({
      success: true,
      data: {
        siteName: 'Autovagas',
        siteDescription: 'Plataforma de automação para busca de empregos',
        maintenanceMode: false,
        emailNotifications: true,
        adminAlerts: true
      },
      message: 'Endpoint de configurações (mock)'
    });
  });
}

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno'
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Status: http://localhost:${PORT}/api/status`);
  console.log(`🔧 Admin: http://localhost:${PORT}/api/admin/*`);
});

module.exports = app;
