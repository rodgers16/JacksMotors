"use client";

import * as React from "react";
import Image from "next/image";
import { Plus, X, GripVertical } from "lucide-react";
import imageCompression from "browser-image-compression";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/cn";

export type Photo = {
  id: string;
  url: string;
  blur?: string | null;
  width: number;
  height: number;
  position: number;
};

type Props = {
  vehicleId: string;
  initialPhotos: Photo[];
};

export function PhotoUploader({ vehicleId, initialPhotos }: Props) {
  const [photos, setPhotos] = React.useState<Photo[]>(initialPhotos);
  const [pending, setPending] = React.useState<{ id: string; previewUrl: string; status: "uploading" | "error"; error?: string }[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  const handleFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files);
    for (const file of arr) {
      const tempId = crypto.randomUUID();
      const previewUrl = URL.createObjectURL(file);
      setPending((p) => [...p, { id: tempId, previewUrl, status: "uploading" }]);
      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1.5,
          maxWidthOrHeight: 2400,
          useWebWorker: true,
          initialQuality: 0.85,
        });
        const fd = new FormData();
        fd.append("vehicleId", vehicleId);
        fd.append("file", compressed, file.name);
        const res = await fetch("/api/admin/photos", { method: "POST", body: fd });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error ?? `Upload failed (${res.status})`);
        }
        const { photo } = (await res.json()) as { photo: Photo };
        setPhotos((cur) => [...cur, photo]);
        setPending((p) => p.filter((x) => x.id !== tempId));
        URL.revokeObjectURL(previewUrl);
      } catch (err) {
        setPending((p) =>
          p.map((x) =>
            x.id === tempId
              ? { ...x, status: "error", error: err instanceof Error ? err.message : "Upload failed" }
              : x
          )
        );
      }
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const removePhoto = async (id: string) => {
    const prev = photos;
    setPhotos((cur) => cur.filter((p) => p.id !== id));
    const res = await fetch(`/api/admin/photos?id=${id}`, { method: "DELETE" });
    if (!res.ok) setPhotos(prev); // rollback
  };

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = photos.findIndex((p) => p.id === active.id);
    const newIdx = photos.findIndex((p) => p.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const next = arrayMove(photos, oldIdx, newIdx);
    setPhotos(next);
    await fetch("/api/admin/photos/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleId, photoIds: next.map((p) => p.id) }),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="cap-label text-muted-foreground/60">
          Photos {photos.length > 0 && <span className="text-foreground">· {photos.length}</span>}
        </span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="cap-label inline-flex items-center gap-2 border border-foreground/30 px-4 py-2 hover:border-foreground transition-colors"
        >
          <Plus size={13} aria-hidden /> Add photos
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((p, i) => (
              <SortablePhotoTile
                key={p.id}
                photo={p}
                index={i}
                onRemove={() => removePhoto(p.id)}
              />
            ))}
            {pending.map((p) => (
              <li
                key={p.id}
                className={cn(
                  "relative aspect-[4/3] overflow-hidden border",
                  p.status === "error" ? "border-destructive" : "border-foreground/30"
                )}
              >
                <img src={p.previewUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
                <div className="absolute inset-0 flex items-center justify-center bg-background/40">
                  <p className="cap-label text-foreground">
                    {p.status === "error" ? "Failed" : "Uploading…"}
                  </p>
                </div>
                {p.status === "error" && (
                  <p className="absolute inset-x-2 bottom-2 cap-label text-destructive truncate">{p.error}</p>
                )}
              </li>
            ))}
            {photos.length === 0 && pending.length === 0 && (
              <li className="col-span-full">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-3 border border-dashed border-foreground/30 py-16 hover:border-foreground transition-colors"
                >
                  <Plus size={20} aria-hidden className="text-muted-foreground" />
                  <span className="cap-label text-muted-foreground">Tap to add photos</span>
                </button>
              </li>
            )}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortablePhotoTile({
  photo,
  index,
  onRemove,
}: {
  photo: Photo;
  index: number;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative aspect-[4/3] overflow-hidden border border-[hsl(var(--border))] bg-card touch-none",
        isDragging && "opacity-80 ring-1 ring-foreground"
      )}
    >
      <Image
        src={photo.url}
        alt=""
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover"
        placeholder={photo.blur ? "blur" : "empty"}
        blurDataURL={photo.blur ?? undefined}
      />
      {index === 0 && (
        <span className="absolute left-2 top-2 cap-label bg-foreground text-background px-2 py-1">Cover</span>
      )}
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center bg-background/80 backdrop-blur-sm cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={14} aria-hidden />
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove photo"
        className="absolute right-2 bottom-2 inline-flex h-8 w-8 items-center justify-center bg-background/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground transition-colors"
      >
        <X size={14} aria-hidden />
      </button>
    </li>
  );
}
