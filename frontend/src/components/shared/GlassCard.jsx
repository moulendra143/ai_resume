export default function GlassCard({ title, subtitle, children, className }) {
  return (
    <section className={`glass-panel rounded-[28px] p-6 ${className || ''}`}>
      {title && <div className="mb-4"><h3 className="text-xl font-semibold text-white">{title}</h3>{subtitle && <p className="mt-2 text-slate-400">{subtitle}</p>}</div>}
      {children}
    </section>
  );
}
