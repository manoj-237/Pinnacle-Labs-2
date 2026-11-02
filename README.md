# 📋 TaskFlow - Modern To-Do & Task Management Web Application

A responsive, feature-rich web application built with vanilla web technologies (**HTML5, CSS3, JavaScript ES6+**) designed for creating, organizing, prioritizing, and completing daily to-do lists and projects.

---

## 🌟 Key Features

### 1. Complete Task CRUD & Management
- **Create & Edit Tasks**: Full support for task title, detailed notes/descriptions, category selection, priority levels, due date, tags, and subtask checklists.
- **Quick-Add Bar**: Rapid task creation without opening modals—just type and press <kbd>Enter</kbd>.
- **Completion Tracking**: Click checkbox with smooth strikethrough animation and auto-sorting (completed tasks move below active items).
- **Subtasks / Checklists**: Add sub-items to complex tasks with real-time completion progress indicators (`☑️ 1/2 subtasks`).
- **Undo Delete**: Accidental deletion recovery via an interactive toast notification with an **Undo** button.

### 2. Multi-List Organization & Views
- **Smart Filter Views**:
  - **All Tasks**: Overview of all active and completed items.
  - **Due Today**: Automatically surfaces urgent tasks due today with warning badges.
  - **Upcoming**: Scheduled future tasks.
  - **Completed**: Archive of accomplishments with option to bulk clear.
- **Custom Lists & Categories**: Create custom project categories (e.g., *Work, Personal, Fitness, Learning*) with custom color swatches.
- **Live Search & Filter**: Instant filtering across titles, descriptions, and `#tags`. Filter by Priority (*High, Medium, Low*) or sort by *Due Date, Creation Date, or Priority*.

### 3. Productivity Dashboard
- **Progress Bar & Daily Stats**: Visual percentage completion bar and real-time counts.
- **Data Backup & Restore**: Export your tasks as a portable `.json` file and restore them on any computer.
- **Theme Switcher**: Dark and light modes with seamless CSS custom variable switching and persistent local state.

### 4. Keyboard Shortcuts
| Key | Action |
| :--- | :--- |
| <kbd>N</kbd> | Open New Task modal |
| <kbd>/</kbd> | Focus the search bar immediately |
| <kbd>Esc</kbd> | Close any open modal, dialog, or search |
| <kbd>Enter</kbd> (in quick add) | Create task instantly |

---

## 📁 Project Structure

```text
todo-app/
├── index.html       # Semantic HTML5 layout, modals, sidebar, and accessible controls
├── style.css        # Responsive layout, CSS Custom Property themes, animations
├── app.js           # OOP TaskApp class, state management, filtering, and localStorage
└── README.md        # Documentation and guide
```

---

## 🚀 How to Run the Application

### Option 1: Directly in Any Browser
1. Navigate to:
   ```text
   C:\Users\KOTAGIRI RISHIK\.gemini\antigravity\scratch\todo-app
   ```
2. Double-click **`index.html`** to launch it in Chrome, Edge, Firefox, or Safari.

### Option 2: Using Python's Built-in Server
Open PowerShell in the project directory and run:
```powershell
cd "C:\Users\KOTAGIRI RISHIK\.gemini\antigravity\scratch\todo-app"
python -m http.server 3000
```
Then visit `http://localhost:3000` in your web browser.

---

## 💡 Web Architecture Highlights

1. **Pure Vanilla JS (No External Framework Dependencies)**:
   - Ultra-fast load times with zero build steps or package installations required.
2. **Defensive LocalStorage Persistence**:
   - Automatically synchronizes tasks, categories, and theme settings to `localStorage`.
3. **Responsive Mobile-First Architecture**:
   - Collapsible slide-over drawer navigation on mobile and tablet screens.
4. **Accessible Semantics**:
   - ARIA attributes, semantic headings, proper button labels, and focusable elements.
