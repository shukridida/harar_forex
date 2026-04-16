"use client";

import { useState, useEffect } from "react";

export default function Admin() {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");

  const [rates, setRates] = useState([
   { currency: "US DOLLAR", buy: 128.50, sell: 130.00 },
    { currency: "EURO", buy: 148.00, sell: 130.00},
    { currency: "CANADIAN $", buy: 91.00, sell: 96.00 },
    { currency: "STERLING POUND", buy: 170.00, sell: 175.00},
    { currency: "DIRHAM", buy: 32.00, sell: 37.00 },
    { currency: "AUSTRALIAN $", buy: 85.00, sell: 90.00 },
    { currency: "UGANDA SH", buy: 19.00, sell: 25.00 },
    { currency: "TANZANIA SH", buy: 4.00, sell: 6.00},
    { currency: "SWISS FRANCS", buy: 163.00, sell: 168.00 },
    { currency: "S.A RAND", buy: 5.00, sell: 10.00 },
    { currency: "S.ARABIAN RIYAL", buy: 31.50, sell:35.50},
    { currency: "INDIAN RUPEE", buy: 1.00, sell: 2.50 },
    { currency: "CHINESE YUAN", buy: 16.00, sell: 18.00},
    { currency: "QATAR RIYAL", buy: 32.50, sell: 37.50 },
  ]);

  // 🔐 LOGIN
  const handleLogin = () => {
    if (password === "admin123") {
      setAuthorized(true);
    } else {
      alert("Wrong password");
    }
  };

  // 💰 CHANGE HANDLER
  const handleChange = (index, field, value) => {
    const updated = [...rates];
    updated[index][field] = value;
    setRates(updated);
  };

  // 💾 SAVE
  const handleSave = () => {
    localStorage.setItem("rates", JSON.stringify(rates));
    window.dispatchEvent(new Event("storage"));
    alert("Rates saved successfully ✅");
  };

  // 🔐 LOGIN SCREEN
  if (!authorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1C2D] text-white">
        <h1 className="text-2xl mb-4">Admin Login</h1>

        <input
          type="password"
          placeholder="Enter password"
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded text-white"
        />

        <button
          onClick={handleLogin}
          className="mt-4 bg-yellow-400 text-black px-4 py-2 rounded"
        >
          Login
        </button>
      </div>
    );
  }

  // 💰 ADMIN PANEL
  return (
    <div className="min-h-screen bg-[#0B1C2D] text-white p-10">
      <h1 className="text-3xl mb-6">Admin Panel - Update Rates</h1>

      <div className="bg-white text-black p-6 rounded-xl overflow-x-auto">
        <table className="w-full text-center">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3">Currency</th>
              <th className="p-3">Buying</th>
              <th className="p-3">Selling</th>
            </tr>
          </thead>

          <tbody>
            {rates.map((rate, index) => (
              <tr key={index} className="border-b">
                <td className="p-3 font-semibold">{rate.currency}</td>

                <td className="p-3">
                  <input
                    type="number"
                    value={rate.buy}
                    onChange={(e) =>
                      handleChange(index, "buy", e.target.value)
                    }
                    className="border p-1 w-24"
                  />
                </td>

                <td className="p-3">
                  <input
                    type="number"
                    value={rate.sell}
                    onChange={(e) =>
                      handleChange(index, "sell", e.target.value)
                    }
                    className="border p-1 w-24"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={handleSave}
          className="mt-6 bg-yellow-400 text-black px-6 py-2 rounded"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}