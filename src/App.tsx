import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Settings from "./pages/Settings";
import UploadCSV from "./pages/UploadCSV";

function Navbar() {
  return (
    <header className="bg-white border-b shadow-sm flex items-center px-8 py-3 justify-between">
      <span className="flex gap-2 items-center text-blue-600 font-bold tracking-tight text-lg">
        <span className="bg-blue-100 p-1 rounded-md">📊</span> BudgetTracker Pro
      </span>
      <nav className="flex gap-7">
        <a href="/dashboard" className="hover:text-blue-500">
          Dashboard
        </a>
        <a href="/transactions" className="hover:text-blue-500">
          Transactions
        </a>
        <a href="/upload-csv" className="hover:text-blue-500">
          Upload CSV
        </a>
        <a href="/settings" className="hover:text-blue-500">
          Settings
        </a>
      </nav>
    </header>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/upload-csv" element={<UploadCSV />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;
