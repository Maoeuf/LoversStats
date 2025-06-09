
import React from 'react';

// Performance optimization utilities for large datasets

// Virtual scrolling implementation
export class VirtualScroller {
  private container: HTMLElement;
  private itemHeight: number;
  private bufferSize: number;
  private scrollTop: number = 0;
  private visibleRange: { start: number; end: number } = { start: 0, end: 0 };

  constructor(container: HTMLElement, itemHeight: number, bufferSize: number = 5) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.bufferSize = bufferSize;
  }

  getVisibleRange(totalItems: number): { start: number; end: number; offset: number } {
    const containerHeight = this.container.clientHeight;
    const visibleCount = Math.ceil(containerHeight / this.itemHeight);
    
    const start = Math.max(0, Math.floor(this.scrollTop / this.itemHeight) - this.bufferSize);
    const end = Math.min(totalItems, start + visibleCount + this.bufferSize * 2);
    
    return {
      start,
      end,
      offset: start * this.itemHeight
    };
  }

  updateScrollTop(scrollTop: number) {
    this.scrollTop = scrollTop;
  }
}

// Debounced search for performance
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Chunk processing for large arrays
export function processInChunks<T, R>(
  array: T[],
  processor: (chunk: T[]) => R[],
  chunkSize: number = 1000
): Promise<R[]> {
  return new Promise((resolve) => {
    const results: R[] = [];
    let index = 0;

    function processChunk() {
      const chunk = array.slice(index, index + chunkSize);
      if (chunk.length === 0) {
        resolve(results);
        return;
      }

      const chunkResults = processor(chunk);
      results.push(...chunkResults);
      index += chunkSize;

      // Use setTimeout to prevent blocking the main thread
      setTimeout(processChunk, 0);
    }

    processChunk();
  });
}

// Memory-efficient message filtering
export function createMessageFilter(searchTerm: string, messages: any[]) {
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  // Use generator for memory efficiency
  function* filterMessages() {
    for (const message of messages) {
      if (
        message.content.toLowerCase().includes(lowerSearchTerm) ||
        message.sender.toLowerCase().includes(lowerSearchTerm)
      ) {
        yield message;
      }
    }
  }

  return filterMessages;
}

// Lazy loading implementation
export class LazyLoader {
  private loadedChunks = new Set<number>();
  private chunkSize: number;

  constructor(chunkSize: number = 100) {
    this.chunkSize = chunkSize;
  }

  getChunkIndex(index: number): number {
    return Math.floor(index / this.chunkSize);
  }

  isChunkLoaded(chunkIndex: number): boolean {
    return this.loadedChunks.has(chunkIndex);
  }

  markChunkLoaded(chunkIndex: number): void {
    this.loadedChunks.add(chunkIndex);
  }

  getRequiredChunks(startIndex: number, endIndex: number): number[] {
    const chunks: number[] = [];
    const startChunk = this.getChunkIndex(startIndex);
    const endChunk = this.getChunkIndex(endIndex);

    for (let i = startChunk; i <= endChunk; i++) {
      if (!this.isChunkLoaded(i)) {
        chunks.push(i);
      }
    }

    return chunks;
  }
}

// Efficient data storage with compression
export class DataStorage {
  private static compressData(data: any): string {
    try {
      return JSON.stringify(data);
    } catch (error) {
      console.error('Failed to compress data:', error);
      throw new Error('Data compression failed');
    }
  }

  private static decompressData(compressedData: string): any {
    try {
      return JSON.parse(compressedData);
    } catch (error) {
      console.error('Failed to decompress data:', error);
      throw new Error('Data decompression failed');
    }
  }

  static saveToStorage(key: string, data: any): boolean {
    try {
      const compressed = this.compressData(data);
      
      // Check if data is too large for localStorage
      if (compressed.length > 5 * 1024 * 1024) { // 5MB limit
        console.warn('Data too large for localStorage, using chunked storage');
        return this.saveChunkedData(key, data);
      }

      localStorage.setItem(key, compressed);
      return true;
    } catch (error) {
      console.error('Failed to save to storage:', error);
      return false;
    }
  }

  static loadFromStorage(key: string): any {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;

      // Check if it's chunked data
      if (data.startsWith('CHUNKED:')) {
        return this.loadChunkedData(key);
      }

      return this.decompressData(data);
    } catch (error) {
      console.error('Failed to load from storage:', error);
      return null;
    }
  }

  private static saveChunkedData(key: string, data: any): boolean {
    try {
      const compressed = this.compressData(data);
      const chunkSize = 1024 * 1024; // 1MB chunks
      const chunks = Math.ceil(compressed.length / chunkSize);

      // Save metadata
      localStorage.setItem(key, `CHUNKED:${chunks}`);

      // Save chunks
      for (let i = 0; i < chunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, compressed.length);
        const chunk = compressed.slice(start, end);
        localStorage.setItem(`${key}_chunk_${i}`, chunk);
      }

      return true;
    } catch (error) {
      console.error('Failed to save chunked data:', error);
      return false;
    }
  }

  private static loadChunkedData(key: string): any {
    try {
      const metadata = localStorage.getItem(key);
      if (!metadata || !metadata.startsWith('CHUNKED:')) return null;

      const chunks = parseInt(metadata.split(':')[1]);
      let compressed = '';

      // Load all chunks
      for (let i = 0; i < chunks; i++) {
        const chunk = localStorage.getItem(`${key}_chunk_${i}`);
        if (!chunk) throw new Error(`Missing chunk ${i}`);
        compressed += chunk;
      }

      return this.decompressData(compressed);
    } catch (error) {
      console.error('Failed to load chunked data:', error);
      return null;
    }
  }

  static clearChunkedData(key: string): void {
    const metadata = localStorage.getItem(key);
    if (metadata && metadata.startsWith('CHUNKED:')) {
      const chunks = parseInt(metadata.split(':')[1]);
      for (let i = 0; i < chunks; i++) {
        localStorage.removeItem(`${key}_chunk_${i}`);
      }
    }
    localStorage.removeItem(key);
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  React.useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 16) { // More than one frame (60fps)
        console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms`);
      }
    };
  });
}

// Memory usage tracker
export class MemoryTracker {
  private static measurements: Array<{ timestamp: number; usage: number }> = [];

  static measure(): number {
    if ('memory' in performance) {
      // @ts-ignore - performance.memory is not in TypeScript types
      const usage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
      this.measurements.push({ timestamp: Date.now(), usage });
      
      // Keep only last 100 measurements
      if (this.measurements.length > 100) {
        this.measurements.shift();
      }
      
      return usage;
    }
    return 0;
  }

  static getAverageUsage(): number {
    if (this.measurements.length === 0) return 0;
    const sum = this.measurements.reduce((acc, m) => acc + m.usage, 0);
    return sum / this.measurements.length;
  }

  static getMemoryTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.measurements.length < 10) return 'stable';
    
    const recent = this.measurements.slice(-10);
    const first = recent[0].usage;
    const last = recent[recent.length - 1].usage;
    const diff = last - first;
    
    if (Math.abs(diff) < 1) return 'stable';
    return diff > 0 ? 'increasing' : 'decreasing';
  }
}
