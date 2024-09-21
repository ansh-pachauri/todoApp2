
async function addTodo() {
    const todoInput = document.getElementById('todo-input');
    const todoText = todoInput.value.trim();
    if (todoText === '') return;
  
    // Create a new todo item in the DOM before making the API request
    const todoList = document.getElementById('todo-list');
    const todoItem = document.createElement('div');
    todoItem.className = 'todo-item';
    todoItem.innerHTML = `
      <input type="checkbox" class="todo-checkbox">
      <span>${todoText}</span>
      <button class="delete-btn">×</button>
    `;
  
    // Add the new todo item to the DOM
    todoList.appendChild(todoItem);
    todoInput.value = '';
  
    // Add event listeners to the new todo item
    const deleteBtn = todoItem.querySelector('.delete-btn');
    const checkbox = todoItem.querySelector('.todo-checkbox');
  
    deleteBtn.addEventListener('click', () => {
      deleteTodo(deleteBtn);
    });
  
    checkbox.addEventListener('click', () => {
      toggleTodo(checkbox);
    });

    const token = localStorage.getItem('token'); 
    if (!token) {
        alert('You need to sign in to add a todo.');
        todoItem.remove(); // Remove the todo from the DOM if no token
        return;
    }
  
    const config = {
        headers: { Authorization:` Bearer ${token}` }
      };
      
      const bodyParameters = {
       title: todoText   
      };
      
      axios.post( 
      'http://localhost:3000/todo',
      bodyParameters,
      config
      )
  
    .then(response => {
     
  
      // Log and handle the response from the server
      const todoData = response.data;
      todoItem.dataset.id = todoData.id;
      console.log('Todo added:',todoData);
    }).catch(error => {
      console.error('Error adding To-Do:', error);
      alert('Error adding To-Do. Please try again.');
      
      // Remove the todo item from the DOM if there was an error adding to the database
      todoItem.remove();
    });
  }

  

  // Function to delete a todo item
function deleteTodo(button) {
    const todoItem = button.parentElement;
    todoItem.remove();
  }
  
  // Function to toggle the todo (mark complete/incomplete)
  function toggleTodo(checkbox) {
    const textSpan = checkbox.nextElementSibling; // Select the span with the text
  
    if (checkbox.checked) {
      textSpan.style.textDecoration = 'line-through';
    } else {
      textSpan.style.textDecoration = 'none';
    }
  }



  document.getElementById('add-todo-btn').addEventListener('click', addTodo);