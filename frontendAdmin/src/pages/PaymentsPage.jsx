import { transactions } from "../data/adminData";

function PaymentsPage() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border p-5" style={{ borderColor: "var(--neutral-100)" }}><p style={{ color: "rgba(51,51,51,0.7)" }}>Total Revenue</p><p className="text-5xl font-bold">Rs 45,200</p></article>
        <article className="rounded-2xl border p-5" style={{ borderColor: "var(--neutral-100)" }}><p style={{ color: "rgba(51,51,51,0.7)" }}>This Month</p><p className="text-5xl font-bold text-green-600">Rs 8,450</p></article>
        <article className="rounded-2xl border p-5" style={{ borderColor: "var(--neutral-100)" }}><p style={{ color: "rgba(51,51,51,0.7)" }}>Pending</p><p className="text-5xl font-bold text-orange-500">Rs 1,230</p></article>
        <article className="rounded-2xl border p-5" style={{ borderColor: "var(--neutral-100)" }}><p style={{ color: "rgba(51,51,51,0.7)" }}>Refunded</p><p className="text-5xl font-bold text-red-600">Rs 450</p></article>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--neutral-100)" }}>
        <div className="p-5 border-b" style={{ borderColor: "var(--neutral-100)" }}>
          <h3 className="text-2xl font-semibold">Recent Transactions</h3>
        </div>
        {transactions.map(([name, course, amount, date, amountColor]) => (
          <div key={`${name}-${date}-${amount}`} className="p-5 border-b flex items-center justify-between gap-4" style={{ borderColor: "var(--neutral-100)" }}>
            <div>
              <p className="font-medium">{name}</p>
              <p style={{ color: "rgba(51,51,51,0.6)" }}>{course}</p>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${amountColor}`}>{amount}</p>
              <p className="text-sm" style={{ color: "rgba(51,51,51,0.6)" }}>{date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PaymentsPage;