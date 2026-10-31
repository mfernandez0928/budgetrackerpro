import type {
  Account,
  BudgetStoreSnapshot,
  Category,
  InstallmentPlan,
  PlannedPayment,
  RecurringBill,
  SavingsGoal,
  Transaction,
} from "../types/finance";
import {
  addMonths,
  addWeeks,
  daysUntil,
  formatMonthLabel,
  getMonthKey,
  getMonthKeyFromISO,
} from "./date";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "income-salary", name: "Salary", color: "#10b981", icon: "salary", type: "income" },
  { id: "income-side", name: "Side Income", color: "#34d399", icon: "spark", type: "income" },
  { id: "housing", name: "Housing", color: "#0f766e", icon: "home", type: "expense" },
  { id: "groceries", name: "Groceries", color: "#f59e0b", icon: "bag", type: "expense" },
  { id: "transport", name: "Transport", color: "#3b82f6", icon: "car", type: "expense" },
  { id: "utilities", name: "Utilities", color: "#8b5cf6", icon: "bolt", type: "expense" },
  { id: "dining", name: "Dining", color: "#f97316", icon: "fork", type: "expense" },
  { id: "shopping", name: "Shopping", color: "#ec4899", icon: "bag", type: "expense" },
  { id: "health", name: "Health", color: "#ef4444", icon: "heart", type: "expense" },
  { id: "savings", name: "Savings", color: "#14b8a6", icon: "target", type: "expense" },
  { id: "other", name: "Other", color: "#6b7280", icon: "dots", type: "expense" },
];

export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: "wallet-cash",
    name: "Cash Wallet",
    type: "cash",
    classification: "debit",
    openingBalance: 0,
    color: "#f59e0b",
    icon: "₱",
    currencyCode: "PHP",
    details: "Debit • PHP",
  },
  {
    id: "bank-main",
    name: "Main Bank",
    type: "bank",
    classification: "debit",
    openingBalance: 0,
    color: "#0f766e",
    icon: "B",
    currencyCode: "PHP",
    details: "Debit • PHP",
  },
  {
    id: "ewallet",
    name: "E-Wallet",
    type: "ewallet",
    classification: "debit",
    openingBalance: 0,
    color: "#3b82f6",
    icon: "E",
    currencyCode: "PHP",
    details: "Debit • PHP",
  },
  {
    id: "credit-card",
    name: "Rewards Card",
    type: "credit",
    classification: "credit",
    openingBalance: 0,
    color: "#8b5cf6",
    icon: "C",
    currencyCode: "PHP",
    details: "Credit • PHP",
    creditLimit: 10000,
  },
];

export function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createDefaultSnapshot(): BudgetStoreSnapshot {
  return {
    transactions: [],
    categories: DEFAULT_CATEGORIES,
    accounts: DEFAULT_ACCOUNTS,
    budgets: [],
    savingsGoals: [],
    recurringBills: [],
    debts: [],
    moneyOwed: [],
    plannedPayments: [],
    installments: [],
    settings: {
      currencyCode: "USD",
      themeMode: "system",
      notificationsEnabled: false,
      startOfMonth: 1,
      reducedMotion: false,
    },
    profile: {
      hasCompletedOnboarding: false,
    },
  };
}

export function getCurrencyOptions() {
  return [
    { code: "USD", label: "USD - US Dollar" },
    { code: "PHP", label: "PHP - Philippine Peso" },
    { code: "EUR", label: "EUR - Euro" },
    { code: "GBP", label: "GBP - British Pound" },
  ] as const;
}

export function formatCurrency(amount: number, currencyCode: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getMonthlyTransactions(
  transactions: Transaction[],
  monthKey = getMonthKey()
) {
  return transactions.filter((transaction) => getMonthKeyFromISO(transaction.date) === monthKey);
}

export function getMonthlySummary(
  snapshot: BudgetStoreSnapshot,
  monthKey = getMonthKey()
) {
  const monthTransactions = getMonthlyTransactions(snapshot.transactions, monthKey);
  const income = monthTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const expenses = monthTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const budgets = getBudgetUsage(snapshot, monthKey);
  const planned = budgets.reduce((total, budget) => total + budget.limit, 0);
  const spentAgainstBudget = budgets.reduce((total, budget) => total + budget.spent, 0);
  const savingsRate = income > 0 ? Math.max(0, ((income - expenses) / income) * 100) : 0;

  return {
    income,
    expenses,
    balance: income - expenses,
    planned,
    spentAgainstBudget,
    savingsRate,
    budgetHealth:
      planned === 0
        ? "needs-budget"
        : spentAgainstBudget <= planned * 0.8
        ? "healthy"
        : spentAgainstBudget <= planned
        ? "watch"
        : "over",
  };
}

export function getBudgetUsage(snapshot: BudgetStoreSnapshot, monthKey = getMonthKey()) {
  return snapshot.budgets
    .filter((budget) => budget.month === monthKey)
    .map((budget) => {
      const spent = snapshot.transactions
        .filter(
          (transaction) =>
            transaction.type === "expense" &&
            transaction.categoryId === budget.categoryId &&
            getMonthKeyFromISO(transaction.date) === monthKey
        )
        .reduce((total, transaction) => total + transaction.amount, 0);

      const usage = budget.limit > 0 ? spent / budget.limit : 0;
      return {
        ...budget,
        spent,
        remaining: Math.max(0, budget.limit - spent),
        usage,
        status:
          usage >= 1
            ? "over"
            : usage >= budget.alertThreshold
            ? "watch"
            : "healthy",
        category: snapshot.categories.find((category) => category.id === budget.categoryId),
      };
    })
    .sort((a, b) => b.usage - a.usage);
}

export function getCategorySpendData(snapshot: BudgetStoreSnapshot, monthKey = getMonthKey()) {
  const totals = new Map<string, number>();
  snapshot.transactions.forEach((transaction) => {
    if (
      transaction.type === "expense" &&
      getMonthKeyFromISO(transaction.date) === monthKey
    ) {
      totals.set(
        transaction.categoryId,
        (totals.get(transaction.categoryId) ?? 0) + transaction.amount
      );
    }
  });

  const grandTotal = Array.from(totals.values()).reduce((sum, value) => sum + value, 0);
  return Array.from(totals.entries())
    .map(([categoryId, amount]) => {
      const category = snapshot.categories.find((item) => item.id === categoryId);
      return {
        id: categoryId,
        name: category?.name ?? "Uncategorized",
        color: category?.color ?? "#6b7280",
        amount,
        share: grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0,
      };
    })
    .sort((first, second) => second.amount - first.amount);
}

export function getTrendData(snapshot: BudgetStoreSnapshot, months = 6) {
  const points: Array<{ month: string; income: number; expenses: number }> = [];
  const current = new Date();

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(current.getFullYear(), current.getMonth() - offset, 1);
    const monthKey = getMonthKey(date);
    const summary = getMonthlySummary(snapshot, monthKey);
    points.push({
      month: formatMonthLabel(monthKey).split(" ")[0],
      income: summary.income,
      expenses: summary.expenses,
    });
  }

  return points;
}

export function getRecentTransactions(transactions: Transaction[], limit = 6) {
  return [...transactions]
    .sort((first, second) => new Date(second.date).getTime() - new Date(first.date).getTime())
    .slice(0, limit);
}

export function getUpcomingBills(recurringBills: RecurringBill[], withinDays = 21) {
  return recurringBills
    .filter((bill) => bill.isActive)
    .map((bill) => ({
      ...bill,
      dueInDays: daysUntil(bill.nextDueDate),
    }))
    .filter((bill) => bill.dueInDays <= withinDays)
    .sort(
      (first, second) =>
        new Date(first.nextDueDate).getTime() - new Date(second.nextDueDate).getTime()
    );
}

export function getGoalProgress(goals: SavingsGoal[]) {
  return goals.map((goal) => ({
    ...goal,
    progress: goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0,
    remaining: Math.max(0, goal.targetAmount - goal.currentAmount),
  }));
}

export function getMonthlyInsightSummary(snapshot: BudgetStoreSnapshot) {
  const summary = getMonthlySummary(snapshot);
  const categoryData = getCategorySpendData(snapshot);
  const topCategory = categoryData[0];
  const upcomingBills = getUpcomingBills(snapshot.recurringBills, 14);
  const upcomingPayments = getUpcomingPayments(snapshot, 14);
  const budgetUsage = getBudgetUsage(snapshot);
  const budgetAlerts = budgetUsage.filter((budget) => budget.status !== "healthy");
  const goalProgress = getGoalProgress(snapshot.savingsGoals);
  const closestGoal = [...goalProgress].sort((a, b) => b.progress - a.progress)[0];
  const insights = buildMonthlyInsightLines(snapshot);

  return {
    summary,
    topCategory,
    upcomingBillsCount: upcomingBills.length,
    upcomingPaymentsCount: upcomingPayments.length,
    budgetAlerts,
    closestGoal,
    insights,
    hasData: snapshot.transactions.length > 0,
  };
}

export function getAccountBalances(snapshot: BudgetStoreSnapshot) {
  return snapshot.accounts.map((account) => {
    const balance = snapshot.transactions.reduce((total, transaction) => {
      if (transaction.type === "transfer") {
        if (transaction.accountId === account.id) return total - transaction.amount;
        if (transaction.toAccountId === account.id) return total + transaction.amount;
        return total;
      }
      if (transaction.accountId !== account.id) return total;
      return transaction.type === "income"
        ? total + transaction.amount
        : total - transaction.amount;
    }, account.openingBalance);

    return {
      ...account,
      balance,
    };
  });
}

export function getWalletSummary(snapshot: BudgetStoreSnapshot) {
  const balances = getAccountBalances(snapshot);
  const debitAccounts = balances.filter((account) => account.classification === "debit");
  const creditAccounts = balances.filter((account) => account.classification === "credit");
  const assets = debitAccounts.reduce((sum, account) => sum + account.balance, 0);
  const creditUsed = creditAccounts.reduce((sum, account) => sum + Math.max(0, account.balance), 0);
  const debts = snapshot.debts.reduce((sum, debt) => sum + debt.balance, 0);
  const receivables = snapshot.moneyOwed.reduce((sum, item) => sum + item.amount, 0);

  return {
    balances,
    assets,
    creditUsed,
    debts,
    receivables,
    netWorth: assets + receivables - debts - creditUsed,
  };
}

export function getAccountFlowSummary(snapshot: BudgetStoreSnapshot, accountId: string) {
  const transactions = snapshot.transactions.filter((transaction) => transaction.accountId === accountId);
  const recent = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);
  const bars = recent.map((transaction) =>
    transaction.type === "expense"
      ? { kind: "out", amount: transaction.amount }
      : { kind: "in", amount: transaction.amount }
  );
  const maxAmount = Math.max(...bars.map((bar) => bar.amount), 1);
  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const expenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const net = income - expenses;

  return {
    bars: bars.map((bar) => ({
      ...bar,
      height: Math.max(12, Math.round((bar.amount / maxAmount) * 100)),
    })),
    income,
    expenses,
    net,
  };
}

type UpcomingPaymentItem = {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  source: "recurring-bill" | "planned-payment" | "installment" | "debt";
  note: string;
  dueInDays: number;
};

function mapRecurringBillToUpcomingPayment(bill: RecurringBill): UpcomingPaymentItem {
  return {
    id: bill.id,
    title: bill.title,
    amount: bill.amount,
    dueDate: bill.nextDueDate,
    source: "recurring-bill",
    note: "Recurring bill",
    dueInDays: daysUntil(bill.nextDueDate),
  };
}

function mapPlannedPayment(payment: PlannedPayment): UpcomingPaymentItem {
  return {
    id: payment.id,
    title: payment.title,
    amount: payment.amount,
    dueDate: payment.dueDate,
    source: "planned-payment",
    note: "Planned payment",
    dueInDays: daysUntil(payment.dueDate),
  };
}

function mapInstallment(item: InstallmentPlan): UpcomingPaymentItem {
  return {
    id: item.id,
    title: item.title,
    amount: item.installmentAmount,
    dueDate: item.nextDueDate,
    source: "installment",
    note: `${item.remainingPayments} payments left`,
    dueInDays: daysUntil(item.nextDueDate),
  };
}

export function getUpcomingPayments(
  snapshot: BudgetStoreSnapshot,
  withinDays = 21
): UpcomingPaymentItem[] {
  const debtPayments: UpcomingPaymentItem[] = snapshot.debts.map((debt) => ({
    id: debt.id,
    title: debt.title,
    amount: debt.minimumPayment,
    dueDate: debt.dueDate,
    source: "debt",
    note: "Minimum payment due",
    dueInDays: daysUntil(debt.dueDate),
  }));

  return [
    ...snapshot.recurringBills.filter((bill) => bill.isActive).map(mapRecurringBillToUpcomingPayment),
    ...snapshot.plannedPayments
      .filter((payment) => payment.status !== "paid")
      .map(mapPlannedPayment),
    ...snapshot.installments.map(mapInstallment),
    ...debtPayments,
  ]
    .filter((payment) => payment.dueInDays <= withinDays)
    .sort(
      (first, second) =>
        new Date(first.dueDate).getTime() - new Date(second.dueDate).getTime()
    );
}

export function getBudgetRecommendations(snapshot: BudgetStoreSnapshot) {
  const budgetedCategoryIds = new Set(
    snapshot.budgets.filter((budget) => budget.month === getMonthKey()).map((budget) => budget.categoryId)
  );
  const spendingThisMonth = getCategorySpendData(snapshot);

  return spendingThisMonth
    .filter((item) => !budgetedCategoryIds.has(item.id))
    .slice(0, 3);
}

export function getOnboardingChecklist(snapshot: BudgetStoreSnapshot) {
  const steps = [
    {
      id: "transactions",
      label: "Add your first transaction",
      done: snapshot.transactions.length > 0,
      href: "/transactions",
    },
    {
      id: "budgets",
      label: "Set at least one category budget",
      done: snapshot.budgets.length > 0,
      href: "/plan",
    },
    {
      id: "bills",
      label: "Add a recurring bill",
      done: snapshot.recurringBills.length > 0,
      href: "/plan",
    },
    {
      id: "goals",
      label: "Create a savings goal",
      done: snapshot.savingsGoals.length > 0,
      href: "/plan",
    },
  ];

  return {
    steps,
    completed: steps.filter((step) => step.done).length,
    total: steps.length,
  };
}

export function buildMonthlyInsightLines(snapshot: BudgetStoreSnapshot) {
  const summary = getMonthlySummary(snapshot);
  const budgetUsage = getBudgetUsage(snapshot);
  const topCategory = getCategorySpendData(snapshot)[0];
  const upcomingPayments = getUpcomingPayments(snapshot, 10);
  const insights: string[] = [];

  if (summary.income === 0 && summary.expenses === 0) {
    return ["Start with a few transactions this month to unlock behavior insights."];
  }

  if (summary.savingsRate >= 20) {
    insights.push("Your savings rate is healthy this month. Protect that buffer before adding new spending.");
  } else if (summary.savingsRate > 0) {
    insights.push("You are still positive this month, but savings are thinner than ideal.");
  } else {
    insights.push("Expenses are outpacing income this month. Trim one flexible category now.");
  }

  const overBudget = budgetUsage.find((budget) => budget.status === "over");
  const nearBudget = budgetUsage.find((budget) => budget.status === "watch");
  if (overBudget?.category) {
    insights.push(`${overBudget.category.name} is already over budget. Rebalance before the month closes.`);
  } else if (nearBudget?.category) {
    insights.push(`${nearBudget.category.name} is nearing its limit. Watch the next few purchases there.`);
  }

  if (topCategory) {
    insights.push(`${topCategory.name} is your top spending category so far this month.`);
  }

  if (upcomingPayments[0]) {
    insights.push(
      `${upcomingPayments[0].title} is coming up ${upcomingPayments[0].dueInDays <= 0 ? "now" : `in ${upcomingPayments[0].dueInDays} days`}.`
    );
  }

  return insights.slice(0, 3);
}

export function advanceRecurringDate(recurringBill: RecurringBill, paidDate: string) {
  const nextDueDate =
    recurringBill.cadence === "weekly"
      ? addWeeks(paidDate, recurringBill.interval)
      : addMonths(paidDate, recurringBill.interval);

  return {
    ...recurringBill,
    nextDueDate,
    lastPaidDate: paidDate,
  };
}

export function normalizeCurrencyCode(currencyCode: string | undefined) {
  const legacyMap: Record<string, string> = {
    "$ (USD)": "USD",
    "PHP": "PHP",
    "EUR": "EUR",
    "GBP": "GBP",
  };

  return (legacyMap[currencyCode ?? ""] ?? "USD") as
    | "USD"
    | "PHP"
    | "EUR"
    | "GBP";
}
