// Inject a visible red banner bar at the top of every page
(function() {
  // Create the banner element
  const banner = document.createElement('div');
  banner.id = 'red-edge-banner';
  banner.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 40px;
      background: linear-gradient(90deg, #ff0000 0%, #cc0000 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      font-size: 16px;
      font-weight: 700;
      z-index: 2147483647;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      border-bottom: 3px solid #990000;
      letter-spacing: 2px;
      text-transform: uppercase;
    ">
      <span style="
        display: inline-block;
        width: 12px;
        height: 12px;
        background: #00ff00;
        border-radius: 50%;
        margin-right: 12px;
        animation: blink 1.5s ease-in-out infinite;
        box-shadow: 0 0 10px #00ff00;
      "></span>
      Internet Farm
    </div>
    <style>
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
      body {
        margin-top: 40px !important;
      }
    </style>
  `;
  
  // Wait for body to exist and inject
  function inject() {
    if (document.body) {
      document.body.insertBefore(banner, document.body.firstChild);
    } else {
      setTimeout(inject, 10);
    }
  }
  
  // Inject immediately if possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
