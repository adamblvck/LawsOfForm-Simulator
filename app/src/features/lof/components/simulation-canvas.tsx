import { useEffect, useLayoutEffect, useRef } from "react";
import type { LoFStructure } from "@/features/lof/types";

interface SimulationCanvasProps {
  structure: LoFStructure;
  version: number;
  className?: string;
}

const LINE_COLOR = "#cbd5f5";
const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.stroke();
};

const drawStructure = (
  ctx: CanvasRenderingContext2D,
  structure: LoFStructure,
  canvasSize: number,
  padding = 10
) => {
  const drawSquares = (
    node: LoFStructure,
    x: number,
    y: number,
    size: number,
    depth: number
  ) => {
    if (!Array.isArray(node) || node.length === 0) {
      return;
    }

    const inset = size * 0.08;
    const netSize = size - inset * 2;
    const rowSize = Math.ceil(Math.sqrt(node.length));
    const gap = netSize * 0.06;
    const cellSize = (netSize - gap * (rowSize - 1)) / rowSize;

    ctx.strokeStyle = LINE_COLOR;
    drawRoundedRect(ctx, x, y, size, size, size * 0.1);

    node.forEach((child, idx) => {
      const col = idx % rowSize;
      const row = Math.floor(idx / rowSize);
      const childX = x + inset + col * (cellSize + gap);
      const childY = y + inset + row * (cellSize + gap);
      drawSquares(child, childX, childY, cellSize, depth + 1);
    });
  };

  ctx.clearRect(0, 0, canvasSize, canvasSize);
  ctx.save();
  ctx.lineWidth = 1.25;
  ctx.strokeStyle = LINE_COLOR;
  ctx.translate(padding, padding);
  drawSquares(structure, 0, 0, canvasSize - padding * 2, 0);
  ctx.restore();
};

export const SimulationCanvas = ({ structure, version, className }: SimulationCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) {
      return;
    }
    const rect = container.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height || rect.width);
    canvas.width = size;
    canvas.height = size;
    return size;
  };

  useLayoutEffect(() => {
    resizeCanvas();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof ResizeObserver === "undefined") {
      return;
    }
    const observer = new ResizeObserver(() => {
      const size = resizeCanvas();
      if (!size) {
        return;
      }
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }
      drawStructure(ctx, structure, size);
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [structure, version]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    const size = canvas.width;
    drawStructure(ctx, structure, size);
  }, [structure, version]);

  return (
    <div ref={containerRef} className={className}>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
};

export default SimulationCanvas;
