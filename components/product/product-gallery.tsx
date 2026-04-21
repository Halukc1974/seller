"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const safeImages = images.length > 0 ? images : ["/placeholder-product.png"];
  const total = safeImages.length;

  const prevImage = useCallback((inLightbox = false) => {
    if (inLightbox) setLightboxIndex((i) => (i - 1 + total) % total);
    else setActiveIndex((i) => (i - 1 + total) % total);
  }, [total]);

  const nextImage = useCallback((inLightbox = false) => {
    if (inLightbox) setLightboxIndex((i) => (i + 1) % total);
    else setActiveIndex((i) => (i + 1) % total);
  }, [total]);

  function openLightbox() {
    setLightboxIndex(activeIndex);
    setLightboxOpen(true);
  }

  function closeLightbox() {
    setLightboxOpen(false);
  }

  // Escape key handler
  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevImage(true);
      if (e.key === "ArrowRight") nextImage(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, prevImage, nextImage]);

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Main image */}
        <div
          className="relative aspect-[4/3] overflow-hidden rounded-md border border-border bg-muted cursor-zoom-in"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={openLightbox}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Image
                src={safeImages[activeIndex]}
                alt={`${title} — image ${activeIndex + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={activeIndex === 0}
              />
            </motion.div>
          </AnimatePresence>

          {/* Zoom hint */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <ZoomIn className="h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Arrows — only if more than 1 image */}
          {total > 1 && (
            <>
              <AnimatePresence>
                {hovered && (
                  <>
                    <motion.button
                      key="prev"
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      key="next"
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </motion.button>
                  </>
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {total > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {safeImages.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-sm border-2 transition-colors",
                  i === activeIndex ? "border-primary" : "border-border hover:border-primary/50"
                )}
                aria-label={`View image ${i + 1}`}
              >
                <Image
                  src={src}
                  alt={`${title} thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
              onClick={closeLightbox}
              aria-label="Close lightbox"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Prev/Next in lightbox */}
            {total > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
                  onClick={(e) => { e.stopPropagation(); prevImage(true); }}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
                  onClick={(e) => { e.stopPropagation(); nextImage(true); }}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Main lightbox image */}
            <motion.div
              className="relative max-h-[85vh] max-w-[90vw] w-full h-full"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={lightboxIndex}
                  className="relative w-full h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Image
                    src={safeImages[lightboxIndex]}
                    alt={`${title} — image ${lightboxIndex + 1}`}
                    fill
                    className="object-contain"
                    sizes="90vw"
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Image counter */}
            {total > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
                {lightboxIndex + 1} / {total}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export { ProductGallery };
