import React, { useRef, useEffect, useState } from 'react';

const ScratchCard = ({ width, height, image, brushSize, onScratch }) => {
  const canvasRef = useRef(null);
  const [isScratched, setIsScratched] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isScratching, setIsScratching] = useState(false);

  const drawFallbackPattern = (ctx) => {
    // Fallback: draw a simple pattern
    ctx.fillStyle = 'lightblue';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Scratch to Reveal', width / 2, height / 2);
    // Overlay
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(128, 128, 128, 0.8)';
    ctx.fillRect(0, 0, width, height);
    setImageLoaded(true);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous'; // Handle CORS issues
    img.onload = () => {
      try {
        ctx.drawImage(img, 0, 0, width, height);
        // Overlay with gray
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(128, 128, 128, 0.8)';
        ctx.fillRect(0, 0, width, height);
        setImageLoaded(true);
      } catch (error) {
        console.warn('Canvas drawing error:', error);
        // Fallback to simple pattern
        drawFallbackPattern(ctx);
      }
    };
    img.onerror = () => {
      // Fallback: draw a simple pattern
      drawFallbackPattern(ctx);
    };
    img.src = image;
  }, [width, height, image]);

  const handleMouseMove = (e) => {
    if (!imageLoaded || isScratched || !isScratching) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Use a different approach to check if scratched enough
    // Instead of getImageData, track scratch points and calculate coverage
    if (!canvas.scratchPoints) {
      canvas.scratchPoints = [];
    }
    
    // Add current point to scratch points
    canvas.scratchPoints.push({ x, y });
    
    // Remove old points to keep only recent ones
    if (canvas.scratchPoints.length > 100) {
      canvas.scratchPoints.shift();
    }
    
    // Simple coverage estimation based on brush strokes
    const brushArea = Math.PI * Math.pow(brushSize / 2, 2);
    const canvasArea = width * height;
    const estimatedCoverage = (canvas.scratchPoints.length * brushArea) / canvasArea;
    
    if (estimatedCoverage > 0.3) { // 30% scratched
      setIsScratched(true);
      onScratch();
    }
  };

  const handleMouseDown = () => {
    setIsScratching(true);
  };

  const handleMouseUp = () => {
    setIsScratching(false);
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: 'crosshair', border: '1px solid #ccc' }}
    />
  );
};

export default ScratchCard;