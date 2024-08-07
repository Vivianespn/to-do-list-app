document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');
  const errorMessage = document.getElementById('error-message');
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

  let draggedItem = null;

  loadTodos();

  loadTheme();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value.trim() !== '') {
      if (!isDuplicate(input.value.trim())) {
        addTodo(input.value.trim());
        input.value = '';
        errorMessage.style.display = 'none';
      } else {
        showError('Tarefa duplicada!');
      }
    }
  });

  function addEventListenersToButtons() {
    todoList
      .querySelectorAll('.remove')
      .forEach((button) => button.addEventListener('click', handleRemoveClick));
    todoList
      .querySelectorAll('.edit')
      .forEach((button) => button.addEventListener('click', handleEditClick));
    todoList
      .querySelectorAll('.checkbox')
      .forEach((checkbox) =>
        checkbox.addEventListener('click', handleCheckboxClick)
      );
  }

  function handleRemoveClick(e) {
    const index = e.target.closest('li').dataset.index;
    removeTodo(index);
  }

  function handleEditClick(e) {
    const index = e.target.closest('li').dataset.index;
    editTodo(index);
  }

  function handleCheckboxClick(e) {
    const index = e.target.closest('li').dataset.index;
    toggleTodoCompletion(index);
  }

  todoList.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'LI') {
      draggedItem = e.target;
      e.target.style.opacity = '0.5';
    }
  });

  todoList.addEventListener('dragend', (e) => {
    e.target.style.opacity = '1';
  });

  todoList.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  todoList.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.target.tagName === 'LI' && draggedItem !== e.target) {
      const todos = getTodos();
      const draggedIndex = Array.from(todoList.children).indexOf(draggedItem);
      const targetIndex = Array.from(todoList.children).indexOf(e.target);

      todos.splice(targetIndex, 0, todos.splice(draggedIndex, 1)[0]);
      saveTodos(todos);
      renderTodos();
    }
  });

  themeToggle.addEventListener('click', () => {
    toggleTheme();
    saveTheme();
  });

  function addTodo(text) {
    const todos = getTodos();
    todos.push({ text, completed: false });
    saveTodos(todos);
    renderTodos();
  }

  function removeTodo(index) {
    let todos = getTodos();
    todos.splice(index, 1);
    saveTodos(todos);
    renderTodos();
  }

  function editTodo(index) {
    let todos = getTodos();
    const li = todoList.querySelector(`[data-index='${index}']`);
    const text = todos[index].text;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = text;
    input.classList.add('edit-mode');
    input.setAttribute('aria-label', `Editar tarefa: ${text}`);

    const saveButton = document.createElement('button');
    saveButton.innerHTML = '<i class="fas fa-save" aria-hidden="true"></i>';
    saveButton.classList.add('salvar');
    saveButton.setAttribute('aria-label', 'Salvar tarefa editada');

    li.innerHTML = '';
    li.appendChild(input);
    li.appendChild(saveButton);

    saveButton.addEventListener('click', () => {
      const newText = input.value.trim();
      if (newText) {
        todos[index].text = newText;
        saveTodos(todos);
        renderTodos();
      }
    });
  }

  function toggleTodoCompletion(index) {
    let todos = getTodos();
    todos[index].completed = !todos[index].completed;
    saveTodos(todos);
    renderTodos();
  }

  function getTodos() {
    const todos = localStorage.getItem('todos');
    return todos ? JSON.parse(todos) : [];
  }

  function saveTodos(todos) {
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  function renderTodos() {
    const todos = getTodos();
    todoList.innerHTML = '';
    todos.forEach((todo, index) => {
      const li = document.createElement('li');
      li.dataset.index = index;
      li.setAttribute('role', 'listitem');
      li.setAttribute('draggable', 'true');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.classList.add('checkbox');
      checkbox.checked = todo.completed;
      checkbox.setAttribute('aria-label', `Concluir tarefa: ${todo.text}`);

      const textSpan = document.createElement('span');
      textSpan.textContent = todo.text;
      if (todo.completed) {
        textSpan.classList.add('completed');
      }

      const editButton = document.createElement('button');
      editButton.innerHTML = '<i class="fas fa-edit" aria-hidden="true"></i>';
      editButton.classList.add('edit');
      editButton.setAttribute('aria-label', `Editar ${todo.text}`);

      const removeButton = document.createElement('button');
      removeButton.innerHTML =
        '<i class="fas fa-trash-alt" aria-hidden="true"></i>';
      removeButton.classList.add('remove');
      removeButton.setAttribute('aria-label', `Remover ${todo.text}`);

      li.appendChild(checkbox);
      li.appendChild(textSpan);
      li.appendChild(editButton);
      li.appendChild(removeButton);

      todoList.appendChild(li);
    });

    addEventListenersToButtons();
  }

  function loadTodos() {
    renderTodos();
  }

  function isDuplicate(text) {
    const todos = getTodos();
    return todos.some((todo) => todo.text.toLowerCase() === text.toLowerCase());
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
  }

  function loadTheme() {
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
      body.classList.add('dark');
      themeToggle.innerHTML = '<i class="fas fa-sun" aria-hidden="true"></i>';
    } else {
      themeToggle.innerHTML = '<i class="fas fa-moon" aria-hidden="true"></i>';
    }
  }

  function saveTheme() {
    const darkMode = body.classList.contains('dark') ? 'enabled' : 'disabled';
    localStorage.setItem('darkMode', darkMode);
  }

  function toggleTheme() {
    body.classList.toggle('dark');
    const isDarkMode = body.classList.contains('dark');
    themeToggle.innerHTML = isDarkMode
      ? '<i class="fas fa-sun" aria-hidden="true"></i>'
      : '<i class="fas fa-moon" aria-hidden="true"></i>';
  }
});
