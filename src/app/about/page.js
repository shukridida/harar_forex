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
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="relative w-full min-h-screen overflow-hidden">

      {/* BACKGROUND SLIDESHOW */}
      <img
        src={images[index]}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* CONTENT */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">

        <div className="max-w-3xl text-center bg-black/40 p-8 rounded-2xl backdrop-blur-md text-white">

          <h1 className="text-5xl font-bold text-[#166534] mb-6">
            Our Story
          </h1>

          <p className="text-lg leading-relaxed text-white/95 mb-6">
            Harar Forex was built with a simple idea — to make money exchange and international transfers easy, fast, and trustworthy for everyone.

            We started with a vision to solve unfair exchange rates, delays, and unsafe money transfers by creating a service built on trust and transparency.
          </p>

          <p className="text-lg leading-relaxed text-white/95 mb-6">
            From Astrol Petrol Station on Red Hill Road, we have grown into a reliable forex bureau serving travelers, individuals, and businesses with fast and secure currency exchange.
          </p>

          <p className="text-lg leading-relaxed text-white/95 mb-6">
            At Harar Forex, we believe money should move as easily as your plans. We ensure fair rates, fast service, and customer trust in every transaction.
          </p>
          <h1 className="text-4xl font-bold text-[#166534] mb-6">
           KUWA PAY MONEY TRANSFER
          </h1>
           <p className="text-lg leading-relaxed text-white/95 mb-6">
           Kuwa Pay is a simple and reliable money transfer service focused on sending funds to China. With a flat fee of KES 500 on all transactions—big or small—we make cross-border payments affordable, fast, and hassle-free.
          </p>

          {/* INFO BOX */}
          <div className="mt-6 border-t border-white/20 pt-4 text-sm text-white/80 space-y-1">
            <p>📍 Astrol Petrol Station, Red Hill Road</p>
            <p>🕒 Monday – Saturday: 9:00 AM – 6:00 PM</p>
            <p>🕒 Sunday & Public Holidays: Closed</p>
          </div>

        </div>

      </div>
    </main>
  );
}