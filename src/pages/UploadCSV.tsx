import { useRef } from "react";

export default function UploadCSV() {
  const inputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    // Implement file parsing here (use Papaparse for reading .csv)
    alert(`Selected file: ${file.name}`);
  }

  return (
    <main className="max-w-xl mx-auto p-8">
      <h2 className="font-bold text-xl mb-4">Upload Transactions CSV</h2>
      <div className="bg-white rounded-lg shadow p-8 flex flex-col items-center">
        <p className="mb-3 text-gray-600">
          Upload your bank statement or transaction history in CSV format.
          <br />
          The file should contain columns for date, description, amount, and
          optionally category.
        </p>
        <div className="border-2 border-dashed p-10 w-full rounded flex flex-col items-center justify-center mb-3">
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            id="csv-upload"
            onChange={handleFileChange}
          />
          <label
            htmlFor="csv-upload"
            className="bg-blue-500 text-white px-6 py-2 rounded cursor-pointer"
          >
            Browse Files
          </label>
        </div>
        <span className="text-gray-500 text-sm">
          Drag and drop your CSV file here
        </span>
      </div>
    </main>
  );
}
