export default function QuickSummary() {
  return (
    <div className="flex flex-wrap gap-7 mt-4">
      <div className="flex-1 min-w-[180px] bg-green-50 p-5 rounded-xl shadow flex flex-col items-center">
        <span className="text-green-600 font-bold text-2xl">$4,500.00</span>
        <span className="text-gray-600">Income</span>
      </div>
      <div className="flex-1 min-w-[180px] bg-red-50 p-5 rounded-xl shadow flex flex-col items-center">
        <span className="text-red-600 font-bold text-2xl">$3,300.00</span>
        <span className="text-gray-600">Expenses</span>
      </div>
      <div className="flex-1 min-w-[180px] bg-blue-50 p-5 rounded-xl shadow flex flex-col items-center">
        <span className="text-blue-600 font-bold text-2xl">$1,200.00</span>
        <span className="text-gray-600">Balance</span>
      </div>
    </div>
  );
}
