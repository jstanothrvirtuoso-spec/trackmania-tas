
import Image from "next/image";

export function Resources() {
  return (
    <div className="w-full flex justify-center">
      <div className="flex flex-col gap-2 rounded-xl bg-white/5 backdrop-blur-xl
        border border-white/10 px-3 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
      >
        {/* TITLE */}
        <p className="text-[12px] tracking-[0.35em] text-white/80 uppercase mb-1">
          Resources
        </p>

        <div className="w-full flex justify-end mb-3">
          <div className="flex items-center gap-6 rounded-xl bg-white/5 backdrop-blur-xl
            border border-white/10 px-3 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
          >
            {/* TMI */}
            <a href="https://donadigo.com/tminterface/" className="flex items-center gap-2 group">
              <Image
                src="/icons/tmi.webp"
                alt="TMI"
                width={170}
                height={171}
                className="w-7 h-7 group-hover:scale-110 transition shadow-lg" 
              />
              <span className="text-[14px] text-slate-200 group-hover:text-slate-100 [text-shadow:1px_1px_4px_rgba(0,0,0,0.4)]">
                TMInterface
              </span>
            </a>

            {/* DOCS */}
            <a href="https://docs.google.com/document/d/1iXvjL-ZqHgD6Xk4_NgKsWOl-o1f-0KKsnD3NeTEqsAI/edit" className="flex items-center gap-2 group">
              <Image 
                src="/icons/google-docs.webp"
                alt="Docs"
                width={125}
                height={172}
                className="w-6 h-7 group-hover:scale-110 transition shadow-lg" 
              />
              <span className="text-[14px] text-slate-200 group-hover:text-slate-100 [text-shadow:1px_1px_4px_rgba(0,0,0,0.4)]">
                Tutorial
              </span>
            </a>

          </div>
        </div>

      </div>
    </div>
  );
}
