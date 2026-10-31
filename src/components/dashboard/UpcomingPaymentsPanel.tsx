import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store/useStore";
import { formatCurrency, getUpcomingPayments } from "../../lib/finance";
import { EmptyState } from "../ui/EmptyState";

export function UpcomingPaymentsPanel() {
  const store = useStore();
  const navigate = useNavigate();
  const upcomingPayments = getUpcomingPayments(store, 14).slice(0, 5);

  return (
    <section className="rounded-3xl border border-line bg-surface p-4 md:p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-warn" />
          <p className="text-base font-semibold text-ink">Upcoming payments</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/plan")}
          className="rounded-full border border-line bg-raised px-4 py-2 text-sm font-semibold text-ink transition hover:bg-raised"
        >
          Open plan
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {upcomingPayments.map((payment) => (
          <div
            key={`${payment.source}-${payment.id}`}
            className="flex items-center justify-between rounded-3xl border border-line bg-raised px-4 py-3"
          >
            <div>
              <p className="font-semibold text-ink">{payment.title}</p>
              <p className="text-sm text-muted">
                {payment.note} · {payment.dueInDays <= 0 ? "Due now" : `${payment.dueInDays} days left`}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-ink">
                {formatCurrency(payment.amount, store.settings.currencyCode)}
              </p>
              <p className="text-xs text-muted">{payment.dueDate}</p>
            </div>
          </div>
        ))}
        {!upcomingPayments.length ? (
          <EmptyState
            title="No upcoming payments"
            description="Add recurring bills, debt payments, installments, or planned payments to get ahead of the month."
            actionLabel="Plan payments"
            onAction={() => navigate("/plan")}
          />
        ) : null}
      </div>
    </section>
  );
}
