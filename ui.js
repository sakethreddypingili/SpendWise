/**
 * ui.js - Visual enhancement layer:
 * - Animated number counters
 * - Toast notifications
 * - Delete confirmation modal
 * - Chart.js doughnut chart (dashboard)
 * - Chart.js analytics charts (monthly, trend, category)
 * - Dark / Light theme toggle & persistence
 * - Sidebar navigation logic
 */

let chartInstance        = null;
let monthlyChartInstance = null;
let trendChartInstance   = null;
let categoryChartInstance = null;

// ─── Shared chart colours ─────────────────────────────────────────────────────
const PALETTE = [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444',
    '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
];

// ─── Animated counter ─────────────────────────────────────────────────────────
export const animateCounter = (el, from, to, duration = 800) => {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentVal = progress * (to - from) + from;
        el.innerText = `₹${currentVal.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
};

// ─── Toast ────────────────────────────────────────────────────────────────────
export const showToast = (message, type = 'success') => {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'bi-check-circle-fill';
    if (type === 'error') iconClass = 'bi-exclamation-triangle-fill';
    if (type === 'info')  iconClass = 'bi-info-circle-fill';

    toast.innerHTML = `<i class="bi ${iconClass}"></i><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-fade-out');
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
};

// ─── Delete modal ─────────────────────────────────────────────────────────────
export const showDeleteModal = (onConfirm) => {
    const modal      = document.getElementById('delete-modal');
    const confirmBtn = document.getElementById('confirm-delete-btn');
    const cancelBtn  = document.getElementById('cancel-delete-btn');
    if (!modal || !confirmBtn || !cancelBtn) return;

    modal.classList.remove('hide');
    modal.classList.add('modal-active');

    const closeModal = () => {
        modal.classList.remove('modal-active');
        modal.classList.add('hide');
        confirmBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', handleCancel);
    };
    const handleConfirm = () => { onConfirm(); closeModal(); };
    const handleCancel  = () => closeModal();

    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click',  handleCancel);
};

// ─── Doughnut chart (dashboard) ───────────────────────────────────────────────
export const initChart = () => {
    const canvas = document.getElementById('spending-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Income', 'Expense'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#10b981', '#ef4444'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { font: { family: 'Inter, sans-serif', size: 12 }, color: '#64748b' }
