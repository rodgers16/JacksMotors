"use client";

import * as React from "react";
import { X, Camera, AlertCircle, RotateCcw } from "lucide-react";
import { isValidVin, normalizeVin } from "@/lib/vin/validate";
import { cn } from "@/lib/cn";

type Props = {
  open: boolean;
  onClose: () => void;
  onResult: (vin: string) => void;
};

type Status = "loading" | "scanning" | "denied" | "unsupported" | "error";

const SCANNER_ID = "vin-scanner-camera";

export function VinScanner({ open, onClose, onResult }: Props) {
  const [status, setStatus] = React.useState<Status>("loading");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [lastSeen, setLastSeen] = React.useState<string | null>(null);
  const scannerRef = React.useRef<unknown>(null);
  const closingRef = React.useRef(false);

  // Lock body scroll while modal is open
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Esc to close
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Start / stop the camera scanner when open changes
  React.useEffect(() => {
    if (!open) return;
    closingRef.current = false;
    let active = true;

    (async () => {
      setStatus("loading");
      setErrorMsg(null);
      setLastSeen(null);

      // Dynamically import — keeps the ~60KB lib out of the main bundle
      let Html5QrcodeMod: typeof import("html5-qrcode");
      try {
        Html5QrcodeMod = await import("html5-qrcode");
      } catch (err) {
        if (!active) return;
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Failed to load scanner");
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (!active) return;
        setStatus("unsupported");
        return;
      }

      const { Html5Qrcode, Html5QrcodeSupportedFormats } = Html5QrcodeMod;

      const formats = [
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.DATA_MATRIX, // some modern VIN labels use Data Matrix
      ];

      let scanner: InstanceType<typeof Html5Qrcode>;
      try {
        scanner = new Html5Qrcode(SCANNER_ID, { formatsToSupport: formats, verbose: false });
        scannerRef.current = scanner;
      } catch (err) {
        if (!active) return;
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Could not initialize scanner");
        return;
      }

      try {
        await scanner.start(
          { facingMode: { ideal: "environment" } },
          {
            fps: 12,
            qrbox: (vw, vh) => {
              // VIN barcodes are wide & short — make the scan box a wide strip
              const w = Math.min(vw - 40, 520);
              const h = Math.min(vh - 240, 160);
              return { width: w, height: h };
            },
            aspectRatio: 16 / 9,
          },
          (decodedText) => {
            if (closingRef.current) return;
            const candidate = normalizeVin(decodedText);
            setLastSeen(candidate);
            if (isValidVin(candidate)) {
              closingRef.current = true;
              try { (navigator as Navigator & { vibrate?: (p: number) => void }).vibrate?.(50); } catch {}
              onResult(candidate);
              // Stop the camera before closing the modal
              scanner.stop().catch(() => {}).finally(() => {
                onClose();
              });
            }
          },
          // ignore per-frame "no code found" errors
          () => {}
        );
        if (active) setStatus("scanning");
      } catch (err) {
        if (!active) return;
        const msg = err instanceof Error ? err.message : String(err);
        if (/permission|denied|NotAllowed/i.test(msg)) setStatus("denied");
        else if (/NotFound|no camera/i.test(msg)) setStatus("unsupported");
        else {
          setStatus("error");
          setErrorMsg(msg);
        }
      }
    })();

    return () => {
      active = false;
      closingRef.current = true;
      const s = scannerRef.current as { stop?: () => Promise<void>; clear?: () => void } | null;
      if (s?.stop) {
        s.stop().catch(() => {}).then(() => s.clear?.());
      }
      scannerRef.current = null;
    };
  }, [open, onClose, onResult]);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="VIN scanner" className="fixed inset-0 z-[70] bg-black flex flex-col">
      <header className="flex items-center justify-between px-5 py-4 text-white">
        <div>
          <p className="cap-label text-white/60">Scan</p>
          <h2 className="font-display mt-1 text-xl">VIN</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close scanner"
          className="cap-label inline-flex items-center gap-2 text-white/80 hover:text-white"
        >
          <X size={14} aria-hidden /> Close
        </button>
      </header>

      <div className="relative flex-1 overflow-hidden">
        <div id={SCANNER_ID} className="absolute inset-0 [&>video]:!h-full [&>video]:!w-full [&>video]:!object-cover" />

        {/* Scanning frame overlay */}
        {status === "scanning" && (
          <div aria-hidden className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative h-[160px] w-[min(520px,calc(100vw-40px))]">
              {/* corners */}
              <span className="absolute -left-px -top-px h-6 w-6 border-l-2 border-t-2 border-white" />
              <span className="absolute -right-px -top-px h-6 w-6 border-r-2 border-t-2 border-white" />
              <span className="absolute -left-px -bottom-px h-6 w-6 border-l-2 border-b-2 border-white" />
              <span className="absolute -right-px -bottom-px h-6 w-6 border-r-2 border-b-2 border-white" />
              {/* moving sweep line */}
              <span className="absolute inset-x-2 top-1/2 h-px bg-white/70 animate-pulse" />
            </div>
          </div>
        )}

        {/* Status overlays */}
        {status !== "scanning" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black px-6 text-center text-white">
            <div className="max-w-md">
              {status === "loading" && (
                <>
                  <Camera size={28} className="mx-auto text-white/60 animate-pulse" aria-hidden />
                  <p className="cap-label mt-4 text-white/60">Starting camera…</p>
                </>
              )}
              {status === "denied" && (
                <>
                  <AlertCircle size={28} className="mx-auto text-white/80" aria-hidden />
                  <p className="font-display mt-4 text-2xl">Camera access blocked</p>
                  <p className="mt-3 text-white/70 leading-relaxed">
                    Allow camera access for this site in your browser settings, then tap retry.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus("loading")}
                    className="cap-label mt-6 inline-flex items-center gap-2 border border-white/40 px-5 py-2.5 hover:border-white"
                  >
                    <RotateCcw size={13} aria-hidden /> Retry
                  </button>
                </>
              )}
              {status === "unsupported" && (
                <>
                  <AlertCircle size={28} className="mx-auto text-white/80" aria-hidden />
                  <p className="font-display mt-4 text-2xl">No camera available</p>
                  <p className="mt-3 text-white/70 leading-relaxed">
                    This device or browser doesn't support camera access. Type the
                    VIN in manually instead.
                  </p>
                </>
              )}
              {status === "error" && (
                <>
                  <AlertCircle size={28} className="mx-auto text-destructive" aria-hidden />
                  <p className="font-display mt-4 text-2xl">Couldn't start scanner</p>
                  <p className="mt-3 text-white/70 leading-relaxed">{errorMsg ?? "Unknown error."}</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <footer className="px-5 py-4 text-white/80">
        {status === "scanning" ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="cap-label text-white/60">
              Point at the VIN barcode on the door jamb
            </p>
            {lastSeen && (
              <p className={cn("cap-label", isValidVin(lastSeen) ? "text-white" : "text-white/50")}>
                Read: {lastSeen}
              </p>
            )}
          </div>
        ) : (
          <p className="cap-label text-center text-white/40">Tap Close to enter the VIN manually</p>
        )}
      </footer>
    </div>
  );
}
