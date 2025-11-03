import { useState, useEffect } from 'react';
import { emailService } from '@/lib/email-service';

export interface EmailServiceStatus {
  isConfigured: boolean;
  isOperational: boolean;
  error?: string;
  apiKeyStatus: 'valid' | 'invalid' | 'missing';
  fromEmailStatus: 'configured' | 'missing' | 'default';
  usageStats: {
    daily: number;
    monthly: number;
    dailyLimit: number;
    monthlyLimit: number;
  };
}

export const useEmailServiceStatus = () => {
  const [status, setStatus] = useState<EmailServiceStatus>({
    isConfigured: false,
    isOperational: false,
    apiKeyStatus: 'missing',
    fromEmailStatus: 'missing',
    usageStats: {
      daily: 0,
      monthly: 0,
      dailyLimit: 100,
      monthlyLimit: 3000,
    },
  });
  const [loading, setLoading] = useState(true);

  const checkEmailServiceStatus = async () => {
    setLoading(true);
    
    try {
      // Call server-side status endpoint - use relative path in production
      const apiUrl = import.meta.env.VITE_API_URL_ || '';
      const endpoint = apiUrl ? `${apiUrl}/api/email-status` : '/api/email-status';
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers,
      });
      const statusData = await response.json();
      
      if (!response.ok) {
        throw new Error(statusData.error || 'Failed to check email service status');
      }

      const usageStats = emailService.getUsageStats();

      setStatus({
        isConfigured: statusData.configured && statusData.fromEmailConfigured,
        isOperational: statusData.configured && statusData.status === 'operational',
        error: statusData.configured ? undefined : 'Email service not configured',
        apiKeyStatus: statusData.configured ? 'valid' : 'missing',
        fromEmailStatus: statusData.fromEmailConfigured ? 'configured' : 'missing',
        usageStats,
      });

    } catch (error) {
      setStatus(prev => ({
        ...prev,
        isOperational: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkEmailServiceStatus();
  }, []);

  return {
    status,
    loading,
    refreshStatus: checkEmailServiceStatus,
  };
};
