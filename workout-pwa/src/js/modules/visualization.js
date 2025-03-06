/**
 * Visualization module for the Workout Tracker PWA
 * Handles charts, progress visualization, and data presentation
 */

/**
 * Create a volume chart for exercise progression
 * @param {string} containerId - ID of the container element 
 * @param {Array} data - Array of data points [{date: string, volume: number}]
 */
export function createVolumeChart(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container not found: ${containerId}`);
    return;
  }
  
  // Clear container
  container.innerHTML = '';
  
  // Create chart container
  const chartElement = document.createElement('div');
  chartElement.className = 'volume-chart';
  
  // Calculate max volume for scaling
  const maxVolume = Math.max(...data.map(d => d.volume));
  
  // Create bars
  data.forEach(entry => {
    // Calculate height percentage based on max volume
    const heightPercentage = (entry.volume / maxVolume) * 100;
    
    // Create bar container
    const barContainer = document.createElement('div');
    barContainer.className = 'volume-bar-container';
    
    // Create actual bar
    const bar = document.createElement('div');
    bar.className = 'volume-bar';
    bar.style.height = `${heightPercentage}%`;
    
    // Add tooltip with data
    bar.title = `${entry.date}: ${entry.volume} kg`;
    
    // Create date label
    const dateLabel = document.createElement('div');
    dateLabel.className = 'volume-date';
    dateLabel.textContent = formatDate(entry.date);
    
    // Assemble
    barContainer.appendChild(bar);
    barContainer.appendChild(dateLabel);
    chartElement.appendChild(barContainer);
  });
  
  // Add to container
  container.appendChild(chartElement);
}

/**
 * Create a progress chart for a specific metric
 * @param {string} containerId - ID of the container element
 * @param {Array} data - Array of data points [{date: string, value: number}]
 * @param {Object} options - Chart options
 */
export function createProgressChart(containerId, data, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container not found: ${containerId}`);
    return;
  }
  
  // Clear container
  container.innerHTML = '';
  
  // Set defaults
  const config = {
    height: options.height || 200,
    yAxisLabels: options.yAxisLabels || 5,
    title: options.title || 'Progress',
    yAxisFormatter: options.yAxisFormatter || (value => value),
    goalValue: options.goalValue || null,
    ...options
  };
  
  // Create chart structure
  const chartContainer = document.createElement('div');
  chartContainer.className = 'chart-container';
  chartContainer.style.height = `${config.height}px`;
  
  // Add the rest of the chart creation logic
  // ...
}

/**
 * Create a statistics grid
 * @param {string} containerId - ID of the container element
 * @param {Array} stats - Array of stat objects {value: string, label: string}
 */
export function createStatsGrid(containerId, stats) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const gridStats = document.createElement('div');
  gridStats.className = 'grid-stats';
  
  stats.forEach(stat => {
    const miniStat = document.createElement('div');
    miniStat.className = 'mini-stat';
    
    const value = document.createElement('div');
    value.className = 'mini-stat-value';
    value.textContent = stat.value;
    
    const label = document.createElement('div');
    label.className = 'mini-stat-label';
    label.textContent = stat.label;
    
    miniStat.appendChild(value);
    miniStat.appendChild(label);
    gridStats.appendChild(miniStat);
  });
  
  container.appendChild(gridStats);
}

/**
 * Format a date string for display
 * @param {string} dateString - ISO date string
 * @param {string} format - Format type ('short', 'medium', 'long')
 * @returns {string} - Formatted date
 */
function formatDate(dateString, format = 'medium') {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'long':
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    case 'medium':
    default:
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}