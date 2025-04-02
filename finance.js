// Finance Management System with all requested features

// Data storage
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let budgets = JSON.parse(localStorage.getItem('budgets')) || {};

// DOM Elements
const logoutBtn = document.querySelector('.logout-button');
const monthSelect = document.getElementById('monthSelect');
const budgetInput = document.getElementById('budgetInput');
const saveBudgetBtn = document.getElementById('saveBudgetBtn');
const remainingAmount = document.getElementById('remainingAmount');
const categoryName = document.getElementById('categoryName');
const categoryLimit = document.getElementById('categoryLimit');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const categoriesList = document.getElementById('categoriesList');
const expenseAmount = document.getElementById('expenseAmount');
const expenseNote = document.getElementById('expenseNote');
const addExpenseBtn = document.getElementById('addExpenseBtn');
const expensesHistory = document.getElementById('expensesHistory');
const budgetWarning = document.getElementById('budgetWarning');
const monthlyStats = document.getElementById('monthlyStats');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!currentUser && window.location.pathname.includes('index.html')) {
        window.location.href = 'login.html';
        return;
    }

    // Set current month
    const today = new Date();
    monthSelect.value = today.toISOString().substring(0, 7);

    // Load data
    loadMonthData();

    // Setup account dropdown
    setupAccountDropdown();

    // Setup event listeners
    setupEventListeners();
});

function setupAccountDropdown() {
    const dropdown = document.createElement('div');
    dropdown.className = 'account-dropdown';
    dropdown.style.display = 'none';
    dropdown.innerHTML = `
        <button id="logoutBtn">Đăng xuất</button>
    `;
    document.querySelector('.head').appendChild(dropdown);

    // Toggle dropdown
    logoutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    });

    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        }
    });

    // Close dropdown when clicking elsewhere
    document.addEventListener('click', () => {
        dropdown.style.display = 'none';
    });
}

function setupEventListeners() {
    // Month change
    monthSelect.addEventListener('change', loadMonthData);

    // Save budget
    saveBudgetBtn.addEventListener('click', saveBudget);

    // Add category
    addCategoryBtn.addEventListener('click', addCategory);

    // Add expense
    addExpenseBtn.addEventListener('click', addExpense);

    // Search expenses
    searchBtn.addEventListener('click', searchExpenses);

    // Sort buttons
    document.querySelectorAll('.container6 .button').forEach(btn => {
        btn.addEventListener('click', () => sortExpenses(btn.textContent));
    });

    // Pagination buttons
    document.querySelector('.move .item').addEventListener('click', previousPage);
    document.querySelector('.move .item2').addEventListener('click', nextPage);
}

// Category Management
function addCategory() {
    const month = monthSelect.value.substring(0, 7);
    const name = categoryName.value.trim();
    const limit = parseFloat(categoryLimit.value);

    if (!name || isNaN(limit)) {
        alert('Vui lòng nhập đầy đủ thông tin');
        return;
    }

    // Initialize data if needed
    if (!budgets[currentUser.email]) budgets[currentUser.email] = {};
    if (!budgets[currentUser.email][month]) {
        budgets[currentUser.email][month] = {
            budget: 0,
            categories: [],
            expenses: [],
            spent: 0
        };
    }

    // Add category
    budgets[currentUser.email][month].categories.push({
        id: Date.now(),
        name,
        limit,
        spent: 0
    });

    saveData();
    loadMonthData();
    clearCategoryInputs();
}

function editCategory(categoryId) {
    const month = monthSelect.value.substring(0, 7);
    const category = budgets[currentUser.email][month].categories.find(c => c.id === categoryId);

    const newName = prompt('Tên mới:', category.name);
    const newLimit = parseFloat(prompt('Giới hạn mới:', category.limit));

    if (newName && !isNaN(newLimit)) {
        category.name = newName;
        category.limit = newLimit;
        saveData();
        loadMonthData();
    }
}

function deleteCategory(categoryId) {
    if (!confirm('Xóa danh mục này?')) return;

    const month = monthSelect.value.substring(0, 7);
    budgets[currentUser.email][month].categories = 
        budgets[currentUser.email][month].categories.filter(c => c.id !== categoryId);
    
    saveData();
    loadMonthData();
}

// Expense Management
function addExpense() {
    const month = monthSelect.value.substring(0, 7);
    const amount = parseFloat(expenseAmount.value);
    const note = expenseNote.value.trim();

    if (isNaN(amount) || !note) {
        alert('Vui lòng nhập đầy đủ thông tin');
        return;
    }

    // Get category
    const categorySelect = document.createElement('select');
    budgets[currentUser.email][month].categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name;
        option.textContent = cat.name;
        categorySelect.appendChild(option);
    });
    
    const otherOption = document.createElement('option');
    otherOption.value = 'Khác';
    otherOption.textContent = 'Khác';
    categorySelect.appendChild(otherOption);

    if (confirm('Chọn danh mục từ danh sách?')) {
        const category = prompt('Danh mục:', 'Khác');
        if (!category) return;
        
        // Add expense
        const newExpense = {
            id: Date.now(),
            amount,
            note,
            date: new Date().toLocaleDateString(),
            category
        };

        budgets[currentUser.email][month].expenses.push(newExpense);
        budgets[currentUser.email][month].spent += amount;

        // Update category spent
        const cat = budgets[currentUser.email][month].categories.find(c => c.name === category);
        if (cat) cat.spent += amount;

        saveData();
        loadMonthData();
        clearExpenseInputs();
    }
}

function deleteExpense(expenseId) {
    if (!confirm('Xóa giao dịch này?')) return;

    const month = monthSelect.value.substring(0, 7);
    const expenseIndex = budgets[currentUser.email][month].expenses.findIndex(e => e.id === expenseId);
    
    if (expenseIndex !== -1) {
        const expense = budgets[currentUser.email][month].expenses[expenseIndex];
        budgets[currentUser.email][month].spent -= expense.amount;
        
        // Update category spent
        const cat = budgets[currentUser.email][month].categories.find(c => c.name === expense.category);
        if (cat) cat.spent -= expense.amount;

        budgets[currentUser.email][month].expenses.splice(expenseIndex, 1);
        saveData();
        loadMonthData();
    }
}

// Search and Sort
function searchExpenses() {
    const searchTerm = searchInput.value.toLowerCase();
    const month = monthSelect.value.substring(0, 7);
    const filtered = budgets[currentUser.email][month].expenses.filter(e => 
        e.note.toLowerCase().includes(searchTerm) || 
        e.category.toLowerCase().includes(searchTerm)
    );
    displayExpenses(filtered);
}

function sortExpenses(order) {
    const month = monthSelect.value.substring(0, 7);
    const expenses = [...budgets[currentUser.email][month].expenses];
    
    if (order === '1') {
        expenses.sort((a, b) => a.amount - b.amount); // Ascending
    } else if (order === '2') {
        expenses.sort((a, b) => b.amount - a.amount); // Descending
    } else if (order === '3') {
        expenses.sort((a, b) => new Date(a.date) - new Date(b.date)); // Oldest first
    }
    
    displayExpenses(expenses);
}

// Pagination
let currentPage = 1;
const itemsPerPage = 5;

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        loadMonthData();
    }
}

function nextPage() {
    const month = monthSelect.value.substring(0, 7);
    const totalPages = Math.ceil(budgets[currentUser.email][month].expenses.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        loadMonthData();
    }
}

// Data Loading and Display
function loadMonthData() {
    const month = monthSelect.value.substring(0, 7);
    
    // Initialize if needed
    if (!budgets[currentUser.email]) budgets[currentUser.email] = {};
    if (!budgets[currentUser.email][month]) {
        budgets[currentUser.email][month] = {
            budget: 0,
            categories: [],
            expenses: [],
            spent: 0
        };
        saveData();
    }

    const monthData = budgets[currentUser.email][month];

    // Update UI
    updateBudgetDisplay(monthData);
    updateCategoriesDisplay(monthData);
    updateExpensesDisplay(monthData);
    updateMonthlyStats();
}

function updateBudgetDisplay(monthData) {
    remainingAmount.textContent = (monthData.budget - monthData.spent).toLocaleString() + ' VND';
    budgetWarning.textContent = monthData.spent > monthData.budget ? 
        `⚠️ Vượt ngân sách: ${monthData.spent.toLocaleString()}/${monthData.budget.toLocaleString()} VND` : 
        `✅ Ngân sách: ${monthData.spent.toLocaleString()}/${monthData.budget.toLocaleString()} VND`;
}

function updateCategoriesDisplay(monthData) {
    categoriesList.innerHTML = monthData.categories.map(cat => `
        <div class="content2" data-id="${cat.id}">
            <div class="item">${cat.name} (${cat.spent.toLocaleString()}/${cat.limit.toLocaleString()} VND)</div>
            <div class="item_button">
                <button onclick="editCategory(${cat.id})">Sửa</button>
                <button onclick="deleteCategory(${cat.id})">Xóa</button>
            </div>
        </div>
    `).join('');
}

function updateExpensesDisplay(monthData) {
    // Pagination
    const startIdx = (currentPage - 1) * itemsPerPage;
    const paginatedExpenses = monthData.expenses.slice(startIdx, startIdx + itemsPerPage);

    expensesHistory.innerHTML = paginatedExpenses.map(exp => `
        <div class="content2" data-id="${exp.id}">
            <div class="item">${exp.date} - ${exp.category}: ${exp.note} (${exp.amount.toLocaleString()} VND)</div>
            <div class="item_button">
                <button onclick="deleteExpense(${exp.id})">Xóa</button>
            </div>
        </div>
    `).join('');

    // Update pagination buttons
    updatePaginationButtons(monthData.expenses.length);
}

function updatePaginationButtons(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationDiv = document.querySelector('.move');
    
    paginationDiv.innerHTML = `
        <button class="item" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
        ${Array.from({length: totalPages}, (_, i) => `
            <button class="button ${i+1 === currentPage ? 'active' : ''}">${i+1}</button>
        `).join('')}
        <button class="item2" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
    `;

    // Add event listeners
    document.querySelector('.move .item').addEventListener('click', previousPage);
    document.querySelector('.move .item2').addEventListener('click', nextPage);
    document.querySelectorAll('.move .button').forEach(btn => {
        btn.addEventListener('click', () => {
            currentPage = parseInt(btn.textContent);
            loadMonthData();
        });
    });
}

function updateMonthlyStats() {
    if (!currentUser || !budgets[currentUser.email]) return;

    const months = Object.keys(budgets[currentUser.email]).sort().reverse().slice(0, 3);
    monthlyStats.innerHTML = months.map(month => {
        const data = budgets[currentUser.email][month];
        const status = data.spent > data.budget ? '❌ Vượt' : '✅ Đạt';
        return `
            <div class="item">
                <span>${month}</span>
                <span>${data.spent.toLocaleString()} VND</span>
                <span>${data.budget.toLocaleString()} VND</span>
                <span>${status}</span>
            </div>
        `;
    }).join('');
}

// Helper functions
function saveBudget() {
    const month = monthSelect.value.substring(0, 7);
    const budget = parseFloat(budgetInput.value);

    if (isNaN(budget)) {
        alert('Vui lòng nhập số tiền hợp lệ');
        return;
    }

    if (!budgets[currentUser.email]) budgets[currentUser.email] = {};
    if (!budgets[currentUser.email][month]) {
        budgets[currentUser.email][month] = {
            budget: 0,
            categories: [],
            expenses: [],
            spent: 0
        };
    }

    budgets[currentUser.email][month].budget = budget;
    saveData();
    loadMonthData();
    budgetInput.value = '';
}

function saveData() {
    localStorage.setItem('budgets', JSON.stringify(budgets));
}

function clearCategoryInputs() {
    categoryName.value = '';
    categoryLimit.value = '';
}

function clearExpenseInputs() {
    expenseAmount.value = '';
    expenseNote.value = '';
}

// Make functions available globally for HTML onclick attributes
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
window.deleteExpense = deleteExpense;