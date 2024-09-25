"use client";

import React, { useState } from "react";
import Image from "next/image";

interface LazyImageProps {
  src: string;
  alt: string;
}

export default function LazyImage({ src, alt }: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-400">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        layout="fill"
        objectFit="cover"
        className={`transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        onLoadingComplete={() => setIsLoading(false)}
      />
    </div>
  );
}
