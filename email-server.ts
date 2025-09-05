import express from "express";
import { Resend } from "resend";
import dotenv from "dotenv";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { put, del } from "@vercel/blob";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;

// Enable CORS for your frontend
app.use(
    cors({
        origin: [
          "http://localhost:8080",
          "https://localhost:8080",
          "http://spective.cryptonit.hu",
          "https://spective.cryptonit.hu",
          "https://spective.hu",
          "http://spective.hu",
          "http://localhost:8081",
          "https://localhost:8081",
          "http://192.168.1.184:8081/",
          "https://192.168.1.184:8081/"
        ],
        credentials: true,
    })
);

// Parse JSON bodies
app.use(express.json());

// Initialize Resend with validation
if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY is not set in environment variables");
    process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);

// Email API endpoint
app.post("/api/send-email", async (req, res) => {
    try {
        const { to, subject, html, text, from, replyTo, cc, bcc, scheduledAt } =
            req.body;

        // Prepare CC field
        let ccArray: string[] | undefined;
        if (cc) {
            ccArray = Array.isArray(cc) ? cc : [cc];
        }

        // Prepare BCC field
        let bccArray: string[] | undefined;
        if (bcc) {
            bccArray = Array.isArray(bcc) ? bcc : [bcc];
        }

        const result = await resend.emails.send({
            from:
                process.env.RESEND_FROM_EMAIL ||
                "noreply+emailserver@yourdomain.com",
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
            text,
            replyTo: replyTo,
            cc: ccArray,
            bcc: bccArray,
            scheduledAt: scheduledAt
                ? new Date(scheduledAt).toISOString()
                : undefined,
        });

        if (result.error) {
            return res.status(400).json({ error: result.error });
        }

        res.json({
            success: true,
            messageId: result.data?.id,
        });
    } catch (error) {
        console.error("Email API Error:", error);
        res.status(500).json({
            error: "Failed to send email",
        });
    }
});

app.post("/api/cancel-email", async (req, res) => {
    try {
        const { emailId } = req.body;

        const result = await resend.emails.cancel(emailId);

        if (result.error) {
            return res.status(400).json({ error: result.error });
        }

        res.json({
            success: true,
            messageId: result.data?.id,
        });
    } catch (error) {
        console.error("Email API Error:", error);
        res.status(500).json({
            error: "Failed to send email",
        });
    }
});

// Email status endpoint
app.get("/api/email-status", async (req, res) => {
    try {
        const apiKey = process.env.RESEND_API_KEY;
        const fromEmail = process.env.RESEND_FROM_EMAIL;

        res.json({
            configured: !!apiKey,
            fromEmailConfigured:
                !!fromEmail && fromEmail !== "noreply@yourdomain.com",
            status: "operational",
        });
    } catch (statusError) {
        console.error("Email status check failed:", statusError);
        res.status(500).json({
            error: "Service check failed",
        });
    }
});

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// User deletion API endpoint
app.post("/api/delete-user", async (req, res) => {
  console.log(req.body);
  
    try {
        const { userId } = req.body;
        const authHeader = req.headers.authorization;

        if (!userId) {
            return res.status(400).json({ error: "Missing userId" });
        }

        // Check if user is authenticated and is an admin
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: "Authorization header required" });
        }

        const token = authHeader.substring(7);
        const supabaseAuth = createClient(
            process.env.VITE_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Verify the token and get user info
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
        if (authError || !user) {
            return res.status(401).json({ error: "Invalid token" });
        }

        // Check if user is admin
        const { data: profile, error: profileError } = await supabaseAuth
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();

        if (profileError || !profile || profile.role !== 'admin') {
            return res.status(403).json({ error: "Admin access required" });
        }
        const supabaseAdmin = createClient(
            process.env.VITE_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (error) {
            return res
                .status(500)
                .json({ error: error.message || "Failed to delete user" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error in /api/delete-user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Terms & Conditions upload endpoint
app.post("/api/upload-terms", async (req, res) => {
    try {
        // Get the file from the request body (as buffer)
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        // Get filename from query params or headers
        const filename = (req.query.filename as string) || (req.headers['x-filename'] as string) || 'terms-conditions.pdf';
        const contentType = req.headers['content-type'] || 'application/pdf';

        // Create a unique filename with timestamp
        const timestamp = Date.now();
        const fileExtension = filename.split('.').pop();
        const uniqueFilename = `terms-conditions-${timestamp}.${fileExtension}`;

        // Upload to Vercel Blob
        const blob = await put(uniqueFilename, buffer, {
            access: 'public',
            contentType,
        });

        res.status(200).json({
            downloadUrl: blob.url,
        });

    } catch (error) {
        console.error('Upload terms error:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// Terms & Conditions delete endpoint
app.delete("/api/delete-terms", async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Delete the file from Vercel Blob
        await del(url);

        res.status(200).json({ success: true });

    } catch (error) {
        console.error('Delete terms error:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Email API Server running at http://localhost:${PORT}`);
    console.log(
        `📧 Resend API Key: ${
            process.env.RESEND_API_KEY ? "✅ Configured" : "❌ Missing"
        }`
    );
    console.log(
        `📤 From Email: ${process.env.RESEND_FROM_EMAIL || "Not configured"}`
    );
});
