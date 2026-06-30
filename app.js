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
        });
    }

    // Filter chips (All / Income / Expense)
    document.querySelectorAll('.filter-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.getAttribute('data-filter') || 'all';
            renderFilteredList();
        });
    });

    // Date range filters
    const dateFromEl = document.getElementById('date-from');
    const dateToEl   = document.getElementById('date-to');
    const clearDateBtn = document.getElementById('clear-date-btn');

    if (dateFromEl) dateFromEl.addEventListener('change', (e) => { dateFrom = e.target.value; renderFilteredList(); });
    if (dateToEl)   dateToEl.addEventListener('change', (e) => { dateTo = e.target.value; renderFilteredList(); });
    if (clearDateBtn) {
        clearDateBtn.addEventListener('click', () => {
            dateFrom = '';
            dateTo = '';
            if (dateFromEl) dateFromEl.value = '';
            if (dateToEl)   dateToEl.value = '';
            renderFilteredList();
        });
    }

    // Export CSV
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) exportBtn.addEventListener('click', exportCSV);

    // Budget modal
    initBudgetModal();

    // Reset form button
    const resetBtn = document.getElementById('reset-form-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            document.getElementById('text').value = '';
            document.getElementById('amount').value = '';
            document.getElementById('char-count').textContent = '0';
            document.getElementById('error-message').classList.add('hide');
        });
    }

    // Char counter
    const textInput = document.getElementById('text');
    if (textInput) {
        textInput.addEventListener('input', () => {
            const counter = document.getElementById('char-count');
            if (counter) counter.textContent = textInput.value.length;
        });
    }

    // Header date
    const headerDate = document.getElementById('header-date');
    if (headerDate) {
