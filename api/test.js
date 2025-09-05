export default function handler(req, res) {
  res.status(200).json({
    message: 'API is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
    method: req.method,
    env: {
      hasResendKey: !!process.env.RESEND_API_KEY,
      hasFromEmail: !!process.env.RESEND_FROM_EMAIL,
      nodeVersion: process.version
    }
  });
}
