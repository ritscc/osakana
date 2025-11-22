import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { SearchParams } from "nuqs/server";
import { loadSearchParams } from "./request/search-params";
import { Keypad } from "./_components/Keypad";
import { Combo } from "./_components/combo";

type PageProps = {
  searchParams: Promise<SearchParams>;
};

async function StatusMessage({ searchParams }: PageProps) {
  const { error } = await loadSearchParams(searchParams);
  if (error) {
    return (
      <p style={{ color: "red", border: "1px solid red", padding: "1rem" }}>
        {error}
      </p>
    );
  }
  return null;
}
export default async function Mobile({ searchParams }: PageProps) {
  const { combo } = await loadSearchParams(searchParams);

  const cookieStore = await cookies();
  const userIDCookie = cookieStore.get("user_id");
  if (!userIDCookie) {
    redirect("/mobile/register-user");
  }

  return (
    <div>
      <StatusMessage searchParams={searchParams} />
      <Combo combo={combo} />
      <Keypad />
    </div>
  );
}
