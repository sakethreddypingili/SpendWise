# SpendWise Developer Documentation

SpendWise is a premium client-side personal finance tracking and management dashboard. Built with pure JavaScript, custom responsive CSS styling, and LocalStorage integrations, it offers developers an structured overview of balances, incomes, expenses, category spending ratios, transaction filtering, and log tables.

---

## Directory Structure

This repository contains the following structural layout:
* index.html - Defines layout grids, balance banners, input transaction forms, and log tables.
* style.css - Configures styling layouts, color definitions, responsive media queries, and animated elements.
* app.js - Initializes system listeners, handles submission clicks, and manages core application flow.
* state.js - Tracks transaction arrays, loads/saves list arrays to browser storage namespaces.
* calculations.js - Handles numerical operations for sum outputs, net gains, and percentages.
* domRenderer.js - Builds card logs, transaction list elements, and inserts them into views.
* formHandler.js - Sanitizes form inputs, checks validation bounds, and formats output strings.
* ui.js - Operates modal animations and dynamic chart updates.

---

## Architectural Flow & Communication Diagram

```
[ Form Input Action ] ──► [ app.js ] ──► [ formHandler.js ] ──► [ state.js ]
                               │                                     │
                               ▼                                     ▼
[ domRenderer.js ] ◄───── [ ui.js ] ◄── (Re-calculate Totals) ◄── [ calculations.js ]
 (Re-render List)          (Refresh Progress Indicators)
```

---

## Module Specifications

### 1. Calculation Engine (calculations.js)
Performs math operations on active data ranges:
* Net Balance: Aggregates total positive and negative transactions.
* Category Splits: Returns numerical percentages representing spending across specific areas.

### 2. State & Storage Controller (state.js)
Tracks transaction records in memory:
* Serializes transaction objects into standard browser LocalStorage profiles on updates.
* Handles deletions by rebuilding array indices.

### 3. DOM & Form Engines (domRenderer.js, formHandler.js, ui.js)
* Form Validation: sanitizes input fields (disallowing values such as zero or empty amounts).
* Rendering helpers: Builds table items dynamically.
* UI updates: Adjusts modal visibility classes and displays visual indicators.

---

## Technical Features & Implementation Details

* Dynamic Styling: Leverages unified CSS custom properties to scale and morph elements.
* Data Sanitization: Runs basic formatting pipelines to block cross-site scripting (XSS) inputs on custom text items.
* State Persistence: Restores active transactions on system startup from storage profiles.

---

## Local Development & Setup

### Prerequisites
A modern browser and a command-line interface.

### Running Locally
1. Navigate to the project root directory:
   ```bash
   cd "Expense Tracker"
   ```
2. Start a simple web server:
   ```bash
   python -m http.server 8000
   ```
3. Open a browser and navigate to `http://localhost:8000`.
