/**
 * Client-Side Security Protection
 * Prevents console manipulation and client-side tampering
 */

"use client";

/**
 * Disable common console manipulation methods
 */
export function protectConsole() {
  if (typeof window === "undefined") return;

  // Prevent console.clear (only in production)
  if (process.env.NODE_ENV === "production") {
    const originalClear = console.clear;
    console.clear = function () {
      // Silently ignore in production
    };
  }

  // Protect fetch from being overridden (only for our own API endpoints)
  const originalFetch = window.fetch;
  Object.defineProperty(window, "fetch", {
    value: function (...args: Parameters<typeof fetch>) {
      const [url, options = {}] = args;
      const urlString = typeof url === "string" ? url : url instanceof URL ? url.href : url.toString();
      
      // Only add security headers to our own API endpoints, not external services (Clerk, Supabase, etc.)
      const isOurAPI = urlString.startsWith("/api/") || 
                       urlString.includes("localhost:3000/api/") ||
                       (typeof window !== "undefined" && urlString.startsWith(window.location.origin + "/api/"));
      
      const newOptions: RequestInit = {
        ...options,
        headers: isOurAPI ? {
          ...(options.headers || {}),
          "X-Requested-With": "XMLHttpRequest",
        } : options.headers,
      };
      
      return originalFetch(url as RequestInfo | URL, newOptions);
    },
    writable: false,
    configurable: false,
  });

  // Detect DevTools
  let devtools = { open: false, orientation: null };
  const threshold = 160;

  setInterval(() => {
    if (
      window.outerHeight - window.innerHeight > threshold ||
      window.outerWidth - window.innerWidth > threshold
    ) {
      if (!devtools.open) {
        devtools.open = true;
        // Log suspicious activity
        console.warn("Developer tools detected");
      }
    } else {
      devtools.open = false;
    }
  }, 500);

  // Prevent right-click context menu on sensitive elements (production only)
  if (process.env.NODE_ENV === "production") {
    document.addEventListener("contextmenu", (e) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-protected]")) {
        e.preventDefault();
        return false;
      }
    });

    // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U (production only)
    document.addEventListener("keydown", (e) => {
      // F12
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+I
      if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.keyCode === 73)) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+J
      if (e.ctrlKey && e.shiftKey && (e.key === "J" || e.keyCode === 74)) {
        e.preventDefault();
        return false;
      }
      // Ctrl+U (view source)
      if (e.ctrlKey && (e.key === "u" || e.keyCode === 85)) {
        e.preventDefault();
        return false;
      }
    });
  }
}

/**
 * Add integrity check to forms
 */
export function addFormIntegrityCheck(formId: string): string {
  const timestamp = Date.now();
  const nonce = Math.random().toString(36).substring(2, 15);
  const integrity = btoa(`${timestamp}:${nonce}:${formId}`);

  // Store in form data
  const form = document.getElementById(formId) as HTMLFormElement;
  if (form) {
    const hiddenInput = document.createElement("input");
    hiddenInput.type = "hidden";
    hiddenInput.name = "_integrity";
    hiddenInput.value = integrity;
    form.appendChild(hiddenInput);
  }

  return integrity;
}

/**
 * Validate form integrity
 */
export function validateFormIntegrity(integrity: string, formId: string): boolean {
  try {
    const decoded = atob(integrity);
    const [timestamp, nonce, id] = decoded.split(":");
    
    // Check form ID matches
    if (id !== formId) return false;
    
    // Check timestamp (within 10 minutes)
    const timeDiff = Date.now() - parseInt(timestamp);
    if (timeDiff > 10 * 60 * 1000 || timeDiff < 0) return false;
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Initialize client-side protection
 */
export function initClientProtection() {
  if (typeof window === "undefined") return;
  
  protectConsole();
  
  // Add protection to all forms
  document.addEventListener("submit", (e) => {
    const form = e.target as HTMLFormElement;
    if (form && form.id) {
      addFormIntegrityCheck(form.id);
    }
  });
}

