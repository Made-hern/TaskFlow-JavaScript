
// TaskFlow application logic

const STORAGE_KEY = "taskflow_tasks_v1";

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const taskFilter = document.querySelector("#task-filter");
const emptyState = document.querySelector("#empty-state");

// Load saved tasks safely when the application starts.
let tasks = loadTasks();

// Display today's date and the initial task list.
document.querySelector("#today").textContent =
  new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date());

renderTasks();

// Listen for form submission and filter changes.
taskForm.addEventListener("submit", handleAddTask);
taskFilter.addEventListener("change", renderTasks);

// Return saved tasks or an empty array if storage is unavailable or invalid.
function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);

    return savedTasks ? JSON.parse(savedTasks) : [];

  } catch (error) {
    console.error("Could not load saved tasks:", error);
    return [];
  }
}

// Save the current task array and handle browser storage errors.
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));

  } catch (error) {
    console.error("Could not save tasks:", error);

    Swal.fire(
      "Storage error",
      "Your browser could not save the tasks.",
      "error"
    );
  }
}

// Create a unique task object after validating the user's input.
function handleAddTask(event) {
  event.preventDefault();

  const title = taskInput.value.trim();

  if (!title) {
    Swal.fire(
      "Task required",
      "Please enter a task description.",
      "warning"
    );

    taskInput.focus();
    return;
  }

  const newTask = {
    id: Date.now(),
    title: title,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);

  saveTasks();
  taskForm.reset();
  renderTasks();
  taskInput.focus();
}

// Return the tasks that match the selected filter using Array.filter().
function getVisibleTasks() {
  const filter = taskFilter.value;

  return tasks.filter((task) => {
    if (filter === "pending") return !task.completed;

    if (filter === "completed") return task.completed;

    return true;
  });
}

// Render task items using DOM methods and Array.forEach().
function renderTasks() {
  taskList.replaceChildren();

  const visibleTasks = getVisibleTasks();

  visibleTasks.forEach((task) => {
    const item = document.createElement("li");

    item.className = task.completed
      ? "task-item completed"
      : "task-item";

    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.checked = task.completed;

    checkbox.setAttribute(
      "aria-label",
      `Mark ${task.title} as completed`
    );

    checkbox.addEventListener("change", () => {
      toggleTask(task.id);
    });

    const title = document.createElement("span");

    title.className = "task-text";
    title.textContent = task.title;

    const actions = document.createElement("div");

    actions.className = "task-actions";

    const editButton = document.createElement("button");

    editButton.type = "button";
    editButton.textContent = "Edit";

    editButton.addEventListener("click", () => {
      editTask(task.id);
    });

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete";

    deleteButton.addEventListener("click", () => {
      deleteTask(task.id);
    });

    actions.append(editButton, deleteButton);

    item.append(checkbox, title, actions);

    taskList.append(item);
  });

  emptyState.hidden = visibleTasks.length > 0;

  updateStatistics();
}

// Update the task counters with Array.filter() and Array.map().
function updateStatistics() {
  const completed = tasks.filter(
    (task) => task.completed
  ).length;

  const pending = tasks
    .map((task) => task.completed)
    .filter((value) => !value).length;

  document.querySelector("#total-count").textContent =
    tasks.length;

  document.querySelector("#pending-count").textContent =
    pending;

  document.querySelector("#completed-count").textContent =
    completed;
}

// Toggle the completion status of one task.
function toggleTask(taskId) {
  tasks = tasks.map((task) =>
    task.id === taskId
      ? { ...task, completed: !task.completed }
      : task
  );

  saveTasks();
  renderTasks();
}

// Ask for a new title and update the selected task.
async function editTask(taskId) {
  const task = tasks.find(
    (item) => item.id === taskId
  );

  if (!task) return;

  const result = await Swal.fire({
    title: "Edit task",
    input: "text",
    inputValue: task.title,
    showCancelButton: true,
    confirmButtonText: "Save",

    inputValidator: (value) => {
      return value.trim()
        ? undefined
        : "A task cannot be empty.";
    }
  });

  if (result.isConfirmed) {
    tasks = tasks.map((item) =>
      item.id === taskId
        ? { ...item, title: result.value.trim() }
        : item
    );

    saveTasks();
    renderTasks();
  }
}

// Confirm before removing a task from the list.
async function deleteTask(taskId) {
  const result = await Swal.fire({
    title: "Delete this task?",
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete",
    confirmButtonColor: "#b42318"
  });

  if (result.isConfirmed) {
    tasks = tasks.filter(
      (task) => task.id !== taskId
    );

    saveTasks();
    renderTasks();

    Swal.fire(
      "Deleted",
      "Your task was removed.",
      "success"
    );
  }
}

// Recursively count completed tasks to demonstrate recursion.
function countCompletedRecursively(taskArray, index = 0) {
  if (index >= taskArray.length) {
    return 0;
  }

  const currentCount = taskArray[index].completed ? 1 : 0;

  return currentCount +
    countCompletedRecursively(taskArray, index + 1);
}

// Log a recursive calculation for development and demonstration.
console.info(
  "Completed tasks (recursive count):",
  countCompletedRecursively(tasks)
);
