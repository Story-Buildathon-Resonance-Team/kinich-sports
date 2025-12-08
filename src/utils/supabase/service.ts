import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client with secret key (sb_secret_...).
 * WARNING: Only use this in server-side API routes.
 * Secret key bypasses ALL RLS policies and storage policies.
 *
 * Security: Returns HTTP 401 if accidentally used in browser.
 * Recommended over service_role key per Supabase docs.
 */
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Support both variable names for the service role key
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Missing Supabase URL: NEXT_PUBLIC_SUPABASE_URL"
    );
  }

  if (!supabaseSecretKey) {
    throw new Error(
      "Missing Supabase Service Key: SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createSupabaseClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
