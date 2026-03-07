# BudgetMaster - Budget Management App

BudgetMaster is a local web application for managing project budget plans and actual expenditures on a monthly basis.
It is built on React (Vite) and Node.js (Express), using SQLite as the database.

## Key Features

- **Project Management**: Set project duration (half-year period) and total budget
- **Budget Management Matrix**:
  - Directly edit planned amounts by month and category
  - View actual totals (completed and in-progress)
  - Automatic calculation of budget vs. actual variance
  - CSV export functionality
- **Expenditure Recording**: Enter category, month incurred, amount, and notes
- **Dashboard**: Summary view of budget utilization across all projects
- **Category Management**: Manage expense items shared across all projects and link them to individual projects
- **Reports**: Budget vs. actual charts per project (Recharts)

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Lucide React, Recharts
- **Backend**: Node.js, Express, SQLite3 (sqlite3), TypeScript

## Setup and Launch

The project consists of two parts: a backend (API) and a frontend (UI).

### Prerequisites

- Node.js (v18 or higher recommended) must be installed

### 1. Start the Backend

```bash
cd backend
npm install  # Only required on first setup
npm run dev
```

- The server will start at `http://localhost:5000`.
- On first launch, `backend/data/database.sqlite` will be created automatically.

### 2. Start the Frontend

```bash
cd frontend
npm install  # Only required on first setup
npm run dev
```

- The application will be accessible at `http://localhost:5173`.

### 3. Build a Standalone Executable (.exe)

You can create a `.exe` file that starts the server and automatically opens a browser with a double-click, even in environments without Node.js installed.

```bash
# Run from the root directory
npm install
npm run build:exe
```

- `dist/BudgetMaster.exe` will be generated.
- On first launch, the browser will automatically open `http://localhost:5000`.

## Development & Structure

- `frontend/`: React application source
- `backend/`: Express API server source
- `doc/`: Software specification and [User Manual](doc/user_manual.md)

## License

[MIT License](LICENSE)
