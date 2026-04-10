# 📉 Customer Churn Prediction System

A robust, production-ready React application built to analyze and predict customer churn using simulated demographic and behavioral data. This dashboard empowers business users with deep insights into retention risks via a sophisticated linear simulation model and rich data visualizations.

Developed by [@01Praneeth](https://github.com/01Praneeth).

## 🚀 Live Demo in Action

![E2E Application Edge-Case Testing Demo](file:///C:/Users/Praneeth/.gemini/antigravity/brain/6853c043-0bfd-40f2-a5b6-39cda68cad28/dashboard_demo_1775804512556.webp)

## 🛠 Tech Stack
- **React (Vite):** Blazing fast modular component framework
- **Tailwind CSS v4:** Deep navy dark-mode and fluid SaaS aesthetics
- **Recharts:** Responsive SVG data visualization charts
- **SheetJS (`xlsx`):** Secure, client-side `.xlsx` spreadsheet BI exports
- **Lucide-React:** For beautiful, scalable vector iconography

## 🛡 Enterprise Edge-Case Security & Constraints
During the final architectural review, several critical contingencies and guardrails were engineered to guarantee enterprise-level stability:

* **Zero-Division Integrity:** Hardened Dashboard KPIs to elegantly fallback to `0.0` when computing global variables instead of crashing to `NaN` if filtered queries return empty datasets.
* **Memory Leak Prevention:** Implemented a rigorous `useEffect` component-lifecycle cleanup phase to explicitly destroy dangling asynchronous thread timeouts avoiding ghost-executions when users aggressively swap tabs mid-simulation.
* **Aggressive Viewport Wrapping:** Applied robust `min-w-0` strict boundary constraints restricting internal Recharts SVG elements from rupturing horizontal grid layout constraints during aggressive mobile rescaling.
* **Filesystem Export Traps:** Sandbox wrapped the `SheetJS` Excel Blob trigger inside a dedicated `try/catch` block, rescuing the React tree from silent freeze states thrown when enterprise ad-blockers or strict browser protocols deny localized filesystem write access.

## 🏁 How to Run Locally

Get the application running inside your local terminal in 3 simple commands:

1. **Install standard node dependencies:**
   ```bash
   npm install
   ```
2. **Start the local Vite development server:**
   ```bash
   npm run dev
   ```
3. **Launch the Dashboard:** Open your browser and navigate to `http://localhost:5173`.
