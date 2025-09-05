import express from 'express';
import { createServer as createViteServer } from 'vite';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

async function createServer() {
  const app = express();
  
  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  });
  
  // Parse JSON bodies
  app.use(express.json());
  
  // Initialize Resend (server-side) with validation
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not set in environment variables');
    process.exit(1);
  }
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  // Email API endpoint
  app.post('/api/send-email', async (req, res) => {
    try {
      const { to, subject, html, text, from, replyTo, cc, bcc, scheduledAt } = req.body;

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
        from: from || process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com',
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
        replyTo: replyTo,
        cc: ccArray,
        bcc: bccArray,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined
      });

      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      res.json({ 
        success: true, 
        messageId: result.data?.id 
      });

    } catch (error) {
      console.error('Email API Error:', error);
      res.status(500).json({ 
        error: 'Failed to send email' 
      });
    }
  });

  app.post('/api/cancel-email', async (req, res) => {
    try {
      const { emailId } = req.body;

      const result = await resend.emails.cancel(emailId);

      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      res.json({ 
        success: true, 
        messageId: result.data?.id 
      });

    } catch (error) {
      console.error('Email API Error:', error);
      res.status(500).json({ 
        error: 'Failed to send email' 
      });
    }
  });
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
  // Test email service endpoint
  app.get('/api/email-status', async (req, res) => {
    try {
      const apiKey = process.env.RESEND_API_KEY;
      const fromEmail = process.env.RESEND_FROM_EMAIL;
      
      res.json({
        configured: !!apiKey,
        fromEmailConfigured: !!fromEmail && fromEmail !== 'noreply@yourdomain.com',
        status: 'operational'
      });
    } catch (statusError) {
      console.error('Email status check failed:', statusError);
      res.status(500).json({
        error: 'Service check failed'
      });
    }
  });
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
  // Serve static files
  app.use(vite.middlewares);

  // Handle all other routes with Vite SSR
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // 1. Read index.html
      let template = await vite.transformIndexHtml(url, `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Spective Talent Flow</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
      `);

      // 2. Apply Vite HTML transforms
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      // If an error is caught, let Vite fix the stracktrace so it maps back to
      // your actual source code.
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  return app;
}

createServer().then(app => {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
});
