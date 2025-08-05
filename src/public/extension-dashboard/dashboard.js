// Extension Dashboard JavaScript

// Charts
let platformChart = null;
let taskTypeChart = null;

// Auto-refresh intervals
let overviewInterval = null;
let extensionsInterval = null;
let historyInterval = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  // Initial data load
  loadDashboardOverview();
  loadActiveExtensions();
  loadTaskHistory();
  
  // Set up auto-refresh
  overviewInterval = setInterval(loadDashboardOverview, 30000); // Every 30 seconds
  extensionsInterval = setInterval(loadActiveExtensions, 60000); // Every minute
  historyInterval = setInterval(loadTaskHistory, 120000); // Every 2 minutes
  
  // Set up manual refresh buttons
  document.getElementById('refreshExtensions').addEventListener('click', () => {
    const button = document.getElementById('refreshExtensions');
    button.querySelector('i').classList.add('refreshing');
    loadActiveExtensions().finally(() => {
      button.querySelector('i').classList.remove('refreshing');
    });
  });
  
  document.getElementById('refreshHistory').addEventListener('click', () => {
    const button = document.getElementById('refreshHistory');
    button.querySelector('i').classList.add('refreshing');
    loadTaskHistory().finally(() => {
      button.querySelector('i').classList.remove('refreshing');
    });
  });
  
  // Set up history filter
  document.getElementById('historyFilter').addEventListener('change', loadTaskHistory);
});

/**
 * Load dashboard overview data
 */
async function loadDashboardOverview() {
  try {
    const response = await fetch('/api/extension-dashboard/overview');
    
    if (!response.ok) {
      throw new Error(`Failed to load overview: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Update counters
    document.getElementById('activeExtensionsCount').textContent = data.overview.totalExtensions;
    document.getElementById('processingExtensionsCount').textContent = data.overview.activeExtensions;
    document.getElementById('idleExtensionsCount').textContent = data.overview.idleExtensions;
    
    document.getElementById('totalTasksCount').textContent = 
      data.overview.pendingTasks + data.overview.processingTasks + data.overview.completedTasks + data.overview.failedTasks;
    document.getElementById('pendingTasksCount').textContent = data.overview.pendingTasks;
    document.getElementById('processingTasksCount').textContent = data.overview.processingTasks;
    document.getElementById('completedTasksCount').textContent = data.overview.completedTasks;
    document.getElementById('failedTasksCount').textContent = data.overview.failedTasks;
    
    document.getElementById('successRate').textContent = `${data.performance.successRate.toFixed(1)}%`;
    document.getElementById('tasksPerHour').textContent = data.performance.tasksPerHour.toFixed(1);
    document.getElementById('avgTaskDuration').textContent = `${(data.performance.averageTaskDuration / 1000).toFixed(1)}s`;
    document.getElementById('cacheHitRate').textContent = `${data.overview.cacheHitRate.toFixed(1)}%`;
    
    // Update charts
    updatePlatformChart(data.taskDistribution.byPlatform);
    updateTaskTypeChart(data.taskDistribution.byType);
    
  } catch (error) {
    console.error('Error loading dashboard overview:', error);
  }
}

/**
 * Load active extensions
 */
async function loadActiveExtensions() {
  try {
    const response = await fetch('/api/extension-dashboard/extensions');
    
    if (!response.ok) {
      throw new Error(`Failed to load extensions: ${response.status}`);
    }
    
    const extensions = await response.json();
    const tableBody = document.getElementById('extensionsTableBody');
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    if (extensions.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="6" class="text-center">Nenhuma extensão ativa no momento</td>';
      tableBody.appendChild(row);
      return;
    }
    
    // Add rows for each extension
    extensions.forEach(ext => {
      const row = document.createElement('tr');
      
      const lastSeen = new Date(ext.lastSeen);
      const formattedLastSeen = lastSeen.toLocaleString('pt-BR');
      
      const statusClass = ext.status === 'processing' ? 'status-active' : 'status-idle';
      const statusText = ext.status === 'processing' ? 'Ativo' : 'Ocioso';
      
      row.innerHTML = `
        <td>${ext.userId}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>${ext.extensionInfo.version || 'N/A'}</td>
        <td>${ext.extensionInfo.platform || 'N/A'}</td>
        <td>${formattedLastSeen}</td>
        <td>${ext.currentTask || 'Nenhuma'}</td>
      `;
      
      tableBody.appendChild(row);
    });
    
  } catch (error) {
    console.error('Error loading active extensions:', error);
  }
}

/**
 * Load task history
 */
async function loadTaskHistory() {
  try {
    const filter = document.getElementById('historyFilter').value;
    let url = '/api/extension-dashboard/history?limit=20';
    
    if (filter === 'completed') {
      url += '&status=completed';
    } else if (filter === 'failed') {
      url += '&status=failed';
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to load task history: ${response.status}`);
    }
    
    const data = await response.json();
    const tableBody = document.getElementById('historyTableBody');
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    if (data.tasks.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="7" class="text-center">Nenhuma tarefa no histórico</td>';
      tableBody.appendChild(row);
      return;
    }
    
    // Add rows for each task
    data.tasks.forEach(task => {
      const row = document.createElement('tr');
      
      const createdAt = new Date(task.createdAt);
      const formattedCreatedAt = createdAt.toLocaleString('pt-BR');
      
      let formattedCompletedAt = 'N/A';
      if (task.completedAt) {
        const completedAt = new Date(task.completedAt);
        formattedCompletedAt = completedAt.toLocaleString('pt-BR');
      } else if (task.failedAt) {
        const failedAt = new Date(task.failedAt);
        formattedCompletedAt = failedAt.toLocaleString('pt-BR');
      }
      
      let duration = 'N/A';
      if (task.duration) {
        duration = `${(task.duration / 1000).toFixed(1)}s`;
      }
      
      const statusClass = `status-${task.status}`;
      const statusText = {
        'completed': 'Concluída',
        'failed': 'Falha',
        'processing': 'Processando',
        'pending': 'Pendente'
      }[task.status] || task.status;
      
      row.innerHTML = `
        <td>${task.id}</td>
        <td>${task.platform}</td>
        <td>${task.type}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>${formattedCreatedAt}</td>
        <td>${formattedCompletedAt}</td>
        <td>${duration}</td>
      `;
      
      tableBody.appendChild(row);
    });
    
  } catch (error) {
    console.error('Error loading task history:', error);
  }
}

/**
 * Update platform chart
 */
function updatePlatformChart(data) {
  const ctx = document.getElementById('platformChart').getContext('2d');
  
  const chartData = {
    labels: ['LinkedIn', 'Indeed', 'InfoJobs', 'Catho'],
    datasets: [{
      label: 'Tarefas por Plataforma',
      data: [
        data.linkedin || 0,
        data.indeed || 0,
        data.infojobs || 0,
        data.catho || 0
      ],
      backgroundColor: [
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)'
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)'
      ],
      borderWidth: 1
    }]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };
  
  if (platformChart) {
    platformChart.data = chartData;
    platformChart.update();
  } else {
    platformChart = new Chart(ctx, {
      type: 'bar',
      data: chartData,
      options: options
    });
  }
}

/**
 * Update task type chart
 */
function updateTaskTypeChart(data) {
  const ctx = document.getElementById('taskTypeChart').getContext('2d');
  
  const chartData = {
    labels: ['Busca de Vagas', 'Detalhes da Vaga'],
    datasets: [{
      label: 'Tarefas por Tipo',
      data: [
        data.search_jobs || 0,
        data.job_details || 0
      ],
      backgroundColor: [
        'rgba(255, 99, 132, 0.7)',
        'rgba(75, 192, 192, 0.7)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(75, 192, 192, 1)'
      ],
      borderWidth: 1
    }]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };
  
  if (taskTypeChart) {
    taskTypeChart.data = chartData;
    taskTypeChart.update();
  } else {
    taskTypeChart = new Chart(ctx, {
      type: 'doughnut',
      data: chartData,
      options: options
    });
  }
}
