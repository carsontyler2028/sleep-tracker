import { supabase } from "./lib/supabase";

export async function testSupabase() {
  const { data, error } =
    await supabase.auth.getSession();

  console.log("Supabase test:", {
    data,
    error,
  });
}