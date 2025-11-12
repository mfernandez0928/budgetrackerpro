import { useRef } from "react";

export default function UploadCSV() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("bg-blue-50", "border-blue-500");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("bg-blue-50", "border-blue-500");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-blue-50", "border-blue-500");
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      alert(`File selected: ${files[0].name}`);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Upload CSV</h1>
          <p className="text-gray-600 mt-1">Import your bank statements</p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center transition-colors cursor-pointer hover:border-blue-500 hover:bg-blue-50"
          >
            <div className="mb-4 text-4xl">📄</div>
            <p className="text-gray-700 font-semibold mb-2">
              Drag and drop your CSV file here
            </p>
            <p className="text-gray-600 text-sm mb-4">or</p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  alert(`File selected: ${e.target.files[0].name}`);
                }
              }}
            />
            <button
              onClick={() => inputRef.current?.click()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Browse Files
            </button>
          </div>
          <p className="text-gray-600 text-sm mt-4">
            📋 File should contain columns: date, description, amount, category
          </p>
        </div>
      </div>
    </main>
  );
}
