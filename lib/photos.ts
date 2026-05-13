import { createClient } from "@/lib/supabase/server";

export type Photo = {
  id: string;
  src: string;
  caption: string | null;
  guest_name: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
};

const BUCKET = "birthday-photos";

export async function getPhotos(): Promise<Photo[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("photos")
      .select("id, storage_path, caption, guest_name, width, height, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error || !data) return [];

    const base = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, "");
    return data.map((row) => ({
      id: row.id,
      src: `${base}/storage/v1/object/public/${BUCKET}/${row.storage_path}`,
      caption: row.caption,
      guest_name: row.guest_name,
      width: row.width,
      height: row.height,
      created_at: row.created_at,
    }));
  } catch {
    return [];
  }
}

export function countDistinctGuests(photos: Photo[]) {
  const names = new Set<string>();
  for (const p of photos) {
    if (p.guest_name && p.guest_name.trim()) names.add(p.guest_name.trim().toLowerCase());
  }
  return names.size;
}
