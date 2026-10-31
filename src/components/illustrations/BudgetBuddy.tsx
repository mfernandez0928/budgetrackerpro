export function BudgetBuddy({ mood = "wave" }: { mood?: "wave" | "book" }) {
  return (
    <div className="relative h-40 w-40 shrink-0">
      <div className="absolute inset-x-5 top-2 h-14 rounded-full bg-[#5f975d]" />
      <div className="absolute left-8 top-6 h-10 w-10 rounded-full border-4 border-[#4d7d4b] bg-[#c19068]" />
      <div className="absolute right-8 top-6 h-10 w-10 rounded-full border-4 border-[#4d7d4b] bg-[#c19068]" />
      <div className="absolute inset-x-8 top-8 h-24 rounded-[44px] border-4 border-[#4d7d4b] bg-[#c19068]" />
      <div className="absolute left-10 top-16 h-8 w-8 rounded-full bg-white">
        <div className="absolute left-2 top-2 h-4 w-4 rounded-full bg-slate-900" />
      </div>
      <div className="absolute right-10 top-16 h-8 w-8 rounded-full bg-white">
        <div className="absolute left-2 top-2 h-4 w-4 rounded-full bg-slate-900" />
      </div>
      <div className="absolute inset-x-[4.6rem] top-[5.3rem] h-3 rounded-full bg-[#7b5b43]" />
      <div className="absolute inset-x-10 top-24 h-16 rounded-[32px] bg-[#5f975d]" />
      <div className="absolute left-4 top-12 h-3 w-8 rounded-full bg-[#5f975d] rotate-[-20deg]" />
      <div className="absolute right-4 top-12 h-3 w-8 rounded-full bg-[#5f975d] rotate-[20deg]" />
      {mood === "book" ? (
        <div className="absolute inset-x-[3.8rem] top-[6.6rem] h-8 rounded-xl bg-[#8b5a2b]" />
      ) : (
        <div className="absolute right-3 top-[6.2rem] h-3 w-12 rounded-full bg-[#5f975d] rotate-[28deg]" />
      )}
    </div>
  );
}
