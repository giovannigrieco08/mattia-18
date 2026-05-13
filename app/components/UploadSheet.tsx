"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Camera, ImageIcon, XIcon } from "./icons";
import { CheckCircleAnimated } from "./CheckCircleAnimated";
import { Toast, type ToastMessage } from "./Toast";
import { uploadPhotos } from "@/app/actions/upload";

type Step = "pick" | "form" | "uploading" | "success";

const MAX_BYTES = 15 * 1024 * 1024;
const ALLOWED = /\.(jpe?g|png|webp|heic|heif)$/i;

export function UploadSheet() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("pick");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [caption, setCaption] = useState("");
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setOpen(true), 20);
    document.body.classList.add("sheet-open");
    return () => {
      clearTimeout(id);
      document.body.classList.remove("sheet-open");
    };
  }, []);

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    setOpen(false);
    setTimeout(() => {
      previews.forEach((url) => URL.revokeObjectURL(url));
      router.push("/", { scroll: false });
    }, 320);
  };

  const onFilesPicked = (incoming: FileList | null) => {
    if (!incoming) return;
    const accepted: File[] = [];
    let rejectedLarge = 0;
    let rejectedType = 0;
    for (const f of Array.from(incoming)) {
      const okType = ALLOWED.test(f.name) || /^image\//.test(f.type);
      if (!okType) {
        rejectedType++;
        continue;
      }
      if (f.size > MAX_BYTES) {
        rejectedLarge++;
        continue;
      }
      accepted.push(f);
    }
    if (rejectedLarge) {
      setToast({
        title: "Foto troppo grande.",
        body: "Massimo 15MB. Riprova con un'immagine più piccola.",
      });
    } else if (rejectedType) {
      setToast({ title: "Formato non supportato.", body: "Usa JPG, PNG o HEIC." });
    }
    if (accepted.length === 0) return;

    const newPreviews = accepted.map((f) => URL.createObjectURL(f));
    setFiles((prev) => [...prev, ...accepted]);
    setPreviews((prev) => [...prev, ...newPreviews]);
    setStep("form");
  };

  const removeFile = (i: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => {
      const url = prev[i];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const submit = () => {
    if (files.length === 0) return;
    setStep("uploading");
    startTransition(async () => {
      try {
        const fd = new FormData();
        for (const f of files) fd.append("photos", f);
        if (name.trim()) fd.append("guest_name", name.trim());
        if (caption.trim()) fd.append("caption", caption.trim());
        const result = await uploadPhotos(fd);
        if (result.ok && result.uploaded > 0) {
          setStep("success");
        } else {
          const first = result.errors[0];
          setToast({
            title: first?.reason || "Caricamento fallito.",
            body: "Riprova fra un istante.",
          });
          setStep("form");
        }
      } catch {
        // Server action threw (function timeout, network error, etc.) — do not
        // leave the user stuck on the spinner.
        setToast({
          title: "Caricamento fallito.",
          body: "La rete o il server hanno avuto un problema. Riprova.",
        });
        setStep("form");
      }
    });
  };

  const resetForMore = () => {
    previews.forEach((url) => URL.revokeObjectURL(url));
    setFiles([]);
    setPreviews([]);
    setName("");
    setCaption("");
    setStep("pick");
  };

  const sheetMaxHeight = step === "form" ? "90%" : step === "success" ? "60%" : "75%";

  return (
    <>
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300 ease-out"
        style={{ background: "rgba(28,20,16,0.4)", opacity: open ? 1 : 0 }}
        onClick={close}
      />
      <div
        className="fixed z-50 paper-card-strong px-5 pt-3 pb-8 flex flex-col"
        style={{
          bottom: 0,
          left: 0,
          right: 0,
          borderTopLeftRadius: "2rem",
          borderTopRightRadius: "2rem",
          maxHeight: sheetMaxHeight,
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div className="flex justify-center mb-4 shrink-0">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: "var(--color-line)" }}
          />
        </div>

        <AnimatePresence mode="wait">
          {step === "pick" && (
            <motion.div
              key="pick"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col"
            >
              <div className="flex items-center justify-between mb-6 shrink-0">
                <div
                  className="italic tracking-tight"
                  style={{
                    fontSize: 26,
                    color: "var(--color-ink)",
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  Carica le foto.
                </div>
                <button
                  onClick={close}
                  className="w-11 h-11 flex items-center justify-center"
                  style={{ color: "var(--color-ink-soft)" }}
                  aria-label="Chiudi"
                >
                  <XIcon size={24} />
                </button>
              </div>

              <button
                onClick={() => galleryInputRef.current?.click()}
                className="paper-card rounded-2xl px-5 py-10 flex flex-col items-center justify-center text-center mb-4 active:scale-[0.99] transition-transform"
                style={{ border: "2px dashed rgba(122,30,43,0.30)" }}
              >
                <Camera size={44} className="mb-3" style={{ color: "var(--color-wine)" }} />
                <div
                  className="text-[17px] italic mb-1"
                  style={{ color: "var(--color-ink)", fontFamily: "var(--font-heading)" }}
                >
                  Tocca per scegliere
                </div>
                <div className="text-[12px]" style={{ color: "var(--color-ink-soft)" }}>
                  JPG, PNG, HEIC · max 15MB
                </div>
              </button>

              <div className="grid grid-cols-2 gap-2.5 mb-3">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="paper-card rounded-xl px-4 py-3.5 flex items-center justify-center gap-2 text-[13px] font-medium active:scale-95 transition-transform"
                  style={{ color: "var(--color-ink)" }}
                >
                  <Camera size={18} />
                  <span>Fotocamera</span>
                </button>
                <button
                  onClick={() => galleryInputRef.current?.click()}
                  className="paper-card rounded-xl px-4 py-3.5 flex items-center justify-center gap-2 text-[13px] font-medium active:scale-95 transition-transform"
                  style={{ color: "var(--color-ink)" }}
                >
                  <ImageIcon size={18} />
                  <span>Galleria</span>
                </button>
              </div>

              <div
                className="text-[11px] text-center mt-2 leading-snug"
                style={{ color: "var(--color-ink-soft)" }}
              >
                Le foto saranno visibili a tutti gli ospiti del compleanno.
              </div>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => onFilesPicked(e.target.files)}
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/*"
                multiple
                className="hidden"
                onChange={(e) => onFilesPicked(e.target.files)}
              />
            </motion.div>
          )}

          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col min-h-0 flex-1"
            >
              <div className="flex flex-col overflow-y-auto no-scrollbar -mx-5 px-5 flex-1 min-h-0">
                <div className="flex items-center justify-between mb-6 shrink-0">
                  <div
                    className="italic tracking-tight"
                    style={{
                      fontSize: 26,
                      color: "var(--color-ink)",
                      fontFamily: "var(--font-heading)",
                    }}
                  >
                    {files.length} {files.length === 1 ? "foto pronta" : "foto pronte"}.
                  </div>
                  <button
                    onClick={close}
                    className="w-11 h-11 flex items-center justify-center"
                    style={{ color: "var(--color-ink-soft)" }}
                    aria-label="Chiudi"
                  >
                    <XIcon size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-5">
                  {previews.map((url, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-lg overflow-hidden paper-card"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} className="w-full h-full object-cover" alt="" />
                      <button
                        onClick={() => removeFile(i)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-[14px] leading-none"
                        style={{
                          background: "rgba(28,20,16,0.7)",
                          color: "var(--color-paper)",
                        }}
                        aria-label="Rimuovi"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => galleryInputRef.current?.click()}
                  className="text-[13px] font-medium mb-5 active:opacity-70 text-left"
                  style={{ color: "var(--color-wine)" }}
                >
                  + Aggiungi altre
                </button>

                <div className="h-px mb-5" style={{ background: "var(--color-line)" }} />

                <div className="space-y-5 mb-4">
                  <div>
                    <label
                      className="text-[11px] uppercase mb-2 block"
                      style={{ letterSpacing: "0.15em", color: "var(--color-ink-soft)" }}
                    >
                      Il tuo nome
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value.slice(0, 80))}
                      placeholder="(opzionale)"
                      className="w-full bg-transparent border-0 border-b py-2 text-[16px] focus:outline-none"
                      style={{
                        borderBottomWidth: 1,
                        borderColor: "var(--color-line)",
                        color: "var(--color-ink)",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      className="text-[11px] uppercase mb-2 block"
                      style={{ letterSpacing: "0.15em", color: "var(--color-ink-soft)" }}
                    >
                      Messaggio per Mattia
                    </label>
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value.slice(0, 280))}
                      rows={3}
                      placeholder="Scrivi due righe..."
                      className="w-full bg-transparent border-0 border-b py-2 text-[16px] resize-none focus:outline-none"
                      style={{
                        borderBottomWidth: 1,
                        borderColor: "var(--color-line)",
                        color: "var(--color-ink)",
                      }}
                    />
                    <div
                      className="text-[11px] tabular-nums text-right mt-1"
                      style={{ color: "var(--color-ink-soft)" }}
                    >
                      {caption.length}/280
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="sticky bottom-0 -mx-5 px-5 pt-4 pb-2 shrink-0"
                style={{ background: "var(--color-paper-soft)" }}
              >
                <button
                  onClick={submit}
                  disabled={isPending || files.length === 0}
                  className="w-full rounded-full py-4 text-[15px] font-medium active:scale-[0.98] transition-transform disabled:opacity-50"
                  style={{
                    background: "var(--color-wine)",
                    color: "var(--color-paper)",
                  }}
                >
                  {isPending
                    ? "Caricamento..."
                    : `Carica ${files.length} ${files.length === 1 ? "foto" : "foto"}`}
                </button>
              </div>
            </motion.div>
          )}

          {step === "uploading" && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center text-center pt-12 pb-16 px-8"
            >
              <div
                className="w-12 h-12 rounded-full mb-6"
                style={{
                  border: "3px solid rgba(122,30,43,0.18)",
                  borderTopColor: "var(--color-wine)",
                  animation: "spin 1s linear infinite",
                }}
              />
              <div
                className="italic leading-none mb-3"
                style={{
                  fontSize: 32,
                  letterSpacing: "-0.5px",
                  color: "var(--color-ink)",
                  fontFamily: "var(--font-heading)",
                }}
              >
                Caricamento...
              </div>
              <div
                className="text-[14px]"
                style={{ color: "var(--color-ink-soft)", maxWidth: "26ch" }}
              >
                Un momento, stiamo aggiungendo le tue foto alla galleria.
              </div>
              <style jsx>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col flex-1"
            >
              <div className="flex flex-col items-center justify-center text-center pt-8 pb-12 px-8 flex-1">
                <div style={{ color: "var(--color-wine)" }} className="mb-6">
                  <CheckCircleAnimated size={72} />
                </div>
                <div
                  className="italic leading-none mb-3"
                  style={{
                    fontSize: 40,
                    letterSpacing: "-1px",
                    color: "var(--color-ink)",
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  Grazie.
                </div>
                <div
                  className="text-[15px] leading-snug"
                  style={{ color: "var(--color-ink-soft)", maxWidth: "24ch" }}
                >
                  Le tue foto sono in galleria. Buon compleanno Mattia.
                </div>
              </div>
              <div className="mt-auto px-5 pb-2 space-y-2 shrink-0">
                <button
                  onClick={close}
                  className="w-full rounded-full py-4 text-[15px] font-medium"
                  style={{ background: "var(--color-wine)", color: "var(--color-paper)" }}
                >
                  Torna alla galleria
                </button>
                <div className="text-center">
                  <button
                    onClick={resetForMore}
                    className="text-[13px] underline underline-offset-4"
                    style={{ color: "var(--color-ink-soft)" }}
                  >
                    Carica altre foto
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Toast message={toast} onClose={() => setToast(null)} />
    </>
  );
}
