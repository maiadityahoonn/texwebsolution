"use client";

import { useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

export default function ImageBlockRenderer({ block, onUpdate }) {
  const [isDragOver, setIsDragOver] = useState(false);

  function handleFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const url = evt.target?.result;
        if (typeof url === "string") {
          onUpdate({ imageUrl: url, body: file.name });
        }
      };
      reader.readAsDataURL(file);
    }
  }

  function handleFileInput(e) {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const url = evt.target?.result;
        if (typeof url === "string") {
          onUpdate({ imageUrl: url, body: file.name });
        }
      };
      reader.readAsDataURL(file);
    }
  }

  return (
    <div
      className="space-y-1 mx-auto"
      style={{
        width: block.width ? `${block.width}px` : "100%",
        height: block.height ? `${block.height}px` : "auto",
      }}
    >
      {block.imageUrl ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleFileDrop}
          style={{
            width: "100%",
            height: block.height ? `${block.height}px` : "auto",
          }}
          className={`relative group/img rounded-xl overflow-hidden border transition flex flex-col items-center justify-center ${
            isDragOver ? "border-orange-500 ring-2 ring-orange-400 bg-orange-50/20" : "border-gray-200"
          }`}
        >
          <img
            src={block.imageUrl}
            alt={block.body || "Document image"}
            style={{
              width: "100%",
              height: block.height ? "100%" : "auto",
              objectFit: "contain",
            }}
          />
          {/* Replace image overlay */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover/img:opacity-100 transition print:hidden">
            <label className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white cursor-pointer shadow-md text-[10px] font-bold flex items-center gap-1">
              <Upload className="w-3 h-3" />
              <span>Replace</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
            </label>
            <button
              type="button"
              onClick={() => onUpdate({ imageUrl: "" })}
              className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-700 text-white cursor-pointer shadow-md"
              title="Remove image"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <input
            type="text"
            value={block.body || ""}
            onChange={(e) => onUpdate({ body: e.target.value })}
            placeholder="Caption / description..."
            className="w-full text-center text-xs text-gray-500 bg-white/80 dark:bg-slate-900/80 py-1 outline-hidden shrink-0"
          />
        </div>
      ) : (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleFileDrop}
          style={{
            width: "100%",
            height: block.height ? `${block.height}px` : "140px",
          }}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition ${
            isDragOver
              ? "border-orange-500 bg-orange-50/50 ring-2 ring-orange-400"
              : "border-gray-300 dark:border-slate-700 bg-gray-50/50 hover:bg-orange-50/30"
          }`}
        >
          <div className="h-9 w-9 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center mb-1.5">
            <ImageIcon className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-gray-700 dark:text-neutral-200">
            Drag & drop image here, or click to browse
          </span>
          <span className="text-[10px] text-gray-400 mt-0.5">Supports PNG, JPG, WebP, SVG</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
        </label>
      )}
    </div>
  );
}
