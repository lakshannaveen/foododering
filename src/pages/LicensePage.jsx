import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateLicense, saveLicenseKey, saveAccountId, getAccountId } from "../services/licenseService";

export default function LicensePage() {
  const [key, setKey] = useState("");
  const [accountId, setAccountId] = useState(getAccountId() || "");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [expiry, setExpiry] = useState(null);

  async function handleSubmit(e) {
    e && e.preventDefault();
    setLoading(true);
    // if account id provided in the form, save it so validation can run
    if (accountId) saveAccountId(accountId);

    const ok = await validateLicense(key);
    setLoading(false);

    if (ok) {
      saveLicenseKey(key);
      // read expiry if set
      try {
        const ex = localStorage.getItem("licenseExpiry");
        if (ex) setExpiry(ex);
      } catch (e) {}
      // go to main QR landing page once license is valid
      navigate("/");
    } else {
      alert("Invalid license");
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl mb-4">Enter License Key</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <div className="text-sm text-gray-600 mb-1">Keygen Account ID</div>
          <input
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            placeholder="Account id (optional if hard-coded)"
            className="w-full p-2 border"
          />
        </label>

        <label className="block">
          <div className="text-sm text-gray-600 mb-1">License Key</div>
          <input
            id="license"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Paste your license key"
            className="w-full p-2 border"
          />
        </label>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white"
          >
            {loading ? "Checking..." : "Submit"}
          </button>
        </div>
      </form>

      {expiry && (
        <div className="mt-4 text-sm text-green-700">Valid until: {expiry}</div>
      )}
    </div>
  );
}

