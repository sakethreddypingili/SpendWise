/**
 * formHandler.js
 * 
 * Enforces transaction input rules, tracks active type toggles,
 * validates forms, and triggers visual feedback.
 */

import { showToast } from './ui.js';

const form = document.getElementById('transaction-form');
const textInput = document.getElementById('text');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const errorMsg = document.getElementById('error-message');

const incomeBtn = document.getElementById('type-income-btn');
const expenseBtn = document.getElementById('type-expense-btn');

let activeType = 'income'; // Match default HTML active class

/**
 * Initializes form submit validation and toggle events.
 */
export const initForm = (onAddTransaction) => {
    if (!form) return;

    // Type toggles logic
    const selectType = (type) => {
        activeType = type;
        if (type === 'income') {
            incomeBtn.classList.add('active');
            expenseBtn.classList.remove('active');
        } else {
            expenseBtn.classList.add('active');
            incomeBtn.classList.remove('active');
        }
    };

    if (incomeBtn && expenseBtn) {
        incomeBtn.addEventListener('click', () => selectType('income'));
        expenseBtn.addEventListener('click', () => selectType('expense'));
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const textValue = textInput.value.trim();
        const rawAmount = parseFloat(amountInput.value);
        const categoryValue = categorySelect ? categorySelect.value : 'Other';

        // Check validation rules
        let hasError = false;
        
        if (textValue === '') {
            textInput.classList.add('error-shake');
            setTimeout(() => textInput.classList.remove('error-shake'), 400);
