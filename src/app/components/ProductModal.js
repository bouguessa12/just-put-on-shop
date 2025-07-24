"use client";
import { useState, useRef } from "react";
import Image from "next/image";

export default function ProductModal({ product, open, onClose, onOrder }) {
  if (!product || !open) return null;
  // Parse colors array
  let colors = [];
  try {
    colors = Array.isArray(product.colors)
      ? product.colors
      : JSON.parse(product.colors || "[]");
  } catch {
    colors = [];
  }
  const [colorIndex, setColorIndex] = useState(0);
  const selectedColor = colors[colorIndex] || null;

  const handlePrev = () => {
    setColorIndex((prev) => (prev - 1 + colors.length) % colors.length);
  };
  const handleNext = () => {
    setColorIndex((prev) => (prev + 1) % colors.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative animate-fade-in">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="flex flex-col items-center">
          <div className="relative w-64 h-64 mb-4 flex items-center justify-center">
            {selectedColor && selectedColor.image_url ? (
              <Image
                src={selectedColor.image_url}
                alt={selectedColor?.name || 'Product color'}
                fill
                className="object-cover rounded-xl border"
              />
            ) : product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name || 'Product image'}
                fill
                className="object-cover rounded-xl border"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-xl">No image</div>
            )}
            {colors.length > 1 && (
              <>
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full shadow p-1"
                  onClick={handlePrev}
                >
                  &#8592;
                </button>
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full shadow p-1"
                  onClick={handleNext}
                >
                  &#8594;
                </button>
              </>
            )}
          </div>
          <h2 className="text-2xl font-bold mb-2 text-center">{product.name}</h2>
          <p className="text-gray-500 text-center mb-2">{product.description}</p>
          <span className="text-purple-700 font-extrabold text-xl mb-2">{product.price} DZD</span>
          {selectedColor && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-600">Color:</span>
              <span className="font-semibold text-base">{selectedColor.name}</span>
              {selectedColor.image_url && (
                <span className="inline-block w-6 h-6 rounded-full border ml-2" style={{ backgroundImage: `url(${selectedColor.image_url})`, backgroundSize: 'cover' }} />
              )}
            </div>
          )}
          <button
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition mb-2"
            onClick={() => onOrder(selectedColor)}
          >
            Order Now
          </button>
        </div>
      </div>
    </div>
  );
} 