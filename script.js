/**
 * VibeList - A calming, minimal to-do list app
 * Uses localStorage to persist tasks across sessions
 */

// ============================================
// Constants & State
// ============================================
const STORAGE_KEY = 'vibelist_tasks';
let tasks = [];

// ============================================
// DOM Elements
// ============================================
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const emptyState = document.getElementById('emptyState');

// ============================================
// Initialization
// ============================================

/**
 * Initialize the app
 * Loads tasks from localStorage and sets up event listeners
 */
function init() {
    loadTasks();
    renderTasks();
    setupEventListeners();
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Add task on button click
    addBtn.addEventListener('click', handleAddTask);
    
    // Add task on Enter key press
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAddTask();
        }
    });
    
    // Clear input validation on input
    taskInput.addEventListener('input', () => {
        taskInput.classList.remove('error');
    });
    
    // Clear completed tasks
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
}

// ============================================
// Task Management Functions
// ============================================

/**
 * Load tasks from localStorage
 */
function loadTasks() {
    try {
        const storedTasks = localStorage.getItem(STORAGE_KEY);
        tasks = storedTasks ? JSON.parse(storedTasks) : [];
    } catch (error) {
        console.error('Error loading tasks:', error);
        tasks = [];
    }
}

/**
 * Save tasks to localStorage
 */
function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        console.error('Error saving tasks:', error);
    }
}

/**
 * Handle adding a new task
 */
function handleAddTask() {
    const text = taskInput.value.trim();
    
    // Validate input
    if (!text) {
        taskInput.classList.add('error');
        taskInput.focus();
        return;
    }
    
    // Add task
    addTask(text);
    
    // Clear input and focus
    taskInput.value = '';
    taskInput.focus();
}

/**
 * Add a new task
 * @param {string} text - The task text
 */
function addTask(text) {
    const task = {
        id: generateId(),
        text: text,
        completed: false,
        createdAt: Date.now()
    };
    
    tasks.unshift(task); // Add to beginning of array
    saveTasks();
    renderTasks();
}

/**
 * Toggle task completion status
 * @param {string} id - The task ID
 */
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

/**
 * Delete a task with animation
 * @param {string} id - The task ID
 */
function deleteTask(id) {
    const taskElement = document.querySelector(`[data-id="${id}"]`);
    
    if (taskElement) {
        // Add removing class for animation
        taskElement.classList.add('removing');
        
        // Wait for animation to complete before removing
        setTimeout(() => {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks();
        }, 250); // Match CSS animation duration
    }
}

/**
 * Clear all completed tasks
 */
function clearCompletedTasks() {
    const completedTasks = document.querySelectorAll('.task-item.completed');
    
    // Animate out all completed tasks
    completedTasks.forEach(taskElement => {
        taskElement.classList.add('removing');
    });
    
    // Remove from data after animation
    setTimeout(() => {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        renderTasks();
    }, 250);
}

// ============================================
// Rendering Functions
// ============================================

/**
 * Render all tasks to the DOM
 */
function renderTasks() {
    // Clear current list
    taskList.innerHTML = '';
    
    // Update task count
    updateTaskCount();
    
    // Show/hide empty state
    if (tasks.length === 0) {
        emptyState.classList.remove('hidden');
        clearCompletedBtn.classList.add('hidden');
        return;
    } else {
        emptyState.classList.add('hidden');
    }
    
    // Show/hide clear completed button
    const hasCompleted = tasks.some(t => t.completed);
    if (hasCompleted) {
        clearCompletedBtn.classList.remove('hidden');
    } else {
        clearCompletedBtn.classList.add('hidden');
    }
    
    // Render each task
    tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        taskList.appendChild(taskElement);
    });
}

/**
 * Create a task element
 * @param {Object} task - The task object
 * @returns {HTMLElement} The task list item element
 */
function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.setAttribute('data-id', task.id);
    li.setAttribute('role', 'listitem');
    
    // Checkbox
    const checkbox = document.createElement('div');
    checkbox.className = 'task-checkbox';
    checkbox.setAttribute('role', 'checkbox');
    checkbox.setAttribute('aria-checked', task.completed);
    checkbox.setAttribute('tabindex', '0');
    checkbox.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 8L6.5 11.5L13 5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
    
    // Handle checkbox click and keyboard
    checkbox.addEventListener('click', () => toggleTask(task.id));
    checkbox.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleTask(task.id);
        }
    });
    
    // Task text
    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text;
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.setAttribute('aria-label', `Delete task: ${task.text}`);
    deleteBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 5L15 15M5 15L15 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
    `;
    
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    
    // Assemble task item
    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(deleteBtn);
    
    return li;
}

/**
 * Update the task count display
 */
function updateTaskCount() {
    const remainingCount = tasks.filter(t => !t.completed).length;
    const plural = remainingCount === 1 ? 'task' : 'tasks';
    taskCount.textContent = `${remainingCount} ${plural} remaining`;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Generate a unique ID for a task
 * @returns {string} A unique ID
 */
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// Start the app
// ============================================
init();
