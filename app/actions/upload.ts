"use server";

import "server-only";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "birthday-photos";
const MAX_BYTES = 15 * 1024 * 1024; // 15MB
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/pjpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export type UploadResult = {
  ok: boolean;
  uploaded: number;
  errors: { file: string; reason: string }[];
};

function todayPrefix() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function maybeConvertHeic(buf: Buffer, mime: string, name: string): Promise<Buffer> {
  if (mime === "image/heic" || mime === "image/heif" || /\.(heic|heif)$/i.test(name)) {
    const heicConvert = (await import("heic-convert")).default;
    const out = await heicConvert({
      buffer: buf as unknown as ArrayBufferLike,
      format: "JPEG",
      quality: 0.9,
    });
    return Buffer.from(out as ArrayBuffer);
  }
  return buf;
}

export async function uploadPhotos(formData: FormData): Promise<UploadResult> {
  const files = formData.getAll("photos").filter((f): f is File => f instanceof File);
  const guestName = String(formData.get("guest_name") || "").slice(0, 80).trim() || null;
  const caption = String(formData.get("caption") || "").slice(0, 280).trim() || null;

  if (files.length === 0) {
    return { ok: false, uploaded: 0, errors: [{ file: "-", reason: "Nessuna foto selezionata." }] };
  }

  const supabase = createAdminClient();
  const errors: { file: string; reason: string }[] = [];
  let uploaded = 0;
  const prefix = todayPrefix();

  for (const file of files) {
    try {
      if (file.size > MAX_BYTES) {
        errors.push({ file: file.name, reason: "Foto troppo grande. Massimo 15MB." });
        continue;
      }
      const mime = file.type || "application/octet-stream";
      const isHeic =
        mime === "image/heic" || mime === "image/heif" || /\.(heic|heif)$/i.test(file.name);
      if (!ALLOWED_MIME.has(mime) && !isHeic) {
        errors.push({ file: file.name, reason: "Formato non supportato." });
        continue;
      }
      const raw = Buffer.from(await file.arrayBuffer());
      const decoded = await maybeConvertHeic(raw, mime, file.name);
      const processed = await sharp(decoded)
        .rotate()
        .resize(2400, 2400, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer();
      const meta = await sharp(processed).metadata();

      const id = randomUUID();
      const storagePath = `${prefix}/${id}.jpg`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, processed, {
          contentType: "image/jpeg",
          upsert: false,
          cacheControl: "31536000",
        });
      if (upErr) {
        errors.push({ file: file.name, reason: "Upload fallito. Riprova." });
        continue;
      }

      const { error: insErr } = await supabase.from("photos").insert({
        storage_path: storagePath,
        caption,
        guest_name: guestName,
        width: meta.width ?? null,
        height: meta.height ?? null,
        bytes: processed.byteLength,
      });
      if (insErr) {
        errors.push({ file: file.name, reason: "Salvataggio fallito." });
        continue;
      }
      uploaded += 1;
    } catch (err) {
      const reason =
        err instanceof Error && /heic|heif/i.test(err.message)
          ? "HEIC non leggibile. Esporta come JPEG e riprova."
          : "Errore inatteso durante il caricamento.";
      errors.push({ file: file.name, reason });
    }
  }

  if (uploaded > 0) revalidatePath("/");
  return { ok: uploaded > 0, uploaded, errors };
}
