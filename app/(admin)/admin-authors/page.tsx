"use client";

import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { AuthorInfo } from "@/utils/typing";
import { useAlert } from "@/components/providers/AlertProvider";
import { useConfirm } from "@/components/providers/ConfirmProvider";
import { useAuthors } from "@/lib/Authors";
import { useTasRecords } from "@/lib/TasRecords";
import AuthorSelector from "@/components/AuthorSelector";
import { DropSelect } from "@/components/DropSelect";

const supabase = createClient();

export default function AdminAuthors() {

  const { showAlert } = useAlert();
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [existingAuthor, setExistingAuthor] = useState<AuthorInfo>({id: "", author: "", profile_id: ""});
  const [newAuthors, setNewAuthors] = useState<string[]>([]);
  const [editAuthorOld, setEditAuthorOld] = useState<AuthorInfo>({id: "", author: "", profile_id: ""});
  const [editAuthorNew, setEditAuthorNew] = useState<string[]>([]);
  const { data: tasRecords = [] } = useTasRecords();
  const { data: authorData = [] } = useAuthors();
  
  const { authorOptions, allAuthors, authorSet } = useMemo(() => {
    const authorCount: Record<string, { data: AuthorInfo; count: number }> = {};

    for (const a of authorData) {
      authorCount[a.author] = { data: a, count: 0 };
    }

    for (const tas of tasRecords) {
      for (const author of tas.authors) {
        const entry = authorCount[author];
        if (entry) entry.count++;
      }
    }

    return {
      authorOptions: Object.fromEntries(Object.entries(authorCount).filter(([, info]) => info.count < 1)),
      allAuthors: authorCount,
      authorSet: new Set(authorData.map((a) => a.author))
    }
  }, [tasRecords, authorData]);

  async function editAuthor() {

    if (!editAuthorOld.author || editAuthorNew.length < 1) return;

    if (authorSet.has(editAuthorNew[0])) {
      showAlert("You cannot use an author name that already exists!");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("authors")
        .update({ author: editAuthorNew[0] })
        .eq("id", editAuthorOld.id);

      if (error) {
        showAlert(error.message);
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ["authors"],
      });

      showAlert("Author updated!");
    } finally {
      setLoading(false);
    }
  }
  
  async function addAuthor() {

    setLoading(true);

    try {
      const existingAuthors = authorData.map((a) => a.author);
      const newAuthors1 = newAuthors.filter(
        (name) => !existingAuthors.includes(name)
      );

      if (newAuthors1.length === 0) {
        showAlert("There are no new authors to add!");
        return;
      }

      const { error: newAuthorsError } = await supabase
        .from("authors")
        .insert(newAuthors1.map((author) => ({ author })));

      if (newAuthorsError) {
        showAlert(newAuthorsError.message);
        return;
      }
      
      await queryClient.invalidateQueries({
        queryKey: ["authors"],
      });

      showAlert("Success!");
    } finally {
      setLoading(false);
    }

  }
  
  async function deleteAuthor() {

    setLoading(true);

    try {
      if (!existingAuthor.id) return;

      const confirmed = await confirm(`
        Are you sure you want to delete ${existingAuthor.author}?
        This cannot be undone!`
      );

      if (!confirmed) return;

      const { error } = await supabase
        .from("authors")
        .delete()
        .eq("id", existingAuthor.id)

      if (error) {
        showAlert(error.message);
        return;
      }
      
      await queryClient.invalidateQueries({
        queryKey: ["authors"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["tasRecords"],
      });

      showAlert("Author successfully deleted!")

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex justify-center items-start min-h-screen px-6 pt-20 pb-10 text-white bg-slate-950">
      <div className="grid gap-6 flex items-start max-w-md">

        {/* Edit Author */}
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-xl">
          
          <div className="mb-3 border-b border-slate-700 pb-4">
            <div className="flex flex-col items-start justify-between">
              <h1 className="text-2xl font-semibold">
                Change Author Name
              </h1>
              
              <div className="mt-1 text-sm text-slate-400">
                Select an author below to change their name on all TASes (this will not affect RTA).
                Type the new name into the Author(s) box below it (check the name does not exist, they must be unique!).
              </div>
            </div>
          </div>

          <div className="space-y-3">

            {/* EXISTING AUTHOR */}
            <div className="mb-3 flex flex-row gap-2">
              <DropSelect
                initialValue={editAuthorOld.author}
                options={Object.entries(allAuthors).map(([author]) => ({
                  value: author,
                  label: author,
                }))}
                onChange={(value) => value ? setEditAuthorOld(allAuthors[value].data) : setEditAuthorOld({id: "", author: "", profile_id: ""})}
                defaultOption={{ value: "", label: "Select Author" }}
              />
            </div>

            {/* NEW AUTHOR */}
            <AuthorSelector 
              authors={editAuthorNew}
              maxAuthors={1}
              onChange={(next) => setEditAuthorNew(next)}
            />

            {/* ADD */}
            <div className="py-2">
              <button
                onClick={editAuthor}
                disabled={loading || editAuthorNew.length < 1 || !editAuthorOld.author}
                className="w-full rounded-md bg-emerald-600 px-4 py-2 font-medium hover:bg-emerald-500 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Updating..." : "Update author name"}
              </button>
            </div>
          </div>
        </div>

        {/* Add Author */}
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-xl">
          
          <div className="mb-3 border-b border-slate-700 pb-4">
            <div className="flex flex-col items-start justify-between">
              <h1 className="text-2xl font-semibold">
                Add New Author(s)
              </h1>
              
              <div className="mt-1 text-sm text-slate-400">
                You can manually add a new author. However, this should not be necessary since 
                new authors will be automatically added when you create their TAS.
              </div>
            </div>
          </div>

          <div className="space-y-3">

            {/* NEW AUTHOR */}
            <AuthorSelector 
              authors={newAuthors} 
              onChange={(next) => setNewAuthors(next)}
            />

            {/* ADD */}
            <div className="py-2">
              <button
                onClick={addAuthor}
                disabled={loading || newAuthors.length < 1}
                className="w-full rounded-md bg-emerald-600 px-4 py-2 font-medium hover:bg-emerald-500 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>

        {/* Remove Author */}
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-xl">
          
          <div className="mb-3 border-b border-slate-700 pb-4">
            <div className="flex flex-col items-start">
              <h1 className="text-2xl font-semibold">
                Remove Existing Author
              </h1>
              
              <div className="mt-1 text-sm text-slate-400">
                You should NOT delete an author with existing TASes.
                You should only use this if you created a new author by mistake.
              </div>
            </div>
          </div>

          <div className="space-y-3">

            {/* EXISTING AUTHOR */}
            <div className="mb-3 flex flex-row gap-2">
              <DropSelect
                initialValue={existingAuthor.author}
                options={Object.entries(authorOptions).map(([author]) => ({
                  value: author,
                  label: author,
                }))}
                onChange={(value) => value ? setExistingAuthor(authorOptions[value].data) : setExistingAuthor({id: "", author: "", profile_id: ""})}
                defaultOption={{ value: "", label: "Select Author" }}
              />
            </div>

            {/* DELETE */}
            <div className="py-2">
              <button
                onClick={deleteAuthor}
                disabled={loading || !existingAuthor.author}
                className="w-full rounded-md bg-red-800 px-4 py-2 font-medium hover:bg-red-700 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>

      </div>
      
      {loading && (
        <div className="fixed inset-0 z-[9999] cursor-wait" />
      )}
    </div>
  );
}
