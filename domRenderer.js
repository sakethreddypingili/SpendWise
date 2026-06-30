/**
 * domRenderer.js 
 * 
 * Renders lists, badges, currency counters, and category-themed icons.
 */

import { calculateBalance, calculateIncome, calculateExpense } from './calculations.js';
import { animateCounter, showDeleteModal } from './ui.js';

// Elements references
const balanceEl = document.getElementById('total-balance');
const incomeEl = document.getElementById('total-income');
const expenseEl = document.getElementById('total-expense');
const listEl = document.getElementById('transaction-list');

// Keep track of values to animate differences
let prevTotal = 0;
let prevIncome = 0;
let prevExpense = 0;

// Category icons map
const categoryIcons = {
    Salary: 'bi-cash-coin',
    Food: 'bi-cup-hot-fill',
    Rent: 'bi-house-door-fill',
    Transport: 'bi-car-front-fill',
    Shopping: 'bi-bag-heart-fill',
    Entertainment: 'bi-film',
    Health: 'bi-heart-pulse-fill',
    Education: 'bi-book-fill',
    Other: 'bi-box-seam-fill'
};

// Category badge classes map
const categoryBadges = {
    Salary: 'badge-salary',
    Food: 'badge-food',
    Rent: 'badge-rent',
    Transport: 'badge-transport',
    Shopping: 'badge-shopping',
    Entertainment: 'badge-entertainment',
    Health: 'badge-health',
    Education: 'badge-education',
    Other: 'badge-other'
};

/**
 * Calculates metrics and triggers animated counter updates on stats cards.
 */
export const updateDashboard = (transactions) => {
    const total = parseFloat(calculateBalance(transactions));
    const income = parseFloat(calculateIncome(transactions));
    const expense = parseFloat(calculateExpense(transactions));

    if (balanceEl) animateCounter(balanceEl, prevTotal, total);
    if (incomeEl) animateCounter(incomeEl, prevIncome, income);
    if (expenseEl) animateCounter(expenseEl, prevExpense, expense);

    prevTotal = total;
    prevIncome = income;
    prevExpense = expense;
};

/**
 * Redraws transaction list with filters and renders empty states if list is clean.
 */
export const renderTransactionList = (transactions, onDeleteClick) => {
    if (!listEl) return;
    listEl.innerHTML = '';

    if (transactions.length === 0) {
        listEl.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 48px; color: var(--text-sub);">
                <i class="bi bi-wallet2" style="font-size: 3rem; opacity: 0.25; display: block; margin-bottom: 12px;"></i>
                <p style="font-weight: 500;">No transactions matching your criteria</p>
            </div>
        `;
        return;
    }

    transactions.forEach(transaction => {
        addTransactionDOM(transaction, onDeleteClick);
    });
};

/**
 * Creates transaction element and wires trigger to confirmation modals.
 */
const addTransactionDOM = (transaction, onDeleteClick) => {
    const typeClass = transaction.amount < 0 ? 'minus' : 'plus';
    const sign = transaction.amount < 0 ? '-' : '+';
    
    const category = transaction.category || 'Other';
    const iconClass = categoryIcons[category] || 'bi-box-seam-fill';
    const badgeClass = categoryBadges[category] || 'badge-other';

    const item = document.createElement('li');
    item.className = typeClass;

    item.innerHTML = `
        <div class="list-item-content">
            <div class="category-icon-badge ${badgeClass}">
                <i class="bi ${iconClass}"></i>
            </div>
            <div class="item-details">
                <span class="item-title">${transaction.text}</span>
                <div class="item-meta">
                    <span class="category-pill ${badgeClass}">${category}</span>
                    <span class="item-date">${transaction.date || 'Recent'}</span>
                </div>
            </div>
        </div>
        <div class="item-amount-wrapper">
            <span class="money ${typeClass}">${sign}₹${Math.abs(transaction.amount).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}</span>
            <button class="delete-btn" data-id="${transaction.id}">
                <i class="bi bi-trash3"></i>
            </button>
        </div>
    `;

    const delBtn = item.querySelector('.delete-btn');
    if (delBtn) {
        delBtn.addEventListener('click', () => {
            showDeleteModal(() => {
                onDeleteClick(transaction.id);
            });
        });
    }

    listEl.appendChild(item);
};
