
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Performance monitoring
const startTime = performance.now();

// Optimize root rendering
const container = document.getElementById("root");
if (!container) throw new Error("Root container not found");

const root = createRoot(container);

// Render with performance tracking
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Log performance metrics
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    const loadTime = performance.now() - startTime;
    console.log(`App loaded in ${loadTime.toFixed(2)}ms`);
    
    // Report Web Vitals
    if ('web-vitals' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      });
    }
  });
}
