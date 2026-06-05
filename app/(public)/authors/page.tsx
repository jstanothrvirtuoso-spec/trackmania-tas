
import { use } from "react";
import AuthorsPage from "./AuthorsPage"

export default function Authors({
  searchParams
}: {
  searchParams: Promise<{ author?: string }>
}) {

  const { author } = use(searchParams);

  return(
    <AuthorsPage initialAuthor={author} />
  )
}