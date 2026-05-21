"use client";

export default function InputsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.85)]">

        <h1
          className="text-3xl text-white"
          style={{ fontFamily: "OktaNeue" }}
        >
          Inputs
        </h1>

        <p className="mt-4 text-slate-300">
          to do by Kimura                  meow
        </p>

        {/* EXAMPLE TABLE */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full text-center text-sm">
            <thead className="bg-slate-900 text-slate-300">
            </thead>
          </table>
        </div>

      </div>
    </div>
  );
}