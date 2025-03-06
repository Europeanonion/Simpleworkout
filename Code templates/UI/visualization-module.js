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
  
  // Create header if needed
  if (config.title) {
    const header = document.createElement('div');
    header.className = 'stat-header';
    header.textContent = config.title;
    container.appendChild(header);
  }
  
  // Create Y-axis
  const yAxis = document.createElement('div');
  yAxis.className = 'chart-y-axis';
  
  // Calculate y-axis scale
  const maxValue = Math.max(...data.map(d => d.value));
  const yAxisStep = maxValue / (config.yAxisLabels - 1);
  
  // Create Y-axis labels
  for (let i = config.yAxisLabels - 1; i >= 0; i--) {
    const label = document.createElement('div');
    label.className = 'chart-y-label';
    const value = i * yAxisStep;
    label.textContent = config.yAxisFormatter(value);
    yAxis.appendChild(label);
  }
  
  // Create grid
  const grid = document.createElement('div');
  grid.className = 'chart-grid';
  
  for (let i = 0; i < config.yAxisLabels; i++) {
    const line = document.createElement('div');
    line.className = 'chart-grid-line';
    grid.appendChild(line);
  }
  
  // Create bars container
  const barsContainer = document.createElement('div');
  barsContainer.className = 'chart-bars';
  
  // Create bars
  data.forEach(entry => {
    // Calculate height percentage
    const heightPercentage = (entry.value / maxValue) * 100;
    
    // Create bar container
    const barContainer = document.createElement('div');
    barContainer.className = 'chart-bar-container';
    
    // Create actual bar
    const bar = document.createElement('div');
    bar.className = 'chart-bar';
    bar.style.height = `${heightPercentage}%`;
    
    // Add tooltip
    bar.title = `${entry.date}: ${entry.value}`;
    
    // Add to container
    barContainer.appendChild(bar);
    barsContainer.appendChild(barContainer);
  });
  
  // Create X-axis
  const xAxis = document.createElement('div');
  xAxis.className = 'chart-x-axis';
  
  // Add X-axis labels
  data.forEach(entry => {
    const label = document.createElement('div');
    label.textContent = formatDate(entry.date, 'short');
    xAxis.appendChild(label);
  });
  
  // Add goal annotation if specified
  if (config.goalValue) {
    const goalPercentage = (config.goalValue / maxValue) * 100;
    const annotation = document.createElement('div');
    annotation.className = 'chart-annotation';
    annotation.style.bottom = `${goalPercentage}%`;
    annotation.textContent = 'Goal';
    chartContainer.appendChild(annotation);
  }
  
  // Assemble chart
  chartContainer.appendChild(yAxis);
  chartContainer.appendChild(grid);
  chartContainer.appendChild(barsContainer);
  chartContainer.appendChild(xAxis);
  
  // Add to container
  container.appendChild(chartContainer);
}

/**
 * Create a progress bar
 * @param {string} containerId - ID of the container element
 * @param {number} percentage - Progress percentage (0-100)
 * @param {Object} options - Options for the progress bar
 */
export function createProgressBar(containerId, percentage, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container not found: ${containerId}`);
    return;
  }
  
  // Clear container
  container.innerHTML = '';
  
  // Set defaults
  const config = {
    title: options.title || '',
    startLabel: options.startLabel || '',
    endLabel: options.endLabel || '',
    showPercentage: options.showPercentage !== false,
    ...options
  };
  
  // Create progress card
  const progressCard = document.createElement('div');
  progressCard.className = 'progress-card';
  
  // Create header
  const header = document.createElement('div');
  header.className = 'progress-header';
  
  // Add title
  const title = document.createElement('div');
  title.className = 'progress-title';
  title.textContent = config.title;
  header.appendChild(title);
  
  // Add percentage if needed
  if (config.showPercentage) {
    const value = document.createElement('div');
    value.className = 'progress-value';
    value.textContent = `${Math.round(percentage)}%`;
    header.appendChild(value);
  }
  
  // Create progress bar
  const barContainer = document.createElement('div');
  barContainer.className = 'progress-bar-container';
  
  const bar = document.createElement('div');
  bar.className = 'progress-bar';
  bar.style.width = `${percentage}%`;
  
  barContainer.appendChild(bar);
  
  // Create labels if provided
  if (config.startLabel || config.endLabel) {
    const labels = document.createElement('div');
    labels.className = 'progress-labels';
    
    const startLabel = document.createElement('div');
    startLabel.textContent = config.startLabel;
    
    const endLabel = document.createElement('div');
    endLabel.textContent = config.endLabel;
    
    labels.appendChild(startLabel);
    labels.appendChild(endLabel);
    
    // Assemble progress card with labels
    progressCard.appendChild(header);
    progressCard.appendChild(barContainer);
    progressCard.appendChild(labels);
  } else {
    // Assemble progress card without labels
    progressCard.appendChild(header);
    progressCard.appendChild(barContainer);
  }
  
  // Add to container
  container.appendChild(progressCard);
}

/**
 * Create a statistics grid
 * @param {string} containerId - ID of the container element
 * @param {Array} stats - Array of stat objects {value: string, label: string}
 * @param {Object} options - Options for the grid
 */
export function createStatsGrid(containerId, stats, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container not found: ${containerId}`);
    return;
  }
  
  // Clear container
  container.innerHTML = '';
  
  // Set defaults
  const config = {
    title: options.title || '',
    description: options.description || '',
    ...options
  };
  
  // Create card
  const card = document.createElement('div');
  card.className = 'card';
  
  // Add title if specified
  if (config.title) {
    const title = document.createElement('h3');
    title.style.marginBottom = '10px';
    title.style.fontWeight = '600';
    title.textContent = config.title;
    card.appendChild(title);
  }
  
  // Add description if specified
  if (config.description) {
    const description = document.createElement('p');
    description.style.color = 'var(--text-secondary)';
    description.style.fontSize = '0.9rem';
    description.style.marginBottom = '15px';
    description.textContent = config.description;
    card.appendChild(description);
  }
  
  // Create stats grid
  const grid = document.createElement('div');
  grid.className = 'grid-stats';
  
  // Add each stat
  stats.forEach(stat => {
    const statElement = document.createElement('div');
    statElement.className = 'mini-stat';
    
    const valueElement = document.createElement('div');
    valueElement.className = 'mini-stat-value';
    valueElement.textContent = stat.value;
    
    const labelElement = document.createElement('div');
    labelElement.className = 'mini-stat-label';
    labelElement.textContent = stat.label;
    
    statElement.appendChild(valueElement);
    statElement.appendChild(labelElement);
    
    grid.appendChild(statElement);
  });
  
  // Assemble card
  card.appendChild(grid);
  
  // Add to container
  container.appendChild(card);
}

/**
 * Format a date string for display
 * @param {string} dateString - ISO date string or Date object
 * @param {string} format - Format type ('short', 'medium', 'long')
 * @returns {string} - Formatted date
 */
function formatDate(dateString, format = 'medium') {
  const date = new Date(dateString);
  
  switch (format) {
    case 'short':
      // Format as "Apr 5" or "Week 1"
      if (dateString.toLowerCase().includes('week')) {
        return dateString;
      }
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
    case 'long':
      // Format as "April 5, 2025"
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      
    case 'medium':
    default:
      // Format as "Apr 5, 2025"
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}