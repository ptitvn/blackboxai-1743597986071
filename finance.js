// Finance Management System with Category Selection and Sorting

// Data storage
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let budgets = JSON.parse(localStorage.getItem('budgets')) || {};
let currentSort = { field: 'amount', order: 'desc' };

// DOM Elements
const monthSelect = document.getElementById('monthSelect');
const expenseAmount = document.getElementById('expenseAmount');
const expenseNote = document.getElementById('expenseNote');
const expenseCategory = document.getElementById('expenseCategory');
const addExpenseBtn = document.getElementById('addExpenseBtn');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    if (!currentUser && window.location.pathname.includes('index.html')) {
        window.location.href = 'login.html';
        return;
    }

    const today = new Date();
    monthSelect.value = today.toISOString().substring(0, 7);
    loadMonthData();
    setupEventListeners();
});

// Update category dropdown
function updateCategoryDropdown() {
    const month = monthSelect.value.substring(0, 7);
    expenseCategory.innerHTML = '<option value="">Chọn danh mục</option>';
    
    if (budgets[currentUser.email]?.[month]?.categories) {
        budgets[currentUser.email][month].categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.name;
            option.textContent = cat.name;
            expenseCategory.appendChild(option);
        });
    }
}

// Add expense with category
function addExpense() {
    const month = monthSelect.value.substring(0, 7);
    const amount = parseFloat(expenseAmount.value);
    const note = expenseNote.value.trim();
    const category = expenseCategory.value;

    if (!amount || !note || !category) {
        alert('Vui lòng nhập đầy đủ thông tin và chọn danh mục');
        return;
    }

    // Initialize month data if needed
    if (!budgets[currentUser.email]) budgets[currentUser.email] = {};
    if (!budgets[currentUser.email][month]) {
        budgets[currentUser.email][month] = {
            budget: 0,
            categories: [],
            expenses: [],
            spent: 0
        };
    }

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

// Sorting functionality
function sortExpenses() {
    const month = monthSelect.value.substring(0, 7);
    if (!budgets[currentUser.email]?.[month]) return;
    
    const expenses = budgets[currentUser.email][month].expenses;
    
    expenses.sort((a, b) => {
        if (currentSort.field === 'amount') {
            return currentSort.order === 'desc' ? b.amount - a.amount : a.amount - b.amount;
        } else {
            return currentSort.order === 'desc' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date);
        }
    });
    
    currentSort.order = currentSort.order === 'desc' ? 'asc' : 'desc';
    displayExpenses(expenses);
}

// Display expenses with sort indicator
function displayExpenses(expenses) {
    const sortIndicator = currentSort.order === 'desc' ? '↓' : '↑';
    document.querySelector('.container6 .select div:last-child').textContent = 
        `Sắp xếp theo giá ${currentSort.field === 'amount' ? sortIndicator : ''}`;
        
    const expensesHistory = document.getElementById('expensesHistory');
    expensesHistory.innerHTML = expenses.map(exp => `
        <div class="content2" data-id="${exp.id}">
            <div class="item">${exp.date} - ${exp.category}: ${exp.note} (${exp.amount.toLocaleString()} VND)</div>
            <div class="item_button">
                <button onclick="deleteExpense(${exp.id})">Xóa</button>
            </div>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    monthSelect.addEventListener('change', loadMonthData);
    addExpenseBtn.addEventListener('click', addExpense);
    
    // Sort button
    document.querySelector('.container6 .select div:last-child').addEventListener('click', () => {
        currentSort.field = 'amount';
        sortExpenses();
    });
}

// Helper functions
function loadMonthData() {
    updateCategoryDropdown();
    // ... rest of loadMonthData implementation ...
}

function saveData() {
    localStorage.setItem('budgets', JSON.stringify(budgets));
}

function clearExpenseInputs() {
    expenseAmount.value = '';
    expenseNote.value = '';
    expenseCategory.value = '';
}

// Make functions available globally
window.deleteExpense = function(id) {
    const month = monthSelect.value.substring(0, 7);
    const expenseIndex = budgets[currentUser.email][month].expenses.findIndex(e => e.id === id);
    
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
};