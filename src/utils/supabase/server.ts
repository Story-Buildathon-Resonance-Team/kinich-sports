import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();


  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jtticmjpfpkfjeqhifts.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0dGljbWpwZnBrZmplcWhpZnRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NDc0ODksImV4cCI6MjA3ODUyMzQ4OX0.4th3JE9sXib-RpzeDm40LJdNOce6oFEi24g1dp0WE4M";
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
