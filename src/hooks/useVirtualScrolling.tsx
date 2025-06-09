
import React, { useState, useEffect, useCallback } from 'react';

interface VirtualScrollingOptions {
  itemHeight: number;
  containerHeight: number;
  buffer?: number;
}

export function useVirtualScrolling<T>(
  items: T[], 
  options: VirtualScrollingOptions
) {
  const { itemHeight, containerHeight, buffer = 5 } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
  const endIndex = Math.min(items.length, startIndex + visibleCount + buffer * 2);
  
  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;
  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    startIndex,
    endIndex,
    offsetY,
    totalHeight,
    handleScroll,
    scrollTop
  };
}
