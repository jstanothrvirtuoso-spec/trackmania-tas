"use client";

export default function HighlightPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.85)]">
        
        <h1
          className="text-3xl text-white"
          style={{ fontFamily: "OktaNeue" }}
        >
          Highlight
        </h1>

        <p className="mt-4 text-slate-300">
          TODO : TAS of the day / Undone TAS of the day / TASer of the day / Reset time (timezone) / Legend of Undone TASes
        </p>

        {/* EXAMPLE CARDS */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          
          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <h2 className="text-xl text-white">
              test page
            </h2>

            <p className="mt-2 text-slate-400">
              test page
            </p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <h2 className="text-xl text-white">
              test box
            </h2>

            <p className="mt-2 text-slate-400">
              test box
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}