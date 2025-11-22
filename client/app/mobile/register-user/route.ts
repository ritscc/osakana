import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET() {
  const cookieStore = await cookies();
  
  // 既にuser_idクッキーが存在する場合は、ユーザー登録をスキップ
  const existingUserId = cookieStore.get("user_id");
  if (existingUserId?.value) {
    redirect("/mobile");
    return;
  }
  
  let user_id = null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      const data = await res.json();
      user_id = data.user_id;
    } else {
      console.error(`API Error: ${res.status}`);
    }
  } catch (error) {
    console.error("Fetch failed:", error);
  }

  if (!user_id) {
    console.error("Failed to retrieve user_id from API");
  }

  cookieStore.set("user_id", user_id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24,
  });

  cookieStore.set("question_index", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 120,
  });

  if (!cookieStore.get("user_id")) {
    console.error("Failed to set user_id cookie");
    throw new Error("Failed to set cookie");
  }

  console.log(`Registered User: ${user_id}`);
  redirect("/mobile");
}
