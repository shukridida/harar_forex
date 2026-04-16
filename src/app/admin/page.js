"use client";

import { useState } from "react";

export default function Admin() {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");

  const [rates, setRates] = useState([
    { currency: "US DOLLAR", buy: 128.5, sell: 130.0 },
    { currency: "EURO", buy: 148.0, sell: 150.0 },
    { currency: "CANADIAN $", buy: 91.0, sell: 96.0 },
    { currency: "STERLING POUND", buy: 170.0, sell: 175.0 },
    { currency: "DIRHAM", buy: 32.0, sell: 37.0 },
    { currency: "AUSTRALIAN $", buy: 85.0, sell: 90.0 },
    { currency: "UGANDA SH", buy: 19.0, sell: 25.0 },
    { currency: "TANZANIA SH", buy: 4.0, sell: 6.0 },
    { currency: "SWISS FRANCS", buy: 163.0, sell: 168.0 },
    { currency: "S.A RAND", buy: 5.0, sell: 10.0 },
    { currency: "S.ARABIAN RIYAL", buy: 31.5, sell: 35.5 },
    { currency: "INDIAN RUPEE", buy: 1.0, sell: 2.5 },
    { currency: "CHINESE YUAN", buy: 16.0, sell: 18.0 },
    { currency: "QATAR RIYAL", buy: 32.5, sell: 37.5 },
  ]);

  // LOGIN
  const handleLogin = () => {
    if (password === "admin123") {
      setAuthorized(true);
    } else {
      alert("Wrong password ❌");
    }
  };

  // UPDATE RATE
  const handleChange = (index, field, value) => {
    const updated = [...rates];
    updated[index][field] = Number(value);
    setRates(updated);
  };

  // SAVE
  const handleSave = () => {
    localStorage.setItem("rates", JSON.stringify(rates));
    window.dispatchEvent(new Event("storage"));
    alert("Rates saved successfully ✅");
  };

  // 🔐 LOGIN SCREEN
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1C2D] text-white">

        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl w-80 text-center shadow-lg">

          <h1 className="text-2xl font-bold mb-6 text-[#166534]">
            Admin Login
          </h1>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded bg-white/10 border border-white/20 text-white outline-none"
          />

          <button
            onClick={handleLogin}
            className="mt-5 w-full bg-[#166534] hover:bg-green-700 transition px-4 py-2 rounded font-semibold"
          >
            Login
          </button>

        </div>

      </div>
    );
  }

  // 💰 ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-[#0B1C2D] text-white p-10">

      {/* TITLE */}
      <h1 className="text-3xl font-bold text-center mb-8 text-[#166534]">
        Admin Panel - Manage Exchange Rates
      </h1>

      {/* CARD */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-6 overflow-x-auto">

        <table className="w-full text-center">

          <thead>
            <tr className="text-[#166534] border-b border-white/20">
              <th className="p-3">Currency</th>
              <th className="p-3">Buying</th>
              <th className="p-3">Selling</th>
            </tr>
          </thead>

          <tbody>
            {rates.map((rate, index) => (
              <tr key={index} className="border-b border-white/10">

                <td className="p-3 font-semibold">
                  {rate.currency}
                </td>

                <td className="p-3">
                  <input
                    type="number"
                    value={rate.buy}
                    onChange={(e) =>
                      handleChange(index, "buy", e.target.value)
                    }
                    className="w-24 p-2 rounded bg-white/10 border border-white/20 text-white text-center outline-none"
                  />
                </td>

                <td className="p-3">
                  <input
                    type="number"
                    value={rate.sell}
                    onChange={(e) =>
                      handleChange(index, "sell", e.target.value)
                    }
                    className="w-24 p-2 rounded bg-white/10 border border-white/20 text-white text-center outline-none"
                  />
                </td>

              </tr>
            ))}
          </tbody>

        </table>

        {/* SAVE BUTTON */}
        <button
          onClick={handleSave}
          className="mt-6 w-full bg-[#166534] hover:bg-green-700 transition px-6 py-3 rounded-lg font-semibold"
        >
          Save Changes
        </button>

      </div>
    </div>
  );
}