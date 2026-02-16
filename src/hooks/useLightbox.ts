"use client";

import { useState, useRef, useCallback } from "react";

interface SwipeState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  swiping: boolean;
}

export function useLightbox() {
  const [open, setOpen] = useState(false);
  const [flyAway, setFlyAway] = useState(false);
  const swipeRef = useRef<SwipeState>({ startX: 0, startY: 0, currentX: 0, currentY: 0, swiping: false });
  const imageRef = useRef<HTMLDivElement>(null);
  const lastTouchTime = useRef(0);

  const openLightbox = useCallback(() => setOpen(true), []);

  const closeLightbox = useCallback(() => {
    setFlyAway(false);
    setOpen(false);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    swipeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      currentX: 0,
      currentY: 0,
      swiping: true,
    };
    lastTouchTime.current = Date.now();
    imageRef.current?.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!swipeRef.current.swiping) return;
    const dx = e.clientX - swipeRef.current.startX;
    const dy = e.clientY - swipeRef.current.startY;
    swipeRef.current.currentX = dx;
    swipeRef.current.currentY = dy;
    if (imageRef.current) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      const scale = Math.max(0.8, 1 - dist / 1000);
      const rotation = dx * 0.05;
      imageRef.current.style.transform = `translate(${dx}px, ${dy}px) rotate(${rotation}deg) scale(${scale})`;
      imageRef.current.style.transition = "none";
    }
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!swipeRef.current.swiping) return;
    swipeRef.current.swiping = false;
    imageRef.current?.releasePointerCapture(e.pointerId);

    const dx = swipeRef.current.currentX;
    const dy = swipeRef.current.currentY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const elapsed = Date.now() - lastTouchTime.current;
    const velocity = dist / Math.max(elapsed, 1);

    if (dist > 80 || velocity > 0.5) {
      const vx = (dx / Math.max(elapsed, 1)) * 800;
      const vy = (dy / Math.max(elapsed, 1)) * 800;
      setFlyAway(true);
      if (imageRef.current) {
        const finalX = dx + vx;
        const finalY = dy + vy;
        const rotation = finalX * 0.08;
        imageRef.current.style.transition = "transform 0.5s cubic-bezier(0.2, 0, 0, 1), opacity 0.4s ease-out";
        imageRef.current.style.transform = `translate(${finalX}px, ${finalY}px) rotate(${rotation}deg) scale(0.5)`;
        imageRef.current.style.opacity = "0";
      }
      setTimeout(closeLightbox, 400);
    } else {
      if (imageRef.current) {
        imageRef.current.style.transition = "transform 0.3s cubic-bezier(0.2, 0, 0, 1)";
        imageRef.current.style.transform = "translate(0, 0) rotate(0deg) scale(1)";
        imageRef.current.style.opacity = "1";
      }
    }
  }, [closeLightbox]);

  return {
    open,
    flyAway,
    imageRef,
    openLightbox,
    closeLightbox,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
