document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');

    // Load tasks from localStorage when the page loads
    loadTasks();

    // Add Task Event Listener
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    });

    function addTask() {
        const taskText = taskInput.value.trim();

        if (taskText === '') {
            alert('Please enter a task!');
            return;
        }

        createTaskElement(taskText, false); // false indicates not completed initially
        saveTasks(); // Save tasks to localStorage
        taskInput.value = ''; // Clear the input field
    }

    function createTaskElement(text, isCompleted) {
        const listItem = document.createElement('li');

        // Task Text (clickable to toggle completion)
        const taskSpan = document.createElement('span');
        taskSpan.textContent = text;
        taskSpan.classList.add('task-text');
        if (isCompleted) {
            listItem.classList.add('completed');
        }
        taskSpan.addEventListener('click', () => {
            listItem.classList.toggle('completed');
            saveTasks(); // Save after toggling completion
        });

        // Delete Button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-btn');
        deleteButton.addEventListener('click', () => {
            taskList.removeChild(listItem);
            saveTasks(); // Save after deleting
        });

        listItem.appendChild(taskSpan);
        listItem.appendChild(deleteButton);
        taskList.appendChild(listItem);
    }

    function saveTasks() {
        const tasks = [];
        taskList.querySelectorAll('li').forEach(listItem => {
            tasks.push({
                text: listItem.querySelector('.task-text').textContent,
                completed: listItem.classList.contains('completed')
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            const tasks = JSON.parse(storedTasks);
            tasks.forEach(task => {
                createTaskElement(task.text, task.completed);
            });
        }
    }
});
