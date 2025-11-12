export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Copyright */}
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear}{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                MarkDev
              </span>
              . All rights reserved.
            </p>
          </div>

          {/* Center: App Name */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">
                BudgetTracker Pro
              </span>{" "}
              - Smart Finance Management
            </p>
          </div>

          {/* Right: Links */}
          <div className="flex gap-4 text-sm">
            <a
              href="#"
              className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition"
            >
              Privacy
            </a>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <a
              href="#"
              className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition"
            >
              Terms
            </a>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-500">MarkDev</p>
        </div>
      </div>
    </footer>
  );
}
