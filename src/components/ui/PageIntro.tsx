interface PageIntroProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function PageIntro({ title, description, action }: PageIntroProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-[3rem] font-black leading-none tracking-[-0.04em] text-slate-900">
          {title}
        </h1>
        <p className="mt-3 text-[1.15rem] text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}
