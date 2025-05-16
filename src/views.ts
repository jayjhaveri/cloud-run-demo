export function renderHomePage(): string {
    return `
    <html>
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-100 flex flex-col justify-center items-center h-screen text-center">
        <div class="bg-white p-6 rounded-lg shadow-lg w-96">
          <h1 class="text-2xl font-bold mb-4">Welcome to QR Code Scanner</h1>
          <p class="text-gray-600 mb-4">Scan a QR code to fetch user details from Firestore.</p>
          <a href="/scan-qr" class="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600">Start Scanning</a>
        </div>
      </body>
    </html>
    `;
}

export function renderScanPage(): string {
    return `
    <html>
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-100 flex flex-col justify-center items-center h-screen text-center">
        <h2 class="text-xl font-bold mb-4">Scan QR Code</h2>
        <div id="qr-reader" class="w-80 bg-white p-4 shadow-lg rounded-lg"></div>
        <p id="result" class="text-gray-700 mt-2"></p>
        <script src="https://unpkg.com/html5-qrcode" defer></script>
        <script>
          let scanCompleted = false;
          function onScanSuccess(decodedText) {
            if (scanCompleted) return;
            scanCompleted = true;
            try {
              const qrData = JSON.parse(decodedText);
              if (qrData.qr_code_id) {
                window.location.href = "/user/" + encodeURIComponent(qrData.qr_code_id);
              } else {
                alert("Invalid QR Code scanned!");
                scanCompleted = false;
              }
            } catch (error) {
              alert("Invalid QR Code format!");
              scanCompleted = false;
            }
          }
          function onScanError(errorMessage) {
            console.error("QR Scan Error:", errorMessage);
          }
          document.addEventListener("DOMContentLoaded", function() {
            const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 });
            scanner.render(onScanSuccess, onScanError);
          });
        </script>
      </body>
    </html>
    `;
}

export function renderUserPage(userData: any): string {
    return `
    <html>
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-100 flex justify-center items-center h-screen">
        <div class="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 class="text-xl font-bold mb-4 text-center">User Information</h2>
          <p><strong>Name:</strong> ${userData.Email || "N/A"}</p>
          <p><strong>Mobile:</strong> ${userData.MobileNo || "N/A"}</p>
          <p><strong>Plan Ticket No:</strong> ${userData.PlanTicketNo || "N/A"}</p>
          <p><strong>Registration Date:</strong> ${userData.RegistrationDate || "N/A"}</p>
          <p><strong>State:</strong> ${userData.State || "N/A"}</p>
          <p><strong>City:</strong> ${userData.City || "N/A"}</p>
          <p><strong>Food Preference:</strong> ${userData.Food || "N/A"}</p>
          <p class="text-center mt-4">
            <a href="/scan-qr" class="bg-blue-500 text-white px-4 py-2 rounded">Scan Another</a>
          </p>
        </div>
      </body>
    </html>
    `;
}

export function renderNotFoundPage(): string {
    return `
    <html>
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-100 flex justify-center items-center h-screen">
        <div class="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
          <h2 class="text-xl font-bold mb-4 text-red-600">User Not Found</h2>
          <p class="text-gray-600 mb-4">No data available for the scanned QR code.</p>
          <a href="/scan-qr" class="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600">Scan Another</a>
        </div>
      </body>
    </html>
    `;
}
