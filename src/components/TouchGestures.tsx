
import React, { useRef, useCallback, useEffect } from 'react';

interface TouchGesturesProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinchZoom?: (scale: number) => void;
  children: React.ReactNode;
  className?: string;
}

const TouchGestures: React.FC<TouchGesturesProps> = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinchZoom,
  children,
  className = ''
}) => {
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number; time: number } | null>(null);
  const pinchStart = useRef<number | null>(null);

  const minSwipeDistance = 50;
  const maxSwipeTime = 300;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      };
    } else if (e.touches.length === 2 && onPinchZoom) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStart.current = distance;
    }
  }, [onPinchZoom]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && onPinchZoom && pinchStart.current) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = distance / pinchStart.current;
      onPinchZoom(scale);
    }
  }, [onPinchZoom]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;

    if (e.changedTouches.length === 1) {
      touchEnd.current = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
        time: Date.now()
      };

      const timeDiff = touchEnd.current.time - touchStart.current.time;
      if (timeDiff > maxSwipeTime) return;

      const distanceX = touchEnd.current.x - touchStart.current.x;
      const distanceY = touchEnd.current.y - touchStart.current.y;

      const absDistanceX = Math.abs(distanceX);
      const absDistanceY = Math.abs(distanceY);

      // Vérifier si c'est un swipe horizontal
      if (absDistanceX > absDistanceY && absDistanceX > minSwipeDistance) {
        if (distanceX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (distanceX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }
      // Vérifier si c'est un swipe vertical
      else if (absDistanceY > absDistanceX && absDistanceY > minSwipeDistance) {
        if (distanceY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (distanceY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    }

    touchStart.current = null;
    touchEnd.current = null;
    pinchStart.current = null;
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
};

export default TouchGestures;
