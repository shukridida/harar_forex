"use client";

import { useEffect, useState } from "react";

export default function About() {
  
  const images = [
    "/slide1.jpg",
    "/slide3.jpg",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="relative w-full h-screen overflow-hidden">

      {/* FULL SCREEN BACKGROUND */}
      <img
        src={images[index]}
        alt="background"
        className="absolute top-0 left-0 w-full h-full object-cover"
      />

      {/* DARK OVERLAY */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/60"></div>

      {/* CONTENT */}
      <div className="relative z-10 flex items-center justify-center w-full h-full px-6">

        <div className="text-center text-white max-w-3xl">

          <h1 className="text-5xl font-bold text-[#166534] mb-6">
            Our Story
          </h1>

          <p className="text-lg">
            Harar Forex Bureau provides fast, secure and trusted currency exchange services
            in Nairobi. We are committed to reliability and customer satisfaction.
          </p>

        </div>

      </div>

    </main>
  );
}