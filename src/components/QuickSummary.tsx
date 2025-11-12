export default function QuickSummary() {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 bg-transparent mt-8">
      <div className="rounded-xl p-6 bg-green-50 flex flex-col items-center shadow">
        <span className="text-lg text-gray-500">Income</span>
        <span className="text-2xl font-semibold text-green-700">$4,500.00</span>
      </div>
      <div className="rounded-xl p-6 bg-red-50 flex flex-col items-center shadow">
        <span className="text-lg text-gray-500">Expenses</span>
        <span className="text-2xl font-semibold text-red-700">$3,300.00</span>
      </div>
      <div className="rounded-xl p-6 bg-blue-50 flex flex-col items-center shadow">
        <span className="text-lg text-gray-500">Balance</span>
        <span className="text-2xl font-semibold text-blue-700">$1,200.00</span>
      </div>
    </div>
  );
}
