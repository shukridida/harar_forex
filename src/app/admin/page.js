"use client";

import { useEffect, useState } from "react";

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [rates, setRates] = useState([]);
  const [version, setVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadPublished = async (csrfFromSession) => {
    const response = await fetch("/api/rates", { cache: "no-store" });
    if (!response.ok) throw new Error("Published rates could not be loaded.");
    const data = await response.json();
    setRates(data.rates);
    setVersion(data.version);
    if (csrfFromSession) setCsrfToken(csrfFromSession);
  };

  useEffect(() => {
    let active = true;
    fetch("/api/admin/session", { cache: "no-store" })
      .then((response) => response.json())
      .then(async (data) => {
        if (!active || !data.authenticated) return;
        setAuthenticated(true);
        setCsrfToken(data.csrfToken);
        await loadPublished(data.csrfToken);
      })
      .catch(() => { if (active) setMessage("Could not connect to the server."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed.");
      setAuthenticated(true);
      setPassword("");
      await loadPublished(data.csrfToken);
      setMessage("Published rates loaded.");
    } catch (error) {
      setMessage(error.message);
    } finally { setLoading(false); }
  };

  const handleChange = (index, field, value) => {
    const updated = rates.map((rate, i) => i === index ? { ...rate, [field]: value === "" ? "" : Number(value) } : rate);
    setRates(updated);
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/rates", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
        body: JSON.stringify({ rates, version }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Rates could not be published.");
      setRates(data.rates);
      setVersion(data.version);
      setMessage("Rates published successfully.");
    } catch (error) { setMessage(error.message); }
    finally { setSaving(false); }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST", headers: { "X-CSRF-Token": csrfToken } });
    setAuthenticated(false); setRates([]); setVersion(null); setCsrfToken(""); setMessage("Signed out.");
  };

  if (!authenticated) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1C2D] text-white">
      <form onSubmit={handleLogin} className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl w-80 text-center shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-[#166534]">Admin Login</h1>
        <input autoComplete="username" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 mb-3 rounded bg-white/10 border border-white/20 text-white outline-none" />
        <input type="password" autoComplete="current-password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 rounded bg-white/10 border border-white/20 text-white outline-none" />
        <button disabled={loading} className="mt-5 w-full bg-[#166534] hover:bg-green-700 transition px-4 py-2 rounded font-semibold disabled:opacity-50">{loading ? "Please wait…" : "Login"}</button>
        {message && <p role="status" className="mt-4">{message}</p>}
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B1C2D] text-white p-10">
      <h1 className="text-3xl font-bold text-center mb-8 text-[#166534]">Admin Panel - Manage Exchange Rates</h1>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-6 overflow-x-auto">
        {loading ? <p>Loading published rates…</p> : rates.length === 0 ? <p role="alert">Published rates are unavailable. No default values were loaded.</p> : <>
          <table className="w-full text-center"><thead><tr className="text-[#166534] border-b border-white/20"><th className="p-3">Currency</th><th className="p-3">Buying</th><th className="p-3">Selling</th></tr></thead>
            <tbody>{rates.map((rate, index) => <tr key={rate.currency} className="border-b border-white/10"><td className="p-3 font-semibold">{rate.currency}</td>
              <td className="p-3"><input type="number" min="0" step="0.0001" value={rate.buy} onChange={(e) => handleChange(index, "buy", e.target.value)} className="w-24 p-2 rounded bg-white/10 border border-white/20 text-white text-center outline-none" /></td>
              <td className="p-3"><input type="number" min="0" step="0.0001" value={rate.sell} onChange={(e) => handleChange(index, "sell", e.target.value)} className="w-24 p-2 rounded bg-white/10 border border-white/20 text-white text-center outline-none" /></td>
            </tr>)}</tbody>
          </table>
          <button onClick={handleSave} disabled={saving || loading} className="mt-6 w-full bg-[#166534] hover:bg-green-700 transition px-6 py-3 rounded-lg font-semibold disabled:opacity-50">{saving ? "Publishing…" : "Save Changes"}</button>
        </>}
        {message && <p role="status" className="mt-4 text-center">{message}</p>}
        <button onClick={handleLogout} className="mt-3 w-full border border-white/20 px-4 py-2 rounded">Sign out</button>
      </div>
    </div>
  );
}
