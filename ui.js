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
                },
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.label}: ₹${ctx.raw.toLocaleString('en-IN')}`
                    }
                }
            },
            cutout: '70%'
        }
    });
};

export const updateChart = (income, expense) => {
    if (!chartInstance) return;

    const incVal = parseFloat(income);
    const expVal = parseFloat(expense);

    if (incVal === 0 && expVal === 0) {
        chartInstance.data.datasets[0].data = [1, 1];
        chartInstance.data.datasets[0].backgroundColor = ['#e2e8f0', '#e2e8f0'];
    } else {
        chartInstance.data.datasets[0].data = [incVal, expVal];
        chartInstance.data.datasets[0].backgroundColor = ['#10b981', '#ef4444'];
    }

    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    chartInstance.options.plugins.legend.labels.color = dark ? '#94a3b8' : '#64748b';
    chartInstance.data.datasets[0].borderColor = dark ? '#1e293b' : '#ffffff';
    chartInstance.update();
};

// ─── Analytics charts ─────────────────────────────────────────────────────────

/**
 * Builds / updates all three analytics charts from the transactions array.
 */
export const updateAnalyticsCharts = (transactions) => {
    buildMonthlyChart(transactions);
    buildTrendChart(transactions);
    buildCategoryChart(transactions);
    buildTopCategoriesList(transactions);
};

// Helper: get theme-aware text colour
const labelColor = () =>
    document.documentElement.getAttribute('data-theme') === 'dark' ? '#94a3b8' : '#64748b';

const gridColor = () =>
    document.documentElement.getAttribute('data-theme') === 'dark'
        ? 'rgba(255,255,255,0.06)'
        : 'rgba(0,0,0,0.06)';

// 1. Monthly Overview bar chart
function buildMonthlyChart(transactions) {
    const canvas = document.getElementById('monthly-chart');
    if (!canvas) return;

    // Group by month label
    const monthMap = {};
    transactions.forEach(t => {
        // Derive a usable date
        const raw = t.isoDate ? new Date(t.isoDate) : new Date(t.date);
        const key = isNaN(raw) ? 'Unknown' : raw.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        if (!monthMap[key]) monthMap[key] = { income: 0, expense: 0 };
        if (t.amount > 0) monthMap[key].income  += t.amount;
        else              monthMap[key].expense += Math.abs(t.amount);
    });

    const labels  = Object.keys(monthMap);
    const incomes  = labels.map(l => monthMap[l].income);
    const expenses = labels.map(l => monthMap[l].expense);

    const data = {
        labels,
        datasets: [
            {
                label: 'Income',
                data: incomes,
                backgroundColor: '#10b981',
                borderRadius: 6,
                borderSkipped: false
            },
            {
                label: 'Expense',
                data: expenses,
                backgroundColor: '#ef4444',
                borderRadius: 6,
                borderSkipped: false
            }
        ]
    };

    if (monthlyChartInstance) {
        monthlyChartInstance.data = data;
        monthlyChartInstance.update();
        return;
    }

    monthlyChartInstance = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { color: labelColor(), font: { family: 'Inter' } } },
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.dataset.label}: ₹${ctx.raw.toLocaleString('en-IN')}`
                    }
                }
            },
            scales: {
                x: { ticks: { color: labelColor() }, grid: { color: gridColor() } },
                y: { ticks: { color: labelColor(), callback: v => `₹${v.toLocaleString('en-IN')}` }, grid: { color: gridColor() } }
            }
        }
    });
}

// 2. Balance Trend line chart
function buildTrendChart(transactions) {
    const canvas = document.getElementById('trend-chart');
    if (!canvas) return;

    // Cumulative balance over sorted transactions
    const sorted = [...transactions].sort((a, b) => {
        const da = a.isoDate ? new Date(a.isoDate) : new Date(a.date);
        const db = b.isoDate ? new Date(b.isoDate) : new Date(b.date);
        return da - db;
    });

    let running = 0;
    const labels = [];
    const values = [];

    sorted.forEach((t, i) => {
        running += t.amount;
        const raw = t.isoDate ? new Date(t.isoDate) : new Date(t.date);
        labels.push(isNaN(raw) ? `#${i + 1}` : raw.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
        values.push(parseFloat(running.toFixed(2)));
    });

    const data = {
        labels,
        datasets: [{
            label: 'Net Balance',
            data: values,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.12)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#6366f1'
        }]
    };

    if (trendChartInstance) {
        trendChartInstance.data = data;
        trendChartInstance.update();
        return;
    }

    trendChartInstance = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: labelColor(), font: { family: 'Inter' } } },
                tooltip: {
                    callbacks: {
                        label: ctx => `Balance: ₹${ctx.raw.toLocaleString('en-IN')}`
                    }
                }
            },
            scales: {
                x: { ticks: { color: labelColor(), maxTicksLimit: 8 }, grid: { color: gridColor() } },
                y: { ticks: { color: labelColor(), callback: v => `₹${v.toLocaleString('en-IN')}` }, grid: { color: gridColor() } }
            }
        }
    });
}

// 3. Category Breakdown polar / doughnut chart
function buildCategoryChart(transactions) {
    const canvas = document.getElementById('category-chart');
    if (!canvas) return;

    const catTotals = {};
    transactions.filter(t => t.amount < 0).forEach(t => {
        const cat = t.category || 'Other';
        catTotals[cat] = (catTotals[cat] || 0) + Math.abs(t.amount);
    });

    const labels = Object.keys(catTotals);
    const values = labels.map(l => catTotals[l]);
    const colors = labels.map((_, i) => PALETTE[i % PALETTE.length]);

    const data = {
        labels,
        datasets: [{
            data: values,
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e293b' : '#ffffff'
        }]
    };

    if (categoryChartInstance) {
        categoryChartInstance.data = data;
        categoryChartInstance.update();
        return;
    }

    categoryChartInstance = new Chart(canvas.getContext('2d'), {
        type: 'doughnut',
        data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: labelColor(), font: { family: 'Inter', size: 11 } } },
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.label}: ₹${ctx.raw.toLocaleString('en-IN')}`
                    }
                }
            },
            cutout: '55%'
        }
    });
}

// 4. Top Categories ranked list
function buildTopCategoriesList(transactions) {
    const container = document.getElementById('top-categories-list');
    if (!container) return;

    const catTotals = {};
    transactions.filter(t => t.amount < 0).forEach(t => {
        const cat = t.category || 'Other';
        catTotals[cat] = (catTotals[cat] || 0) + Math.abs(t.amount);
    });

    const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

    if (sorted.length === 0) {
        container.innerHTML = `
            <div class="empty-analytics">
                <i class="bi bi-bar-chart"></i>
                <p>Add transactions to see insights</p>
            </div>`;
        return;
    }

    const max = sorted[0][1];
    container.innerHTML = sorted.map(([cat, amount], i) => {
        const pct = Math.round((amount / max) * 100);
        const color = PALETTE[i % PALETTE.length];
        return `
            <div class="top-cat-row">
                <div class="top-cat-header">
                    <span class="top-cat-name">
                        <span class="top-cat-dot" style="background:${color}"></span>
                        ${cat}
                    </span>
                    <span class="top-cat-amount">₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div class="top-cat-bar-track">
                    <div class="top-cat-bar-fill" style="width:${pct}%;background:${color}"></div>
                </div>
            </div>
        `;
    }).join('');
}

// ─── Dark mode ────────────────────────────────────────────────────────────────
export const initDarkMode = () => {
    const themeBtn = document.getElementById('theme-toggle');
    if (!themeBtn) return;

    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeBtn.addEventListener('click', () => {
        const current  = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);

        // Refresh chart border colours
        [monthlyChartInstance, trendChartInstance, categoryChartInstance].forEach(c => {
            if (!c) return;
            if (c.options.scales) {
                if (c.options.scales.x) c.options.scales.x.ticks.color = labelColor();
                if (c.options.scales.y) c.options.scales.y.ticks.color = labelColor();
            }
            if (c.options.plugins?.legend?.labels) {
                c.options.plugins.legend.labels.color = labelColor();
            }
            c.update();
        });

        if (chartInstance) {
            const ds = chartInstance.data.datasets[0];
            const isEmpty = ds.backgroundColor[0] === '#e2e8f0' || ds.backgroundColor[0] === '#1e293b' || ds.backgroundColor[0] === '#334155';
            if (isEmpty) {
                ds.backgroundColor = newTheme === 'dark' ? ['#334155', '#334155'] : ['#e2e8f0', '#e2e8f0'];
            }
            chartInstance.options.plugins.legend.labels.color = labelColor();
            ds.borderColor = newTheme === 'dark' ? '#1e293b' : '#ffffff';
            chartInstance.update();
        }
    });
};

const updateThemeIcon = (theme) => {
    const themeBtn = document.getElementById('theme-toggle');
    if (!themeBtn) return;
    const icon = themeBtn.querySelector('i');
    const text = themeBtn.querySelector('span');
    if (theme === 'dark') {
        icon.className = 'bi bi-sun-fill';
        if (text) text.innerText = 'Light Mode';
    } else {
        icon.className = 'bi bi-moon-fill';
        if (text) text.innerText = 'Dark Mode';
    }
};

// ─── Sidebar nav ──────────────────────────────────────────────────────────────
export const initNav = () => {
    const navItems = document.querySelectorAll('.nav-menu li');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            if (targetId) {
                const el = document.getElementById(targetId);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
};
