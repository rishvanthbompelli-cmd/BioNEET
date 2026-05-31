const LEVEL_COLORS = [
  'bg-dark-800',
  'bg-primary-900/80',
  'bg-primary-700/80',
  'bg-primary-500/80',
  'bg-primary-400',
];

export default function HeatmapChart({ data = [] }) {
  const weeks = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <div className="flex gap-1 min-w-max">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.minutes} min`}
                className={`w-3 h-3 rounded-sm ${LEVEL_COLORS[day.level] || LEVEL_COLORS[0]} transition-transform hover:scale-125`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
        <span>Less</span>
        {LEVEL_COLORS.map((c, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
