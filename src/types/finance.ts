export type TransactionType = "income" | "expense" | "transfer";
export type PaymentMethod = "cash" | "bank" | "card" | "ewallet" | "transfer";
export type AccountType = "cash" | "bank" | "ewallet" | "credit";
export type ThemeMode = "system" | "light" | "dark";
export type CurrencyCode = "USD" | "PHP" | "EUR" | "GBP";

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: "income" | "expense";
  isCustom?: boolean;
  templateKey?: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  classification: "debit" | "credit";
  openingBalance: number;
  color: string;
  icon?: string;
  currencyCode?: CurrencyCode;
  institution?: string;
  details?: string;
  annualYield?: number;
  creditLimit?: number;
  liveRate?: number;
  liveRateUpdatedAt?: string;
  unitsLabel?: string;
}

export interface DebtItem {
  id: string;
  title: string;
  creditor: string;
  balance: number;
  minimumPayment: number;
  dueDate: string;
}

export interface MoneyOwedItem {
  id: string;
  title: string;
  person: string;
  amount: number;
  dueDate: string;
}

export interface PlannedPayment {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  categoryId: string;
  accountId: string;
  status: "planned" | "scheduled" | "paid";
}

export interface InstallmentPlan {
  id: string;
  title: string;
  totalAmount: number;
  paidAmount: number;
  installmentAmount: number;
  nextDueDate: string;
  remainingPayments: number;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  date: string;
  categoryId: string;
  accountId: string;
  toAccountId?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  recurringId?: string;
  isRecurringInstance?: boolean;
  createdOffline?: boolean;
  status: "cleared" | "pending";
  createdAt: string;
}

export interface Budget {
  id: string;
  month: string;
  categoryId: string;
  limit: number;
  alertThreshold: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetMonth?: string;
  color: string;
}

export interface RecurringBill {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  accountId: string;
  paymentMethod: PaymentMethod;
  cadence: "weekly" | "monthly";
  interval: number;
  nextDueDate: string;
  remindDaysBefore: number;
  notes?: string;
  isActive: boolean;
  autoAdd: boolean;
  lastPaidDate?: string;
}

export interface Settings {
  currencyCode: CurrencyCode;
  themeMode: ThemeMode;
  notificationsEnabled: boolean;
  startOfMonth: number;
  reducedMotion: boolean;
}

export interface Profile {
  hasCompletedOnboarding: boolean;
}

export interface BudgetStoreState {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  recurringBills: RecurringBill[];
  debts: DebtItem[];
  moneyOwed: MoneyOwedItem[];
  plannedPayments: PlannedPayment[];
  installments: InstallmentPlan[];
  settings: Settings;
  profile: Profile;
  addTransaction: (transaction: Omit<Transaction, "id" | "createdAt">) => void;
  updateTransaction: (
    transactionId: string,
    updates: Partial<Omit<Transaction, "id" | "createdAt">>
  ) => void;
  deleteTransaction: (transactionId: string) => void;
  upsertBudget: (budget: Omit<Budget, "id">) => void;
  deleteBudget: (budgetId: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, "id">) => void;
  updateSavingsGoal: (
    goalId: string,
    updates: Partial<Omit<SavingsGoal, "id">>
  ) => void;
  deleteSavingsGoal: (goalId: string) => void;
  addRecurringBill: (bill: Omit<RecurringBill, "id">) => void;
  updateRecurringBill: (
    billId: string,
    updates: Partial<Omit<RecurringBill, "id">>
  ) => void;
  deleteRecurringBill: (billId: string) => void;
  markRecurringBillPaid: (billId: string, paidDate?: string) => void;
  addAccount: (account: Omit<Account, "id">) => void;
  updateAccount: (accountId: string, updates: Partial<Omit<Account, "id">>) => void;
  deleteAccount: (accountId: string) => void;
  addDebt: (debt: Omit<DebtItem, "id">) => void;
  deleteDebt: (debtId: string) => void;
  addMoneyOwed: (moneyOwed: Omit<MoneyOwedItem, "id">) => void;
  deleteMoneyOwed: (moneyOwedId: string) => void;
  addPlannedPayment: (payment: Omit<PlannedPayment, "id">) => void;
  deletePlannedPayment: (paymentId: string) => void;
  addInstallment: (installment: Omit<InstallmentPlan, "id">) => void;
  deleteInstallment: (installmentId: string) => void;
  addCategory: (category: Omit<Category, "id">) => void;
  updateCategory: (
    categoryId: string,
    updates: Partial<Omit<Category, "id">>
  ) => void;
  deleteCategory: (categoryId: string) => void;
  updateSettings: (updates: Partial<Settings>) => void;
  completeOnboarding: () => void;
  importSnapshot: (snapshot: Partial<BudgetStoreSnapshot>) => void;
  resetToDefaults: () => void;
}

export type BudgetStoreSnapshot = Pick<
  BudgetStoreState,
  | "transactions"
  | "categories"
  | "accounts"
  | "budgets"
  | "savingsGoals"
  | "recurringBills"
  | "debts"
  | "moneyOwed"
  | "plannedPayments"
  | "installments"
  | "settings"
  | "profile"
>;
