export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-400">
            TrackMania TAS Leaderboards - Community-driven tool-assisted speedruns
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-slate-400 hover:text-white transition">
              About
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition">
              Rules
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition">
              Discord
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}