let users = [];
let filteredUsers = [];
let currentPage = 1;
let rowsPerPage = 10;

// Show loading spinner when data is being fetched
document.getElementById('loading-spinner').style.display = 'block';

// Fetch users from API
fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json')
  .then(response => response.json())
  .then(data => {
    users = data;
    filteredUsers = [...users];
    renderTable();
    document.getElementById('loading-spinner').style.display = 'none'; // Hide spinner when data is loaded
  });

// Render table based on the filtered users and pagination
function renderTable() {
  const tbody = document.getElementById('user-table');
  tbody.innerHTML = ''; // Clear existing rows

  const start = (currentPage - 1) * rowsPerPage;
  const end = currentPage * rowsPerPage;
  const paginatedUsers = filteredUsers.slice(start, end);

  paginatedUsers.forEach(user => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="checkbox" class="select-row" /></td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${capitalizeFirstLetter(user.role)}</td>
      <td>
        <button class="edit" onclick="editRow('${user.id}')">Edit</button>
        <button class="delete" onclick="deleteRow('${user.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  updatePagination();
}

// Helper function to capitalize the first letter of user roles
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Function to change the number of rows displayed per page
function changeRowsPerPage(event) {
  rowsPerPage = parseInt(event.target.value);
  currentPage = 1;
  renderTable();
}

// Edit row functionality (similar to your existing function)
function editRow(id) {
  const user = filteredUsers.find(user => user.id === id);

  if (user) {
    const row = [...document.querySelectorAll('tr')].find(r => 
      r.innerHTML.includes(user.name) && r.innerHTML.includes(user.email)
    );

    row.innerHTML = `
      <td><input type="checkbox" class="select-row" /></td>
      <td><input type="text" id="name-${id}" value="${user.name}" /></td>
      <td><input type="text" id="email-${id}" value="${user.email}" /></td>
      <td><input type="text" id="role-${id}" value="${user.role}" /></td>
      <td>
        <button onclick="saveRow('${id}')">Save</button>
        <button onclick="cancelEdit()">Cancel</button>
      </td>
    `;
  }
}

// Save edited row data
function saveRow(id) {
  const updatedName = document.getElementById(`name-${id}`).value;
  const updatedEmail = document.getElementById(`email-${id}`).value;
  const updatedRole = document.getElementById(`role-${id}`).value;

  filteredUsers = filteredUsers.map(user => {
    if (user.id === id) {
      return { ...user, name: updatedName, email: updatedEmail, role: updatedRole };
    }
    return user;
  });

  renderTable();
}

// Cancel editing without saving
function cancelEdit() {
  renderTable();
}

// Delete row functionality
function deleteRow(id) {
  filteredUsers = filteredUsers.filter(user => user.id !== id);
  renderTable();
}

// Bulk actions: Delete selected rows
document.getElementById('delete-selected').addEventListener('click', () => {
  const selectedIds = [];
  document.querySelectorAll('.select-row:checked').forEach((checkbox) => {
    const rowIndex = [...document.querySelectorAll('.select-row')].indexOf(checkbox);
    const userToDelete = filteredUsers[(currentPage - 1) * rowsPerPage + rowIndex];
    if (userToDelete) {
      selectedIds.push(userToDelete.id);
    }
  });

  filteredUsers = filteredUsers.filter(user => !selectedIds.includes(user.id));
  renderTable();
});

// Bulk actions: Change role for selected users
document.getElementById('change-role').addEventListener('click', () => {
  const newRole = prompt('Enter new role (admin/member):');
  if (newRole) {
    document.querySelectorAll('.select-row:checked').forEach(checkbox => {
      const row = checkbox.closest('tr'); // Get the parent row of the checkbox
      const userId = filteredUsers[(currentPage - 1) * rowsPerPage + Array.from(document.querySelectorAll('.select-row')).indexOf(checkbox)].id;

      // Update the role for the user with the matched ID
      const user = filteredUsers.find(user => user.id === userId);
      if (user) {
        user.role = newRole;
      }
    });
    renderTable();
  }
});

// Pagination logic
function updatePagination() {
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  
  document.querySelector('.next-page').disabled = currentPage >= totalPages;
  document.querySelector('.previous-page').disabled = currentPage <= 1;
  document.querySelector('.first-page').disabled = currentPage <= 1;
  document.querySelector('.last-page').disabled = currentPage >= totalPages;
}

document.querySelector('.next-page').addEventListener('click', () => {
  currentPage++;
  renderTable();
});

document.querySelector('.previous-page').addEventListener('click', () => {
  currentPage--;
  renderTable();
});

document.querySelector('.first-page').addEventListener('click', () => {
  currentPage = 1;
  renderTable();
});

document.querySelector('.last-page').addEventListener('click', () => {
  currentPage = Math.ceil(filteredUsers.length / rowsPerPage);
  renderTable();
});

// Search functionality
document.getElementById('search').addEventListener('input', (event) => {
  const query = event.target.value.toLowerCase();
  if (query === '') {
    filteredUsers = [...users];
  } else {
    filteredUsers = users.filter(user => 
      user.name.toLowerCase().includes(query) || 
      user.email.toLowerCase().includes(query) || 
      user.role.toLowerCase().includes(query)
    );
  }
  currentPage = 1; 
  renderTable();
});

// Select All rows functionality
document.getElementById('select-all').addEventListener('change', (event) => {
  const isChecked = event.target.checked;
  document.querySelectorAll('.select-row').forEach(checkbox => {
    checkbox.checked = isChecked;
  });
});
