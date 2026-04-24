"use client";

import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/contact", {
      method: "POST",
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (res.ok) {
      alert("Message sent successfully ✅");
      setForm({ name: "", email: "", message: "" });
    } else {
      alert("Something went wrong ❌");
    }
  };

  return (
    <main className="min-h-screen bg-[#14B8A6] flex items-center justify-center px-6">

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl">

        {/* 📍 CONTACT INFO SIDE */}
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg text-white">
          
          <h1 className="text-3xl font-bold mb-6 text-[#166534]">
            Contact Information
          </h1>

          <p className="text-lg mb-4">📍 Nairobi, Kenya</p>
          <p className="text-lg mb-4">📞 +254 717 011 111</p>
          <p className="text-lg mb-4">✉️ hararforexbureau@gmail.com</p>

          
        </div>

        {/* 📩 FORM SIDE */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg"
        >
          <h1 className="text-3xl font-bold mb-6 text-[#166534] text-center">
            Send Us a Message
          </h1>

          <input
            placeholder="Your Name"
            className="w-full p-3 mb-4 rounded text-black"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            placeholder="Your Email"
            className="w-full p-3 mb-4 rounded text-black"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <textarea
            placeholder="Your Message"
            className="w-full p-3 mb-4 rounded text-black"
            rows="4"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />

          <button
            type="submit"
            className="w-full bg-[#166534] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>

      </div>

    </main>
  );
}