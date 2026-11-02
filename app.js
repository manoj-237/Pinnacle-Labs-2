/**
 * TaskFlow - Modern To-Do & Task Management Application
 * Architecture:
 * - State Management & Storage Service (LocalStorage persistence)
 * - Filtering, Sorting, and Search Engine
 * - Dynamic UI Render Engine & View Navigation
 * - Modal & Form Controllers
 * - Subtasks & Checklist Operations
 * - Undo Toast Notifications
 * - Keyboard Shortcuts & Theme Controller
 */

// ==========================================================================
// 1. Initial State & Defaults
// ==========================================================================
const DEFAULT_CATEGORIES = [
  { id: 'cat-personal', name: 'Personal', color: '#3b82f6' },
  { id: 'cat-work', name: 'Work', color: '#10b981' },
  { id: 'cat-learning', name: 'Learning', color: '#8b5cf6' },
  { id: 'cat-fitness', name: 'Health & Fitness', color: '#f59e0b' }
];

const SAMPLE_TASKS = [
  {
    id: 'task-1',
    title: 'Complete project documentation and tests',
    description: 'Ensure README has comprehensive setup guides, keyboard shortcuts, and code comments.',
    categoryId: 'cat-work',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    tags: ['work', 'docs', 'release'],
    completed: false,
    createdAt: new Date().toISOString(),
    subtasks: [
      { id: 'st-1', title: 'Write README instructions', completed: true },
      { id: 'st-2', title: 'Verify responsive mobile layout', completed: false }
    ]
  },
  {
    id: 'task-2',
    title: 'Daily 30-minute cardio & stretch',
    description: 'Morning run in the park followed by light yoga.',
    categoryId: 'cat-fitness',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0], // Today
    tags: ['health', 'morning'],
    completed: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    subtasks: []
  },
  {
    id: 'task-3',
    title: 'Study JavaScript ES6+ Async Patterns',
    description: 'Review Promises, async/await, and event loop mechanics.',
    categoryId: 'cat-learning',
    priority: 'low',
    dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    tags: ['javascript', 'study'],
    completed: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    subtasks: []
  }
];

class TaskApp {
  constructor() {
    this.storageKeyTasks = 'taskflow_tasks';
    this.storageKeyCategories = 'taskflow_categories';
    this.storageKeyTheme = 'taskflow_theme';

    // Load State
    this.tasks = this.loadTasks();
    this.categories = this.loadCategories();
    this.activeView = 'all'; // 'all', 'today', 'upcoming', 'completed', or categoryId
    this.searchQuery = '';
    this.priorityFilter = 'all';
    this.sortOption = 'createdAt-desc';
    this.currentEditSubtasks = [];
    this.lastDeletedTask = null;
    this.undoTimeout = null;

    // Cache DOM Elements
    this.initDOMElements();

    // Attach Event Listeners
    this.initEventListeners();

    // Initial Render
    this.initTheme();
    this.renderCategoriesNav();
    this.populateCategorySelects();
    this.render();
  }

  // ==========================================================================
  // 2. Storage Helpers
  // ==========================================================================
  loadTasks() {
    try {
      const data = localStorage.getItem(this.storageKeyTasks);
      return data ? JSON.parse(data) : SAMPLE_TASKS;
    } catch (e) {
      console.warn('Failed to load tasks from localStorage', e);
      return SAMPLE_TASKS;
    }
  }

  saveTasks() {
    try {
      localStorage.setItem(this.storageKeyTasks, JSON.stringify(this.tasks));
    } catch (e) {
      console.warn('Failed to save tasks to localStorage', e);
    }
  }

  loadCategories() {
    try {
      const data = localStorage.getItem(this.storageKeyCategories);
      return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
    } catch (e) {
      console.warn('Failed to load categories from localStorage', e);
      return DEFAULT_CATEGORIES;
    }
  }

  saveCategories() {
    try {
      localStorage.setItem(this.storageKeyCategories, JSON.stringify(this.categories));
    } catch (e) {
      console.warn('Failed to save categories to localStorage', e);
    }
  }

  // ==========================================================================
  // 3. DOM Cache
  // ==========================================================================
  initDOMElements() {
    // Navigation & Views
    this.categoryNavList = document.getElementById('categoryNavList');
    this.navItems = document.querySelectorAll('.nav-item');
    this.currentViewTitle = document.getElementById('currentViewTitle');
    this.currentViewSubtitle = document.getElementById('currentViewSubtitle');

    // Stats
    this.statsPercentage = document.getElementById('statsPercentage');
    this.progressBarFill = document.getElementById('progressBarFill');
    this.statsCompletedCount = document.getElementById('statsCompletedCount');
    this.statsTotalCount = document.getElementById('statsTotalCount');

    // Badges
    this.badgeAll = document.getElementById('badgeAll');
    this.badgeToday = document.getElementById('badgeToday');
    this.badgeUpcoming = document.getElementById('badgeUpcoming');
    this.badgeCompleted = document.getElementById('badgeCompleted');

    // Tasks list & Empty state
    this.tasksList = document.getElementById('tasksList');
    this.emptyState = document.getElementById('emptyState');
    this.emptyStateTitle = document.getElementById('emptyStateTitle');
    this.emptyStateSubtitle = document.getElementById('emptyStateSubtitle');
    this.emptyStateActionBtn = document.getElementById('emptyStateActionBtn');

    // Controls
    this.searchInput = document.getElementById('searchInput');
    this.clearSearchBtn = document.getElementById('clearSearchBtn');
    this.priorityFilterSelect = document.getElementById('priorityFilterSelect');
    this.sortSelect = document.getElementById('sortSelect');
    this.clearCompletedBtn = document.getElementById('clearCompletedBtn');

    // Quick Add
    this.quickAddForm = document.getElementById('quickAddForm');
    this.quickTaskInput = document.getElementById('quickTaskInput');
    this.quickPrioritySelect = document.getElementById('quickPrioritySelect');
    this.quickDueDateInput = document.getElementById('quickDueDateInput');

    // Task Modal
    this.taskModal = document.getElementById('taskModal');
    this.modalTitle = document.getElementById('modalTitle');
    this.taskForm = document.getElementById('taskForm');
    this.editTaskId = document.getElementById('editTaskId');
    this.taskTitleInput = document.getElementById('taskTitleInput');
    this.taskDescInput = document.getElementById('taskDescInput');
    this.taskCategorySelect = document.getElementById('taskCategorySelect');
    this.taskPrioritySelect = document.getElementById('taskPrioritySelect');
    this.taskDueDateInput = document.getElementById('taskDueDateInput');
    this.taskTagInput = document.getElementById('taskTagInput');
    this.newSubtaskInput = document.getElementById('newSubtaskInput');
    this.addSubtaskBtn = document.getElementById('addSubtaskBtn');
    this.subtasksContainer = document.getElementById('subtasksContainer');
    this.openNewTaskModalBtn = document.getElementById('openNewTaskModalBtn');
    this.closeModalBtn = document.getElementById('closeModalBtn');
    this.cancelModalBtn = document.getElementById('cancelModalBtn');

    // Category Modal
    this.categoryModal = document.getElementById('categoryModal');
    this.categoryForm = document.getElementById('categoryForm');
    this.categoryNameInput = document.getElementById('categoryNameInput');
    this.colorPalette = document.getElementById('colorPalette');
    this.addCategoryBtn = document.getElementById('addCategoryBtn');
    this.closeCatModalBtn = document.getElementById('closeCatModalBtn');
    this.cancelCatModalBtn = document.getElementById('cancelCatModalBtn');

    // Mobile Sidebar
    this.appSidebar = document.getElementById('appSidebar');
    this.sidebarBackdrop = document.getElementById('sidebarBackdrop');
    this.menuToggleBtn = document.getElementById('menuToggleBtn');
    this.closeSidebarBtn = document.getElementById('closeSidebarBtn');

    // Theme & Data
    this.themeToggleBtn = document.getElementById('themeToggleBtn');
    this.mobileThemeToggle = document.getElementById('mobileThemeToggle');
    this.exportDataBtn = document.getElementById('exportDataBtn');
    this.importDataBtn = document.getElementById('importDataBtn');
    this.importFileInput = document.getElementById('importFileInput');
    this.toastContainer = document.getElementById('toastContainer');
  }

  // ==========================================================================
  // 4. Event Listeners Initialization
  // ==========================================================================
  initEventListeners() {
    // 1. Navigation View Switching
    this.navItems.forEach(btn => {
      btn.addEventListener('click', () => {
        this.setActiveView(btn.getAttribute('data-view'));
      });
    });

    // 2. Search & Filter Controls
    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      this.render();
    });

    this.clearSearchBtn.addEventListener('click', () => {
      this.searchInput.value = '';
      this.searchQuery = '';
      this.render();
      this.searchInput.focus();
    });

    this.priorityFilterSelect.addEventListener('change', (e) => {
      this.priorityFilter = e.target.value;
      this.render();
    });

    this.sortSelect.addEventListener('change', (e) => {
      this.sortOption = e.target.value;
      this.render();
    });

    this.clearCompletedBtn.addEventListener('click', () => {
      this.clearCompletedTasks();
    });

    // 3. Quick Add Form
    this.quickAddForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = this.quickTaskInput.value.trim();
      if (!title) return;

      const newTask = {
        id: 'task-' + Date.now(),
        title,
        description: '',
        categoryId: this.activeView.startsWith('cat-') ? this.activeView : (this.categories[0]?.id || 'cat-personal'),
        priority: this.quickPrioritySelect.value,
        dueDate: this.quickDueDateInput.value || '',
        tags: [],
        completed: false,
        createdAt: new Date().toISOString(),
        subtasks: []
      };

      this.tasks.unshift(newTask);
      this.saveTasks();
      this.quickTaskInput.value = '';
      this.quickDueDateInput.value = '';
      this.showToast('Task added successfully');
      this.render();
    });

    // 4. Modal Triggers
    this.openNewTaskModalBtn.addEventListener('click', () => this.openTaskModal());
    this.emptyStateActionBtn.addEventListener('click', () => this.openTaskModal());
    this.closeModalBtn.addEventListener('click', () => this.closeTaskModal());
    this.cancelModalBtn.addEventListener('click', () => this.closeTaskModal());

    // Subtasks inside modal
    this.addSubtaskBtn.addEventListener('click', () => this.handleAddSubtask());
    this.newSubtaskInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleAddSubtask();
      }
    });

    // Save Task Submit
    this.taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSaveTask();
    });

    // Category Modal Triggers
    this.addCategoryBtn.addEventListener('click', () => this.openCategoryModal());
    this.closeCatModalBtn.addEventListener('click', () => this.closeCategoryModal());
    this.cancelCatModalBtn.addEventListener('click', () => this.closeCategoryModal());

    // Category Color Selector
    this.colorPalette.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        this.colorPalette.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
      });
    });

    this.categoryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleCreateCategory();
    });

    // Mobile Sidebar Drawer
    this.menuToggleBtn.addEventListener('click', () => this.toggleMobileSidebar(true));
    this.closeSidebarBtn.addEventListener('click', () => this.toggleMobileSidebar(false));
    this.sidebarBackdrop.addEventListener('click', () => this.toggleMobileSidebar(false));

    // Theme Switchers
    this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
    this.mobileThemeToggle.addEventListener('click', () => this.toggleTheme());

    // Backup & Restore (JSON)
    this.exportDataBtn.addEventListener('click', () => this.exportBackup());
    this.importDataBtn.addEventListener('click', () => this.importFileInput.click());
    this.importFileInput.addEventListener('change', (e) => this.importBackup(e));

    // Global Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // Don't trigger if user is actively typing in an input
      const activeTag = document.activeElement.tagName.toLowerCase();
      const isInput = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      if (e.key === 'Escape') {
        this.closeTaskModal();
        this.closeCategoryModal();
        this.toggleMobileSidebar(false);
      } else if ((e.key === 'n' || e.key === 'N') && !isInput) {
        e.preventDefault();
        this.openTaskModal();
      } else if (e.key === '/' && !isInput) {
        e.preventDefault();
        this.searchInput.focus();
      }
    });
  }

  // ==========================================================================
  // 5. Theme Controller
  // ==========================================================================
  initTheme() {
    const savedTheme = localStorage.getItem(this.storageKeyTheme) || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(this.storageKeyTheme, next);
  }

  toggleMobileSidebar(open) {
    if (open) {
      this.appSidebar.classList.add('open');
      this.sidebarBackdrop.classList.add('open');
    } else {
      this.appSidebar.classList.remove('open');
      this.sidebarBackdrop.classList.remove('open');
    }
  }

  // ==========================================================================
  // 6. Navigation & View Routing
  // ==========================================================================
  setActiveView(viewId) {
    this.activeView = viewId;

    // Update nav classes
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(el => {
      el.classList.remove('active');
      if (el.getAttribute('data-view') === viewId) {
        el.classList.add('active');
      }
    });

    // Update Header Titles
    const viewMeta = {
      'all': { title: 'All Tasks', subtitle: 'Manage and prioritize your daily agenda' },
      'today': { title: 'Due Today', subtitle: 'Urgent tasks scheduled for completion today' },
      'upcoming': { title: 'Upcoming', subtitle: 'Tasks scheduled for future days' },
      'completed': { title: 'Completed', subtitle: 'Archive of tasks you have finished' }
    };

    if (viewMeta[viewId]) {
      this.currentViewTitle.innerText = viewMeta[viewId].title;
      this.currentViewSubtitle.innerText = viewMeta[viewId].subtitle;
    } else if (viewId.startsWith('cat-')) {
      const cat = this.categories.find(c => c.id === viewId);
      this.currentViewTitle.innerText = cat ? cat.name : 'Category List';
      this.currentViewSubtitle.innerText = `Tasks filed under ${cat ? cat.name : 'this category'}`;
    }

    // Close mobile drawer on item selection
    this.toggleMobileSidebar(false);

    this.render();
  }

  // ==========================================================================
  // 7. Categories Management
  // ==========================================================================
  renderCategoriesNav() {
    this.categoryNavList.innerHTML = this.categories.map(cat => {
      const count = this.tasks.filter(t => !t.completed && t.categoryId === cat.id).length;
      const isActive = this.activeView === cat.id ? 'active' : '';
      return `
        <button class="nav-item ${isActive}" data-view="${cat.id}">
          <span class="category-color-dot" style="background: ${cat.color};"></span>
          <span class="nav-label">${this.escapeHTML(cat.name)}</span>
          <span class="nav-badge">${count}</span>
        </button>
      `;
    }).join('');

    // Reattach click listeners for custom categories
    this.categoryNavList.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setActiveView(btn.getAttribute('data-view'));
      });
    });
  }

  populateCategorySelects() {
    const optionsHTML = this.categories.map(cat => `
      <option value="${cat.id}">${this.escapeHTML(cat.name)}</option>
    `).join('');

    this.taskCategorySelect.innerHTML = optionsHTML;
  }

  openCategoryModal() {
    this.categoryNameInput.value = '';
    this.categoryModal.classList.add('open');
    this.categoryModal.setAttribute('aria-hidden', 'false');
    setTimeout(() => this.categoryNameInput.focus(), 100);
  }

  closeCategoryModal() {
    this.categoryModal.classList.remove('open');
    this.categoryModal.setAttribute('aria-hidden', 'true');
  }

  handleCreateCategory() {
    const name = this.categoryNameInput.value.trim();
    if (!name) return;

    const selectedSwatch = this.colorPalette.querySelector('.color-swatch.active');
    const color = selectedSwatch ? selectedSwatch.getAttribute('data-color') : '#3b82f6';

    const newCategory = {
      id: 'cat-' + Date.now(),
      name,
      color
    };

    this.categories.push(newCategory);
    this.saveCategories();
    this.renderCategoriesNav();
    this.populateCategorySelects();
    this.closeCategoryModal();
    this.showToast(`List "${name}" created!`);
  }

  // ==========================================================================
  // 8. Task Modal & CRUD
  // ==========================================================================
  openTaskModal(task = null) {
    if (task) {
      // Edit Mode
      this.modalTitle.innerText = 'Edit Task';
      this.editTaskId.value = task.id;
      this.taskTitleInput.value = task.title;
      this.taskDescInput.value = task.description || '';
      this.taskCategorySelect.value = task.categoryId || this.categories[0]?.id;
      this.taskPrioritySelect.value = task.priority || 'medium';
      this.taskDueDateInput.value = task.dueDate || '';
      this.taskTagInput.value = (task.tags || []).join(', ');
      this.currentEditSubtasks = task.subtasks ? JSON.parse(JSON.stringify(task.subtasks)) : [];
    } else {
      // Create Mode
      this.modalTitle.innerText = 'Create New Task';
      this.editTaskId.value = '';
      this.taskForm.reset();
      this.taskPrioritySelect.value = 'medium';
      if (this.activeView.startsWith('cat-')) {
        this.taskCategorySelect.value = this.activeView;
      }
      this.currentEditSubtasks = [];
    }

    this.renderModalSubtasks();
    this.taskModal.classList.add('open');
    this.taskModal.setAttribute('aria-hidden', 'false');
    setTimeout(() => this.taskTitleInput.focus(), 100);
  }

  closeTaskModal() {
    this.taskModal.classList.remove('open');
    this.taskModal.setAttribute('aria-hidden', 'true');
  }

  handleAddSubtask() {
    const title = this.newSubtaskInput.value.trim();
    if (!title) return;

    this.currentEditSubtasks.push({
      id: 'st-' + Date.now(),
      title,
      completed: false
    });

    this.newSubtaskInput.value = '';
    this.renderModalSubtasks();
  }

  renderModalSubtasks() {
    if (this.currentEditSubtasks.length === 0) {
      this.subtasksContainer.innerHTML = '<span style="font-size: 0.8rem; color: var(--text-subtle);">No checklist items added yet.</span>';
      return;
    }

    this.subtasksContainer.innerHTML = this.currentEditSubtasks.map((st, i) => `
      <div class="subtask-edit-item">
        <span>${this.escapeHTML(st.title)}</span>
        <button type="button" class="icon-btn" onclick="taskApp.removeSubtask(${i})" style="width: 22px; height: 22px; font-size: 0.75rem;">✕</button>
      </div>
    `).join('');
  }

  removeSubtask(index) {
    this.currentEditSubtasks.splice(index, 1);
    this.renderModalSubtasks();
  }

  handleSaveTask() {
    const id = this.editTaskId.value;
    const title = this.taskTitleInput.value.trim();
    if (!title) return;

    const rawTags = this.taskTagInput.value.split(',').map(t => t.trim()).filter(Boolean);

    if (id) {
      // Update existing task
      const taskIndex = this.tasks.findIndex(t => t.id === id);
      if (taskIndex !== -1) {
        this.tasks[taskIndex] = {
          ...this.tasks[taskIndex],
          title,
          description: this.taskDescInput.value.trim(),
          categoryId: this.taskCategorySelect.value,
          priority: this.taskPrioritySelect.value,
          dueDate: this.taskDueDateInput.value,
          tags: rawTags,
          subtasks: this.currentEditSubtasks
        };
        this.showToast('Task updated successfully');
      }
    } else {
      // Add new task
      const newTask = {
        id: 'task-' + Date.now(),
        title,
        description: this.taskDescInput.value.trim(),
        categoryId: this.taskCategorySelect.value,
        priority: this.taskPrioritySelect.value,
        dueDate: this.taskDueDateInput.value,
        tags: rawTags,
        completed: false,
        createdAt: new Date().toISOString(),
        subtasks: this.currentEditSubtasks
      };
      this.tasks.unshift(newTask);
      this.showToast('Task created successfully');
    }

    this.saveTasks();
    this.closeTaskModal();
    this.render();
  }

  toggleTaskComplete(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : null;

    // Also auto-complete subtasks if task is checked
    if (task.completed && task.subtasks) {
      task.subtasks.forEach(st => st.completed = true);
    }

    this.saveTasks();
    this.render();
  }

  toggleSubtaskComplete(taskId, subtaskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return;

    const subtask = task.subtasks.find(st => st.id === subtaskId);
    if (subtask) {
      subtask.completed = !subtask.completed;
      // If all subtasks are completed, prompt or update task
      const allDone = task.subtasks.every(st => st.completed);
      if (allDone && !task.completed) {
        task.completed = true;
      }
      this.saveTasks();
      this.render();
    }
  }

  deleteTask(id) {
    const taskIndex = this.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;

    // Cache for Undo
    this.lastDeletedTask = {
      task: this.tasks[taskIndex],
      index: taskIndex
    };

    this.tasks.splice(taskIndex, 1);
    this.saveTasks();
    this.render();

    this.showToast('Task deleted', true);
  }

  undoDelete() {
    if (!this.lastDeletedTask) return;
    this.tasks.splice(this.lastDeletedTask.index, 0, this.lastDeletedTask.task);
    this.saveTasks();
    this.lastDeletedTask = null;
    this.render();
    this.showToast('Deletion undone');
  }

  clearCompletedTasks() {
    const completedCount = this.tasks.filter(t => t.completed).length;
    if (completedCount === 0) {
      this.showToast('No completed tasks to clear');
      return;
    }

    if (confirm(`Are you sure you want to delete all ${completedCount} completed task(s)?`)) {
      this.tasks = this.tasks.filter(t => !t.completed);
      this.saveTasks();
      this.render();
      this.showToast(`Cleared ${completedCount} completed task(s)`);
    }
  }

  // ==========================================================================
  // 9. Filtering, Sorting, & Statistics
  // ==========================================================================
  getFilteredTasks() {
    const todayStr = new Date().toISOString().split('T')[0];

    return this.tasks.filter(task => {
      // 1. Navigation View Filtering
      if (this.activeView === 'today') {
        if (task.dueDate !== todayStr) return false;
      } else if (this.activeView === 'upcoming') {
        if (!task.dueDate || task.dueDate <= todayStr) return false;
      } else if (this.activeView === 'completed') {
        if (!task.completed) return false;
      } else if (this.activeView.startsWith('cat-')) {
        if (task.categoryId !== this.activeView) return false;
      }

      // Hide completed tasks in today/upcoming if viewing active
      if ((this.activeView === 'today' || this.activeView === 'upcoming') && task.completed) {
        return false;
      }

      // 2. Priority Filter
      if (this.priorityFilter !== 'all' && task.priority !== this.priorityFilter) {
        return false;
      }

      // 3. Search Query
      if (this.searchQuery) {
        const titleMatch = task.title.toLowerCase().includes(this.searchQuery);
        const descMatch = (task.description || '').toLowerCase().includes(this.searchQuery);
        const tagMatch = (task.tags || []).some(t => t.toLowerCase().includes(this.searchQuery));
        if (!titleMatch && !descMatch && !tagMatch) return false;
      }

      return true;
    });
  }

  sortTasks(tasks) {
    const priorityWeight = { high: 3, medium: 2, low: 1 };

    return tasks.sort((a, b) => {
      // Put completed tasks at the bottom by default
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      switch (this.sortOption) {
        case 'createdAt-desc':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'createdAt-asc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'dueDate-asc':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        case 'priority-desc':
          return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        case 'title-asc':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }

  updateBadgesAndStats() {
    const todayStr = new Date().toISOString().split('T')[0];

    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;
    const dueToday = this.tasks.filter(t => !t.completed && t.dueDate === todayStr).length;
    const upcoming = this.tasks.filter(t => !t.completed && t.dueDate && t.dueDate > todayStr).length;

    // Badges
    this.badgeAll.innerText = total - completed;
    this.badgeToday.innerText = dueToday;
    this.badgeUpcoming.innerText = upcoming;
    this.badgeCompleted.innerText = completed;

    // Progress Bar
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    this.statsPercentage.innerText = `${percentage}%`;
    this.progressBarFill.style.width = `${percentage}%`;
    this.statsCompletedCount.innerText = `${completed} completed`;
    this.statsTotalCount.innerText = `${total} total`;

    // Re-render categories nav badge numbers
    this.renderCategoriesNav();
  }

  // ==========================================================================
  // 10. Render Engine
  // ==========================================================================
  render() {
    this.updateBadgesAndStats();

    const filtered = this.getFilteredTasks();
    const sorted = this.sortTasks(filtered);

    if (sorted.length === 0) {
      this.tasksList.innerHTML = '';
      this.emptyState.style.display = 'block';

      if (this.searchQuery) {
        this.emptyStateTitle.innerText = 'No matching tasks';
        this.emptyStateSubtitle.innerText = `No results found for "${this.searchQuery}". Try different keywords.`;
      } else if (this.activeView === 'completed') {
        this.emptyStateTitle.innerText = 'No completed tasks yet';
        this.emptyStateSubtitle.innerText = 'When you complete tasks, they will appear here.';
      } else {
        this.emptyStateTitle.innerText = 'No tasks in this list';
        this.emptyStateSubtitle.innerText = 'Enjoy your free time, or create a new task to get started!';
      }
      return;
    }

    this.emptyState.style.display = 'none';
    this.tasksList.innerHTML = sorted.map(task => this.renderTaskItem(task)).join('');

    // Attach dynamic click listeners for task card buttons
    this.attachTaskCardListeners();
  }

  renderTaskItem(task) {
    const category = this.categories.find(c => c.id === task.categoryId);
    const todayStr = new Date().toISOString().split('T')[0];

    // Due Date Label formatting
    let dueDateHTML = '';
    if (task.dueDate) {
      let dueClass = '';
      let dueLabel = task.dueDate;

      if (!task.completed) {
        if (task.dueDate < todayStr) {
          dueClass = 'overdue';
          dueLabel = `⚠️ Overdue (${task.dueDate})`;
        } else if (task.dueDate === todayStr) {
          dueClass = 'today';
          dueLabel = '⭐ Due Today';
        } else {
          dueLabel = `📅 ${task.dueDate}`;
        }
      } else {
        dueLabel = `📅 ${task.dueDate}`;
      }

      dueDateHTML = `<span class="meta-pill due-pill ${dueClass}">${dueLabel}</span>`;
    }

    // Subtasks summary
    let subtasksHTML = '';
    if (task.subtasks && task.subtasks.length > 0) {
      const doneSub = task.subtasks.filter(s => s.completed).length;
      subtasksHTML = `
        <div class="subtasks-progress">
          <span>☑️ ${doneSub}/${task.subtasks.length} subtasks</span>
        </div>
      `;
    }

    // Tags list
    const tagsHTML = (task.tags || []).map(tag => `
      <span class="tag-badge">#${this.escapeHTML(tag)}</span>
    `).join('');

    return `
      <div class="task-item priority-${task.priority} ${task.completed ? 'completed' : ''}" data-id="${task.id}">
        <div class="task-checkbox-wrapper">
          <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} aria-label="Toggle complete">
        </div>

        <div class="task-content">
          <h3 class="task-title">${this.escapeHTML(task.title)}</h3>
          ${task.description ? `<p class="task-description">${this.escapeHTML(task.description)}</p>` : ''}
          ${subtasksHTML}

          <div class="task-meta">
            ${category ? `
              <span class="meta-pill">
                <span class="category-color-dot" style="background: ${category.color};"></span>
                <span>${this.escapeHTML(category.name)}</span>
              </span>
            ` : ''}

            <span class="meta-pill priority-pill priority-${task.priority}">${task.priority}</span>
            ${dueDateHTML}
            ${tagsHTML}
          </div>
        </div>

        <div class="task-actions">
          <button class="task-action-btn edit-btn" title="Edit Task" aria-label="Edit Task">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="task-action-btn delete-btn" title="Delete Task" aria-label="Delete Task">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    `;
  }

  attachTaskCardListeners() {
    this.tasksList.querySelectorAll('.task-item').forEach(card => {
      const id = card.getAttribute('data-id');

      // Checkbox click
      const checkbox = card.querySelector('.task-checkbox');
      checkbox.addEventListener('change', () => this.toggleTaskComplete(id));

      // Edit click
      const editBtn = card.querySelector('.edit-btn');
      editBtn.addEventListener('click', () => {
        const task = this.tasks.find(t => t.id === id);
        if (task) this.openTaskModal(task);
      });

      // Delete click
      const deleteBtn = card.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', () => this.deleteTask(id));
    });
  }

  // ==========================================================================
  // 11. Toast Notifications & Undo System
  // ==========================================================================
  showToast(message, canUndo = false) {
    if (this.undoTimeout) clearTimeout(this.undoTimeout);

    this.toastContainer.innerHTML = `
      <div class="toast">
        <span>${this.escapeHTML(message)}</span>
        ${canUndo ? `<button class="toast-undo-btn" id="toastUndoBtn">Undo</button>` : ''}
      </div>
    `;

    if (canUndo) {
      const undoBtn = document.getElementById('toastUndoBtn');
      if (undoBtn) {
        undoBtn.addEventListener('click', () => {
          this.undoDelete();
          this.toastContainer.innerHTML = '';
        });
      }
    }

    this.undoTimeout = setTimeout(() => {
      this.toastContainer.innerHTML = '';
      this.lastDeletedTask = null;
    }, 4500);
  }

  // ==========================================================================
  // 12. Backup & Restore (JSON)
  // ==========================================================================
  exportBackup() {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      tasks: this.tasks,
      categories: this.categories
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Backup downloaded successfully');
  }

  importBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported.tasks)) {
          this.tasks = imported.tasks;
          if (Array.isArray(imported.categories)) {
            this.categories = imported.categories;
          }
          this.saveTasks();
          this.saveCategories();
          this.renderCategoriesNav();
          this.populateCategorySelects();
          this.render();
          this.showToast('Backup restored successfully!');
        } else {
          alert('Invalid backup file format');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Global App Initialization
let taskApp;
document.addEventListener('DOMContentLoaded', () => {
  taskApp = new TaskApp();
});
