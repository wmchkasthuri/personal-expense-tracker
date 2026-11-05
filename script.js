// Global variables and state
let transactions = [];

// DOM Elements
const transactionForm = document.getElementById('transaction-form');
const typeInput = document.getElementById('type');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const clearBtn = document.getElementById('clear-btn');

const totalIncomeEl = document.getElementById('total-income');
const totalExpensesEl = document.getElementById('total-expenses');
const currentBalanceEl = document.getElementById('current-balance');

const transactionListEl = document.getElementById('transaction-list');
const filterTypeEl = document.getElementById('filter-type');
const searchInputEl = document.getElementById('search-input');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Set default date input to today
    dateInput.value = new Date().toISOString().split('T')[0];
    
    loadTransactions();
    renderApp();
});

// Load saved data from localStorage
function loadTransactions() {
    const stored = localStorage.getItem('my_transactions');
    if (stored) {
        transactions = JSON.parse(stored);
    }
}

// Save data to localStorage
function saveTransactions() {
    localStorage.setItem('my_transactions', JSON.stringify(transactions));
}

// Add New Transaction
transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const amountVal = parseFloat(amountInput.value);

    // Basic Validation
    if (amountVal <= 0 || isNaN(amountVal)) {
        alert('Please enter a valid amount greater than zero.');
        return;
    }

    const newTransaction = {
        id: Date.now(),
        type: typeInput.value,
        description: descriptionInput.value.trim(),
        amount: amountVal,
        category: categoryInput.value,
        date: dateInput.value
    };

    transactions.push(newTransaction);
    saveTransactions();
    renderApp();
    
    // Clear inputs after submitting
    transactionForm.reset();
    dateInput.value = new Date().toISOString().split('T')[0];
    
    // Alert feedback as shown in screenshot
    alert('Transaction added successfully!');
});

// Clear Form Button
clearBtn.addEventListener('click', () => {
    transactionForm.reset();
    dateInput.value = new Date().toISOString().split('T')[0];
});

// Calculate and update Dashboard Summaries
function updateDashboard() {
    let incomeSum = 0;
    let expenseSum = 0;

    transactions.forEach(item => {
        if (item.type === 'Income') {
            incomeSum += item.amount;
        } else if (item.type === 'Expense') {
            expenseSum += item.amount;
        }
    });

    const balance = incomeSum - expenseSum;

    totalIncomeEl.innerText = `LKR ${incomeSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    totalExpensesEl.innerText = `LKR ${expenseSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    currentBalanceEl.innerText = `LKR ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Render Table List with Filter and Search applied
function renderTable() {
    const selectedType = filterTypeEl.value;
    const searchText = searchInputEl.value.toLowerCase().trim();

    // Filter transactions
    const filtered = transactions.filter(t => {
        const matchesType = (selectedType === 'All') || (t.type === selectedType);
        const matchesSearch = t.description.toLowerCase().includes(searchText) || 
                              t.category.toLowerCase().includes(searchText);
        return matchesType && matchesSearch;
    });

    transactionListEl.innerHTML = '';

    if (filtered.length === 0) {
        transactionListEl.innerHTML = `<tr><td colspan="6" class="no-data">No transactions found</td></tr>`;
        return;
    }

    filtered.forEach(item => {
        const row = document.createElement('tr');

        const formattedAmount = item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const sign = item.type === 'Income' ? '+' : '-';
        const amountClass = item.type === 'Income' ? 'text-income' : 'text-expense';
        const badgeClass = item.type === 'Income' ? 'badge-income' : 'badge-expense';

        row.innerHTML = `
            <td>${item.date}</td>
            <td>${item.description}</td>
            <td><span class="badge ${badgeClass}">${item.type}</span></td>
            <td>${item.category}</td>
            <td class="${amountClass}">${sign} LKR ${formattedAmount}</td>
            <td>
                <button class="btn btn-delete" onclick="deleteTransaction(${item.id})">Delete</button>
            </td>
        `;

        transactionListEl.appendChild(row);
    });
}

// Delete Transaction
function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions = transactions.filter(item => item.id !== id);
        saveTransactions();
        renderApp();
    }
}

// Event Listeners for Filters
filterTypeEl.addEventListener('change', renderTable);
searchInputEl.addEventListener('input', renderTable);

// Main Render Function
function renderApp() {
    updateDashboard();
    renderTable();
}