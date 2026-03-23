// Frontend-only Keygen license helpers
// NOTE: Hard-coding account id in frontend is insecure for production.
// For now we allow a DEFAULT_ACCOUNT_ID that will be used when no account id is stored.
const DEFAULT_ACCOUNT_ID = "d155cc87-783f-47ff-b03f-3b3c76d69e2a"; // <-- optionally paste your Keygen account id here for frontend-only use

export async function validateLicense(licenseKey) {
  if (!licenseKey) return false;

  const accountId = getAccountId() || DEFAULT_ACCOUNT_ID;
  if (!accountId) {
    console.warn(
      "Keygen account id not set; open /license and provide your account id to enable validation"
    );
    return false;
  }

  try {
    const res = await fetch(
      `https://api.keygen.sh/v1/accounts/${accountId}/licenses/actions/validate-key`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/vnd.api+json",
        },
        body: JSON.stringify({ meta: { key: licenseKey } }),
      }
    );

    if (!res.ok) {
      // server returned error - clear stored key to avoid loops
      clearLicenseKey();
      localStorage.removeItem("licenseExpiry");
      return false;
    }

    const data = await res.json();

    // Save useful metadata: expiry (if present) and last validation timestamp
    try {
      if (data && data.data && data.data.attributes) {
        const attrs = data.data.attributes;
        if (attrs.expires_at) {
          localStorage.setItem("licenseExpiry", attrs.expires_at);
        }
      }
    } catch (e) {
      // ignore
    }

    const valid = Boolean(data && data.meta && data.meta.valid);

    // If valid, also ensure expiry (if stored) is not in the past
    if (valid) {
      const expiry = localStorage.getItem("licenseExpiry");
      if (expiry) {
        const exp = new Date(expiry);
        if (!isNaN(exp.getTime())) {
          if (exp.getTime() < Date.now()) {
            // expired
            // remove stored invalid/expired key
            clearLicenseKey();
            localStorage.removeItem("licenseExpiry");
            return false;
          }
        }
      }
    }
    if (!valid) {
      // invalid key -> remove stored key so user must re-enter
      try {
        clearLicenseKey();
        localStorage.removeItem("licenseExpiry");
      } catch (e) {}
    }

    return valid;
  } catch (err) {
    console.error("License validation error:", err);
    // on error, clear stored key to allow user re-entry
    try {
      clearLicenseKey();
      localStorage.removeItem("licenseExpiry");
    } catch (e) {}
    return false;
  }
}

export function saveLicenseKey(key) {
  try {
    localStorage.setItem("licenseKey", key);
  } catch (e) {
    console.error(e);
  }
}

export function getLicenseKey() {
  try {
    return localStorage.getItem("licenseKey");
  } catch (e) {
    console.error(e);
    return null;
  }
}

export function clearLicenseKey() {
  try {
    localStorage.removeItem("licenseKey");
  } catch (e) {
    console.error(e);
  }
}

export function saveAccountId(id) {
  try {
    localStorage.setItem("keygenAccountId", id);
  } catch (e) {
    console.error(e);
  }
}

export function getAccountId() {
  try {
    return localStorage.getItem("keygenAccountId");
  } catch (e) {
    console.error(e);
    return null;
  }
}

export function clearAccountId() {
  try {
    localStorage.removeItem("keygenAccountId");
  } catch (e) {
    console.error(e);
  }
}
