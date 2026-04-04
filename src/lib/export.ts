import { createId } from "./finance";
import { getTodayISO } from "./date";
import type { BudgetStoreSnapshot, Category, Transaction } from "../types/finance";

export function exportSnapshotAsJson(snapshot: BudgetStoreSnapshot) {
  return JSON.stringify(snapshot, null, 2);
}

export function exportTransactionsAsCsv(
  transactions: Transaction[],
  categories: Category[]
) {
  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));
  const rows = [
    [
      "date",
      "title",
      "type",
      "amount",
      "category",
      "accountId",
      "paymentMethod",
      "notes",
    ].join(","),
    ...transactions.map((transaction) =>
      [
        transaction.date,
        escapeCsv(transaction.title),
        transaction.type,
        transaction.amount.toFixed(2),
        escapeCsv(categoryMap.get(transaction.categoryId) ?? ""),
        transaction.accountId,
        transaction.paymentMethod,
        escapeCsv(transaction.notes ?? ""),
      ].join(",")
    ),
  ];

  return rows.join("\n");
}

function escapeCsv(value: string) {
  const normalized = value.split('"').join('""');
  return /[",\n]/.test(normalized) ? `"${normalized}"` : normalized;
}

export function parseJsonSnapshot(rawText: string) {
  return JSON.parse(rawText) as Partial<BudgetStoreSnapshot>;
}

export function parseCsvTransactions(
  rawText: string,
  categories: Category[],
  defaultAccountId: string
): Transaction[] {
  const lines = rawText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map((header) => header.trim().toLowerCase());
  const getIndex = (field: string) => headers.indexOf(field);

  const dateIndex = getIndex("date");
  const titleIndex = getIndex("title") >= 0 ? getIndex("title") : getIndex("description");
  const amountIndex = getIndex("amount");
  const typeIndex = getIndex("type");
  const categoryIndex = getIndex("category");

  return lines.slice(1).flatMap((line) => {
    if (!line.trim()) return [];
    const values = splitCsvLine(line);
    const title = values[titleIndex] ?? "Imported transaction";
    const rawAmount = Number(values[amountIndex] ?? 0);
    const explicitType = values[typeIndex]?.toLowerCase() ?? "";
    const inferredType =
      explicitType === "income" || explicitType === "expense" || explicitType === "transfer"
        ? explicitType
        : rawAmount >= 0
        ? "income"
        : "expense";
    const matchingCategory = categories.find(
      (category) =>
        category.name.toLowerCase() === (values[categoryIndex] ?? "").trim().toLowerCase()
    );

    return [
      {
        id: createId("tx"),
        createdAt: new Date().toISOString(),
        title,
        amount: Math.abs(rawAmount),
        type: inferredType as "income" | "expense" | "transfer",
        date: values[dateIndex] ?? getTodayISO(),
        categoryId: matchingCategory?.id ?? categories[0]?.id ?? "other",
        accountId: defaultAccountId,
        paymentMethod: "bank" as const,
        notes: "Imported from CSV",
        status: "cleared" as const,
      },
    ];
  });
}

function splitCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (character === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += character;
    }
  }

  values.push(current);
  return values;
}
