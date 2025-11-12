import CategorySettings from "../components/settings/CategorySettings";

export default function Settings() {
  return (
    <main className="max-w-3xl mx-auto p-8">
      <h2 className="font-bold text-xl mb-4">Settings</h2>
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
      <CategorySettings />
      <div className="mt-10 flex gap-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Export All Data
        </button>
        <button className="bg-green-500 text-white px-4 py-2 rounded">
          Create Backup
        </button>
        <button className="bg-yellow-500 text-white px-4 py-2 rounded">
          Restore Backup
        </button>
        <button className="bg-red-500 text-white px-4 py-2 rounded">
          Start Over
        </button>
      </div>
    </main>
  );
}
