import { TransactionComposer } from "../components/transactions/TransactionComposer";
import { TransactionList } from "../components/transactions/TransactionList";
import { PageIntro } from "../components/ui/PageIntro";

export default function Transactions() {
  return (
    <section className="space-y-4 md:space-y-5">
      <PageIntro title="History" />
      <TransactionComposer />
      <TransactionList />
    </section>
  );
}
