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
            hasError = true;
        }

        if (isNaN(rawAmount) || rawAmount <= 0) {
            amountInput.classList.add('error-shake');
            setTimeout(() => amountInput.classList.remove('error-shake'), 400);
            hasError = true;
        }

        if (hasError) {
            showError();
            return;
        }

        hideError();

        // Standardize positive for income, negative for expense
        const finalAmount = activeType === 'income' ? Math.abs(rawAmount) : -Math.abs(rawAmount);

        // Date timestamp
        const currentDate = new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });

        const newTransaction = {
            id: Date.now(),
            text: textValue,
            amount: finalAmount,
            category: categoryValue,
            type: activeType,
            date: currentDate
        };

        // Send to Captain
        onAddTransaction(newTransaction);
        
        // Show success alert toast
        showToast(`Transaction added successfully!`, 'success');

        // Clear input form fields
        textInput.value = '';
        amountInput.value = '';
        
        // Reset defaults
        selectType('income');
    });
};

const showError = () => {
    if (errorMsg) errorMsg.classList.remove('hide');
};

const hideError = () => {
    if (errorMsg) errorMsg.classList.add('hide');
};
