import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wckpbtlxsfwukixxdytf.supabase.co";
const supabaseAnonKey = "sb_publishable_GXlbrUM_aSpjU2S8wfYFhQ_pp4Xmqtl";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);