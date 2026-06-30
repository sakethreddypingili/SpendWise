/**
 * app.js - Orchestrator / Captain
 *
 * Wires together every module:
 * state · calculations · domRenderer · formHandler · ui
 *
 * Responsibilities:
 *  - Boot the app
 *  - Drive refreshUI() after every state change
 *  - Manage filter chips, date range, search, export, budget modal
 */

import { getTransactions, addTransaction, deleteTransaction } from './state.js';
import { updateDashboard, renderTransactionList } from './domRenderer.js';
import { initForm } from './formHandler.js';
import {
    initDarkMode,
    initNav,
    initChart,
    updateChart,
    updateAnalyticsCharts,
    showToast
} from './ui.js';
import { calculateIncome, calculateExpense, calculateBalance } from './calculations.js';

// ─── Filter state ────────────────────────────────────────────────────────────
let searchQuery = '';
let activeFilter = 'all';   // 'all' | 'income' | 'expense'
let dateFrom = '';
let dateTo = '';

// ─── Budget state (persisted in localStorage) ───────────────────────────────
let budgets = JSON.parse(localStorage.getItem('budgets')) || {};

const CATEGORIES = [
    'Salary', 'Food', 'Rent', 'Transport',
    'Shopping', 'Entertainment', 'Health', 'Education', 'Other'
];

// ─── Boot ────────────────────────────────────────────────────────────────────
function init() {
    console.log('SpendWise App Initialized! 🚀');

    initDarkMode();
    initNav();
    initChart();

    // Form: add new transaction
    initForm((newTransaction) => {
        addTransaction(newTransaction);
        showToast('Transaction added successfully!', 'success');
        refreshUI();
    });

    // Search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            renderFilteredList();
