const STORAGE_KEY = 'todo-app-tasks';

// ── State ──────────────────────────────────────────────
let tasks = load();
let currentFilter = 'all';
let dragSrcIndex = null;

// ── DOM refs ───────────────────────────────────────────
const inputForm   = document.getElementById('inputForm');
const taskInput   = document.getElementById('taskInput');
const taskList    = document.getElementById('taskList');
const remaining   = document.getElementById('remaining');
const clearBtn    = document.getElementById('clearCompleted');
const filterBtns  = document.querySelectorAll('.filter-btn');
const todayEl     = document.getElementById('today');

// ── Init ───────────────────────────────────────────────
todayEl.textContent = new Date().toLocaleDateString('ja-JP', {
  year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
});

render();

// ── Event listeners ────────────────────────────────────
inputForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;
  tasks.push({ id: Date.now(), text, done: false });
  taskInput.value = '';
  save();
  render();
});

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

clearBtn.addEventListener('click', () => {
  tasks = tasks.filter((t) => !t.done);
  save();
  render();
});

// ── Render ─────────────────────────────────────────────
function render() {
  const filtered = tasks.filter((t) => {
    if (currentFilter === 'active')    return !t.done;
    if (currentFilter === 'completed') return  t.done;
    return true;
  });

  taskList.innerHTML = '';
  filtered.forEach((task) => {
    taskList.appendChild(createItem(task));
  });

  const activeCount = tasks.filter((t) => !t.done).length;
  remaining.textContent = `残り ${activeCount} 件`;
}

// ── Create task element ────────────────────────────────
function createItem(task) {
  const realIndex = tasks.indexOf(task);

  const li = document.createElement('li');
  li.className = 'task-item' + (task.done ? ' done' : '');
  li.draggable = true;
  li.dataset.index = realIndex;

  // Checkbox
  const check = document.createElement('input');
  check.type = 'checkbox';
  check.className = 'task-check';
  check.checked = task.done;
  check.addEventListener('change', () => {
    tasks[realIndex].done = check.checked;
    save();
    render();
  });

  // Text (inline edit on double-click)
  const span = document.createElement('span');
  span.className = 'task-text';
  span.textContent = task.text;
  span.title = 'ダブルクリックで編集';
  span.addEventListener('dblclick', () => startEdit(span, realIndex));

  // Delete button
  const del = document.createElement('button');
  del.className = 'delete-btn';
  del.textContent = '✕';
  del.title = '削除';
  del.addEventListener('click', () => {
    tasks.splice(realIndex, 1);
    save();
    render();
  });

  // Drag events
  li.addEventListener('dragstart', () => {
    dragSrcIndex = realIndex;
    li.classList.add('dragging');
  });
  li.addEventListener('dragend', () => li.classList.remove('dragging'));
  li.addEventListener('dragover', (e) => {
    e.preventDefault();
    li.classList.add('drag-over');
  });
  li.addEventListener('dragleave', () => li.classList.remove('drag-over'));
  li.addEventListener('drop', (e) => {
    e.preventDefault();
    li.classList.remove('drag-over');
    if (dragSrcIndex === null || dragSrcIndex === realIndex) return;
    const moved = tasks.splice(dragSrcIndex, 1)[0];
    const dest = dragSrcIndex < realIndex ? realIndex : realIndex;
    tasks.splice(dest, 0, moved);
    dragSrcIndex = null;
    save();
    render();
  });

  li.append(check, span, del);
  return li;
}

// ── Inline edit ────────────────────────────────────────
function startEdit(span, index) {
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'task-input';
  input.style.cssText = 'flex:1; padding:4px 8px; font-size:0.95rem;';
  input.value = tasks[index].text;

  span.replaceWith(input);
  input.focus();
  input.select();

  const commit = () => {
    const val = input.value.trim();
    if (val) tasks[index].text = val;
    save();
    render();
  };

  input.addEventListener('blur', commit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') render();
  });
}

// ── Persistence ────────────────────────────────────────
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}
