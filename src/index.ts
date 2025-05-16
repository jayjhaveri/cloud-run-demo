import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import * as XLSX from "xlsx";
import admin from "firebase-admin";
import fs from "fs";
import { renderHomePage, renderScanPage, renderUserPage, renderNotFoundPage } from "./views";

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
    });
}

const db = admin.firestore();
const app: Application = express();
app.use(cors());
app.use(express.json());

// Define the expected structure of the XLSX data
interface UserRecord {
    MobileNo?: string;
    Email?: string;
    RegistrationDate?: string;
    ConfirmDate?: string;
    PlanTicketNo?: string;
    PlanTicketURL?: string;
    PlanType?: string;
    PaymentStatus?: string;
    ProfileType?: string;
    State?: string;
    City?: string;
    Food?: string;
    ReferralFrom?: string;
    RagistrationType?: string;
    OrderId?: string;
    ReferenceCode?: string;
    PaymentDone?: string;
    "Selected sessions 1"?: string;
    "Selected sessions 2"?: string;
    "Selected sessions 3"?: string;
    "Selected sessions 4"?: string;
}

// Middleware for async error handling
const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Default Route
app.get("/", (_req, res) => {
    res.send(renderHomePage());
});

// QR Code Scanner Endpoint
app.get("/scan-qr", (_req, res) => {
    res.send(renderScanPage());
});

// API Endpoint: Fetch User Data via QR Code
app.get("/user/:id", asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    console.log("Fetching user data for ID:", id);
    const userDoc = await db.collection("users").where("PlanTicketNo", "==", id).limit(1).get();

    if (userDoc.empty) {
        return res.status(404).send(renderNotFoundPage());
    }
    const userData = userDoc.docs.map(doc => doc.data())[0];
    res.send(renderUserPage(userData));
}));

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Something went wrong, please try again later." });
});

async function uploadXlsData(filePath: string) {
    if (!fs.existsSync(filePath)) {
        console.error("File not found:", filePath);
        return;
    }

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const rawData: UserRecord[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    for (const record of rawData) {
        try {
            const docRef = db.collection("users").doc();
            await docRef.set(record);
            console.log(`Uploaded: ${record.Email}`);
        } catch (error) {
            console.error("Error uploading record:", error);
        }
    }
    console.log("XLSX data successfully uploaded to Firestore.");
}

app.post("/upload-xlsx", asyncHandler(async (_req: any, res: { json: (arg0: { message: string; }) => void; }) => {
    await uploadXlsData("./SAMPLE DATA.xlsx");
    res.json({ message: "XLSX data uploaded successfully" });
}));

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
