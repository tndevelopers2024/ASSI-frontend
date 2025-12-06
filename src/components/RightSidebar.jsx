export default function RightSidebar() {
  const latestNews = [
    "ASSI Live Operative Course 2024",
    "ASSI Live Operative Course 2025",
    "Spine Conference 2025",
  ];

  const latestCases = [
    "Degenerative Spine Case",
    "Trauma Case",
    "Complex Scoliosis Case",
  ];

  return (
    <div className="overflow-y-auto relative p-4 max-md:hidden">

      {/* Latest News */}
      <div className="fixed">
        <div className="mb-8 bg-white p-5 rounded-2xl shadow">
        <h2 className="font-semibold mb-3">Latest News</h2>
        <ul className="space-y-2">
          {latestNews.map((n, i) => (
            <li
              key={i}
              className="grid grid-cols-[1fr_auto] text-sm hover:text-blue-600 cursor-pointer"
            >
              <p className="whitespace-normal break-words">{n}</p>
              <span className="text-blue-600 ml-4">know more</span>
            </li>
          ))}
        </ul>

      </div>

      {/* Latest Cases */}
      <div className="mb-8 bg-white p-5 rounded-2xl shadow">
        <h2 className="font-semibold mb-3">Latest Cases</h2>
        <ul className="space-y-2">
          {latestCases.map((c, i) => (
            <li
              key={i}
              className="grid grid-cols-[1fr_auto] text-sm hover:text-blue-600 cursor-pointer"
            >
              <p className="whitespace-normal break-words">{c}</p>
              <span className="text-blue-600 ml-4">know more</span>
            </li>
          ))}
        </ul>

      </div>
      </div>
    </div>
  );
}
