import { TransactionComposer } from "../components/transactions/TransactionComposer";
import { TransactionList } from "../components/transactions/TransactionList";

export default function Transactions() {
  return (
    <section className="space-y-6">
      <TransactionComposer />
      <TransactionList />
    </section>
  );
}
