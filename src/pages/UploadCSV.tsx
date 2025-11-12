import { useRef } from "react";
import { showToast } from "../components/Toast";

export default function UploadCSV() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add(
      "bg-blue-50",
      "dark:bg-blue-900/20",
      "border-blue-500",
      "dark:border-blue-600"
    );
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove(
      "bg-blue-50",
      "dark:bg-blue-900/20",
      "border-blue-500",
      "dark:border-blue-600"
    );
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove(
      "bg-blue-50",
      "dark:bg-blue-900/20",
      "border-blue-500",
      "dark:border-blue-600"
    );
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith(".csv")) {
        showToast(`✅ File selected: ${file.name}`, "success");
        parseCSV(file);
      } else {
        showToast("❌ Please select a CSV file", "error");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith(".csv")) {
        showToast(`✅ File selected: ${file.name}`, "success");
        parseCSV(file);
      } else {
        showToast("❌ Please select a CSV file", "error");
      }
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split("\n");
        const preview = lines.slice(0, 6).join("\n");
        showToast(
          `📊 CSV loaded. ${lines.length - 1} rows detected.`,
          "success"
        );
        console.log("CSV Preview:", preview);
      } catch (error) {
        showToast("❌ Error parsing CSV", "error");
      }
    };
    reader.readAsText(file);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8 transition-colors">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Upload CSV
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Import your bank statements and transactions
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8 transition-colors">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center transition-all cursor-pointer hover:border-blue-500 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <div className="mb-4 text-5xl">📄</div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold mb-2 text-lg">
              Drag and drop your CSV file here
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              or click the button below to browse
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => inputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              📁 Browse Files
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
              📋 CSV File Requirements:
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li>
                ✓ Required columns:{" "}
                <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
                  date
                </code>
                ,{" "}
                <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
                  description
                </code>
                ,{" "}
                <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
                  amount
                </code>
              </li>
              <li>
                ✓ Optional column:{" "}
                <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
                  category
                </code>
              </li>
              <li>✓ Date format: YYYY-MM-DD</li>
              <li>
                ✓ Amount format: Numbers (positive for income, negative for
                expenses)
              </li>
              <li>✓ File size: Max 5MB</li>
            </ul>
          </div>

          {/* Example */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
              📝 Example CSV Format:
            </h3>
            <pre className="text-xs text-blue-800 dark:text-blue-300 overflow-x-auto">
              {`date,description,amount,category
2025-06-01,Monthly Salary,4500,Income
2025-06-02,Rent Payment,-1200,Housing
2025-06-03,Grocery Shopping,-150,Food
2025-06-05,Gas Station,-45,Transportation`}
            </pre>
          </div>
        </div>
      </div>
    </main>
  );
}
