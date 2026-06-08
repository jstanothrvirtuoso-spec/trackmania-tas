
import { useState, useMemo } from "react";
import { useAuthors } from "@/lib/Authors";
import { KEY_AUTHORS } from "@/utils/constants";
import { AuthorInfo } from "@/utils/typing";

interface AuthorSelectorProps {
  authors: string[];
  onChange: (next: string[]) => void;
};

const AUTHOR_REGEX = /^[a-zA-Z0-9 _.'-]+$/;
const MAX_LEN = 20;
const MIN_LEN = 3;

export default function AuthorSelector({ authors, onChange }: AuthorSelectorProps) {

  const { data: authorData = [] } = useAuthors();
  const [authorQuery, setAuthorQuery] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);

  const authorOptions = useMemo(() => {
    const rest = authorData.filter((a) => a.author !== "Unknown");

    const keySet = new Set(KEY_AUTHORS);

    const keyAuthors = rest.filter((a) => keySet.has(a.author));
    const remaining = rest.filter((a) => !keySet.has(a.author));

    const sorted = (arr: AuthorInfo[]) =>
      [...arr].sort((a, b) => a.author.localeCompare(b.author));

    return [
      ...sorted(keyAuthors),
      { id: "", author: "" },
      ...sorted(remaining),
    ];
  }, [authorData]);

  const knownAuthors = useMemo(
    () => new Set(authorOptions.map((a) => a.author)),
    [authorOptions]
  );

  const suggestions = useMemo(() => {

    const query = authorQuery.trim().toLowerCase();
    const matches = authorOptions
      .filter((a) => a.author)
      .filter((a) => !authors.includes(a.author))
      .map((a) => ({
        ...a,
        score: a.author.toLowerCase().startsWith(query)
          ? 0
          : a.author.toLowerCase().includes(query)
          ? 1
          : 999,
      }))
      .filter((a) => query && a.score < 999)
      .sort(
        (a, b) =>
          a.score - b.score ||
          a.author.localeCompare(b.author)
      )
      .slice(0, 3);

    const cleanQuery = authorQuery.replace(/\s+/g, " ").trim();
    const alreadySelected = authors.includes(cleanQuery);
    const alreadyKnown = knownAuthors.has(cleanQuery);

    if (
      cleanQuery.length >= MIN_LEN &&
      !alreadySelected &&
      !alreadyKnown
    ) {
      matches.push({
        id: "__new__",
        author: cleanQuery,
        score: 0,
      });
    }

    return matches;
  }, [authors, authorOptions, authorQuery, knownAuthors]);
  
  function addAuthor(author: string) {
    const clean = author.replace(/\s+/g, " ").trim();

    if (clean.length < MIN_LEN) return;
    if (clean.length > MAX_LEN) return;
    if (!AUTHOR_REGEX.test(clean)) return;
    if (authors.includes(clean)) return;
    if (authors.length >= 20) return;

    onChange([...authors, clean]);
    setSelectedSuggestion(0);
    setAuthorQuery("");
  }

  function removeAuthor(author: string) {
    onChange(authors.filter((a) => a !== author));
  }

  return (
    <div>
      <div className="text-sm text-slate-300 py-0.5">Author(s)</div>

      <div className="relative">
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 transition 
            focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/10">
          
          {/* Current author tags */}
          {authors.map((author) => {
            const isNew = !knownAuthors.has(author);

            return (
              <div
                key={author}
                className="flex items-center gap-0.5 rounded-full border border-slate-600 bg-slate-700/80 pl-3 pr-1 py-1 text-sm"
              >
                <span>{author}</span>

                {isNew && (
                  <span className="rounded-full bg-emerald-500/15 ml-1 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                    NEW
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => removeAuthor(author)}
                  className="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-600 hover:text-white cursor-pointer"
                >
                  x
                </button>
              </div>
            );
          })}

          {/* Input box */}
          <input
            value={authorQuery}
            disabled={authors.length >= 20}
            placeholder={authors.length >= 20 ? "Max authors reached!" : authors.length ? "Add another author..." : "Type an author..."}
            className="min-w-[180px] flex-1 bg-transparent outline-none placeholder:text-slate-500"
            onChange={(e) => {
              const val = e.target.value;
              if (val.length <= MAX_LEN && /^[a-zA-Z0-9 _.'-]*$/.test(val)) {
                setSelectedSuggestion(0)
                setAuthorQuery(val);
              }
            }}
            onKeyDown={(e) => {
              switch (e.key) {
                case "ArrowDown":
                  e.preventDefault();
                  setSelectedSuggestion((prev) => (prev + 1) % suggestions.length)
                  break;

                case "ArrowUp":
                  e.preventDefault();
                  setSelectedSuggestion((prev) => prev === 0 ? suggestions.length - 1 : Math.max(prev - 1, 0));
                  break;

                case "Enter":
                  e.preventDefault();
                  if (suggestions.length > 0) { addAuthor(suggestions[selectedSuggestion].author) }
                  break;

                case "Backspace":
                  if (authorQuery === "" && authors.length > 0) { 
                    removeAuthor(authors[authors.length - 1]) 
                  }
                  break;
              }
            }}
          />
        </div>

        {/* Suggested authors dropdown */}
        {authorQuery && suggestions.length > 0 && (
          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-2xl">
            {suggestions.map((a, i) => {
              const isCreate = a.id === "__new__";

              return (
                <div
                  key={a.author}
                  role="button"
                  tabIndex={0}
                  onClick={() => addAuthor(a.author)}
                  className={`w-full px-3 py-2 text-left text-sm transition cursor-pointer
                    ${i === selectedSuggestion ? "bg-emerald-600/40 text-emerald-100" : "hover:bg-slate-700/50"}`}
                >
                  {isCreate ? (
                    <>
                      {a.author} <span className="text-emerald-400">(New)</span>
                    </>
                  ) : (
                    a.author
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}
