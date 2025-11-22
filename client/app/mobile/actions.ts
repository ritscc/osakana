"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function registerRanking(formData: FormData) {
  const name = formData.get("input") as string;
  if (!name) {
    throw new Error("Name is required");
  }

  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) {
    throw new Error("User ID cookie is missing");
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ranking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: name, user_id: userId }),
    });

    if (!res.ok) {
      console.error("Server responded with an error:", res.statusText);
      redirect("/mobile/?error=server_error");
    }
  } catch (error) {
    console.error("Fetch failed:", error);
  }

  console.log(`Posted Name to Server: ${name} for User ID: ${userId}`);
}

export async function sendAnswerToServer(unicode: string) {
  const cookieStore = await cookies();
  const userIDCookie = cookieStore.get("user_id");
  const questionIndexCookie = cookieStore.get("question_index");

  if (!userIDCookie || !questionIndexCookie) {
    console.error("[サーバー] Cookieが見つかりません。");
    redirect("/mobile/?error=cookie_missing");
  }

  const combinedData = {
    kanji_unicode: unicode,
    user_id: userIDCookie.value,
    question_index: questionIndexCookie.value,
  };
  console.log("SendData:", combinedData);

  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(combinedData),
  });
  if (!res.ok) {
    console.error("Server responded with an error:", res.statusText);
    redirect("/mobile/?error=server_error");
  }

  return await res.json();
}

export async function saveIndexToCookie(formData: FormData) {
  const number = formData.get("input") as string;

  if (!number) {
    throw new Error("Number is required");
  }

  const cookieStore = await cookies();
  cookieStore.set("question_index", number, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 120,
  });

  console.log(`Updated Index: ${number}`);
}
