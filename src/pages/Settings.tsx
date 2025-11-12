import CategorySettings from "../components/settings/CategorySettings";
import { useStore } from "../store/useStore";

export default function Settings() {
  const handleExport = () => {
    const dataStr = JSON.stringify({
      transactions: useStore.getState().transactions,
      categories: useStore.getState().categories,
    });
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "budget-tracker-pro-data.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCreateBackup = () => {
    const data = {
      transactions: useStore.getState().transactions,
      categories: useStore.getState().categories,
    };
    localStorage.setItem("budgetBackup", JSON.stringify(data));
    alert("Backup created!");
  };

  const handleRestoreBackup = () => {
    const backup = localStorage.getItem("budgetBackup");
    if (backup) {
      const data = JSON.parse(backup);
      if (data.transactions && data.categories) {
        useStore.setState({
          transactions: data.transactions,
          categories: data.categories,
        });
        alert("Backup restored!");
      } else {
        alert("Invalid backup data");
      }
    } else {
      alert("No backup found");
    }
  };

  const handleStartOver = () => {
    if (confirm("This will delete all data. Are you sure?")) {
      useStore.setState({ transactions: [], categories: [] });
      localStorage.removeItem("budgetBackup");
      alert("Reset complete");
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-8">
      {/* Settings Header */}
      <h2 className="font-bold text-xl mb-4">Settings</h2>

      {/* Basic Settings Inputs */}
      <div className="bg-white rounded-lg p-6 shadow mb-8">
        <div className="mb-3">
          <label className="block font-medium mb-2">
            AI Transaction Categorization
          </label>
          <input type="checkbox" className="mr-2" />
        </div>
        <div className="mb-3">
          <label className="block font-medium mb-2">Dark Mode</label>
          <input type="checkbox" className="mr-2" />
        </div>
        <div className="mb-3">
          <label className="block font-medium mb-2">Currency Symbol</label>
          <select className="border rounded px-2 py-1">
            <option>$ (USD)</option>
            <option>₱ (PHP)</option>
            <option>€ (EUR)</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="block font-medium mb-2">Start of Month</label>
          <select className="border rounded px-2 py-1">
            <option>1st day</option>
            <option>15th day</option>
          </select>
        </div>
      </div>

      {/* Category Settings */}
      <CategorySettings />

      {/* Action Buttons */}
      <div className="mt-10 flex gap-4">
        <button
          onClick={handleExport}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Export All Data
        </button>
        <button
          onClick={handleCreateBackup}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Create Backup
        </button>
        <button
          onClick={handleRestoreBackup}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          Restore Backup
        </button>
        <button
          onClick={handleStartOver}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Start Over
        </button>
      </div>
    </main>
  );
}
