import { SearchParams } from "nuqs/server";
import { loadSearchParams } from "./search-params";
import { redirect } from "next/navigation";
import { sendAnswerToServer } from "../actions";

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function ProcessPage({ searchParams }: PageProps) {
  const { unicode } = await loadSearchParams(searchParams);

  let apiResponse;
  try {
    apiResponse = await sendAnswerToServer(unicode);
  } catch (apiError) {
    console.error("[サーバー] APIリクエストに失敗しました:", apiError);
    redirect("/mobile/?error=api_failed");
  }

  console.log("[サーバー] 処理完了。メインページにリダイレクトします。");
  const isCorrect = apiResponse?.is_correct ?? false;
  const combo = apiResponse?.combo ?? 0;
  redirect(`/mobile/?result=${isCorrect}&combo=${combo}`);
}
