
import { use } from "react";
import AuthorsPage from "./AuthorsPage"
import { KEY_AUTHORS } from "@/utils/constants";

export default function Authors({
  searchParams
}: {
  searchParams: Promise<{ author?: string }>
}) {

  const { author } = use(searchParams);
  const initialAuthor = author ?? KEY_AUTHORS[Math.floor(Math.random() * KEY_AUTHORS.length)]

  return(
    <AuthorsPage initialAuthor={initialAuthor} />
  )
}