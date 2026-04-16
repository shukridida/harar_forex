import Link from "next/link";

export default function Home() {
  return (
    <main
      className="relative min-h-screen text-white bg-cover bg-center"
      style={{ backgroundImage: "url('/brand-logo.jpg')" }}
    >

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* CONTENT */}
      <div className="relative z-10">

        {/* NAVBAR */}
        <nav className="flex justify-between items-center px-8 py-5">

          {/* LOGO */}
          <img
            src="/logo.jpg"
            alt="logo"
            style={{ width: "80px", height: "80px", objectFit: "contain" }}
          />

         <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
  <h1 className="text-2xl font-bold text-white">
    HARAR <span className="text-[#166534]">BUREAU</span>
  </h1>
</div>

          <div className="space-x-6 hidden md:flex">
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/rates">Rates</Link>
            <Link href="/contact">Contact</Link>
          </div>

        </nav>

        {/* HERO */}
        <section className="text-center py-24 px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Fast & Trusted Forex Exchange
          </h2>

          <p className="max-w-2xl mx-auto text-white/90 mb-8">
            Harar Forex is your trusted partner for currency exchange and money transfers
            service .We are commited to providing competitive exchange rates,fast transactions,
            and secure financial services.
            
          </p>
           <div className="space-y-2 text-center">
  
  <p>📍 Location: Astrol Petrol Station, Red Hill Road</p>

  <div>
    <p className="font-semibold">🕒 Opening Hours:</p>

    <ul className="space-y-1">
      <li>Monday – Saturday: 9:00 AM – 6:00 PM</li>
      <li>Sunday: Closed</li>
      <li>Public Holidays: Closed</li>
    </ul>
  </div>

</div>

          <Link href="/rates">
            <button className="bg-[#166534] px-6 py-3 rounded-lg font-semibold hover:opacity-90">
              View Rates
            </button>
          </Link>
        </section>

       {/* FOOTER */}
<footer className="bg-black/60 text-white mt-10 py-6">
  <div className="text-center space-y-2">

    <p className="text-lg font-semibold">
      📞 Contact Us
    </p>

    <p className="text-[#166534] font-bold text-xl">
      +254 717 011 111
    </p>

    <p className="text-white/70 text-sm">
      hararforexbureau@gmail.com
    </p>

  </div>
</footer>

      </div>
    </main>
  );
}