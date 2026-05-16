export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-black/75 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-4 text-sm">
        
        {/* Navigation */}
        <div className="flex items-center gap-2 text-slate-400">
          <a
            href="#"
            className="transition hover:text-white"
          >
            About
          </a>

          <span>|</span>

          <a
            href="#"
            className="transition hover:text-white"
          >
            Rules
          </a>

          <span>|</span>

          <a
            href="https://discord.gg/UktzPwQgj"
            target="_blank"
            rel="noopener noreferrer"
            className="transition duration-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(25,255,255,0.8)]"
          >
            Discord
          </a>
        </div>

        {/* Copyright */}
        <div className="mt-2 text-xs text-slate-500">
          © 2021-2026 TrackMania TAS Leaderboards
        </div>
      </div>
    </footer>
  );
}