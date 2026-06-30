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
