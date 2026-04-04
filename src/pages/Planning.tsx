import { BudgetPlanner } from "../components/planning/BudgetPlanner";
import { RecurringBillsPanel } from "../components/planning/RecurringBillsPanel";

export default function Planning() {
  return (
    <section className="space-y-6">
      <BudgetPlanner />
      <RecurringBillsPanel />
    </section>
  );
}
