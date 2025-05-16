"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const XLSX = __importStar(require("xlsx"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
// Load environment variables
dotenv_1.default.config();
// Initialize Firebase Admin SDK
const serviceAccount = require("./path-to-your-service-account.json");
if (!firebase_admin_1.default.apps.length) {
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert(serviceAccount),
    });
}
const db = firebase_admin_1.default.firestore();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Middleware for async error handling
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
// 1️⃣ Read XLSX File and Upload Data to Firestore
function uploadXlsData(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs_1.default.existsSync(filePath)) {
            console.error("File not found:", filePath);
            return;
        }
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        for (const record of rawData) {
            try {
                const docRef = db.collection("users").doc();
                yield docRef.set(record);
                console.log(`Uploaded: ${record.Email}`);
            }
            catch (error) {
                console.error("Error uploading record:", error);
            }
        }
        console.log("XLSX data successfully uploaded to Firestore.");
    });
}
// 2️⃣ QR Code Scanner Endpoint
app.get("/scan-qr", (_req, res) => {
    res.send(`
    <html>
      <body>
        <h2>Scan QR Code</h2>
        <div id="qr-reader" style="width: 300px;"></div>
        <p id="result"></p>
        <script src="https://unpkg.com/html5-qrcode" defer></script>
        <script>
          function onScanSuccess(decodedText) {
            document.getElementById("result").innerText = "Scanned: " + decodedText;
            window.location.href = decodedText;
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
  `);
});
// 3️⃣ API Endpoint: Fetch User Data via QR Code
app.get("/user/:id", asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const userDoc = yield db.collection("users").doc(id).get();
    if (!userDoc.exists) {
        return res.status(404).json({ message: "User not found" });
    }
    res.json(userDoc.data());
})));
// 4️⃣ API Endpoint: Trigger XLSX Upload (Run Once)
app.post("/upload-xlsx", asyncHandler((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield uploadXlsData("./SAMPLE DATA.xlsx");
    res.json({ message: "XLSX data uploaded successfully" });
})));
// 5️⃣ Global Error Handler
app.use((err, _req, res, _next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Something went wrong, please try again later." });
});
// 6️⃣ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
