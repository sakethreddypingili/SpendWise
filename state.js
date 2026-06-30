let transactions = [];
const STORAGE_KEY = 'spendwise_transactions';

export function getTransactions() {
  return transactions;
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

export function addTransaction(transaction) {
  transactions.push(transaction);
  saveTransactions();
}

export function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveTransactions();
}

export function initTransactions() {
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) {
    try {
      transactions = JSON.parse(cached);
    } catch (e) {
      transactions = [];
    }
  } else {
    transactions = [];
  }
}

initTransactions();