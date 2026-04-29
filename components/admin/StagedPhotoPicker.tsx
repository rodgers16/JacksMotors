"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";

export type StagedPhoto = { id: string; file: File; previewUrl: string };

type Props = {
  photos: StagedPhoto[];
  onChange: (next: StagedPhoto[]) => void;
};

export function StagedPhotoPicker({ photos, onChange }: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).slice(0, Math.max(0, 20 - photos.length));
    const next: StagedPhoto[] = arr.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    onChange([...photos, ...next]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (id: string) => {
    const target = photos.find((p) => p.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onChange(photos.filter((p) => p.id !== id));
  };

  React.useEffect(() => {
    return () => {
      for (const p of photos) URL.revokeObjectURL(p.previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">
          {photos.length === 0 ? "No photos staged" : (
            <>
              <span className="font-medium text-foreground">{photos.length}</span>
              {photos.length === 1 ? " photo" : " photos"} ready to upload after save
            </>
          )}
        </span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={photos.length >= 20}
          className="inline-flex items-center gap-1.5 rounded-lg bg-secondary text-foreground px-3 py-2 text-sm font-medium hover:bg-secondary/70 transition-colors disabled:opacity-50"
        >
          <Plus size={14} aria-hidden /> Add photos
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {photos.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[hsl(var(--border))] py-12 hover:border-accent hover:bg-accent/5 transition-colors"
        >
          <Plus size={20} aria-hidden className="text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Tap to add photos</span>
          <span className="text-xs text-muted-foreground">JPEG, PNG · up to 20</span>
        </button>
      ) : (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((p, i) => (
            <li
              key={p.id}
              className="relative aspect-[4/3] overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-secondary"
            >
              <img src={p.previewUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-foreground text-background px-2 py-0.5 text-xs font-medium">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(p.id)}
                aria-label="Remove photo"
                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <X size={14} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
