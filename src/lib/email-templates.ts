import { EmailOptions } from './email-service';

/**
 * Email template utilities and pre-built templates
 */

export interface TemplateVariables {
  [key: string]: string | number | boolean;
}

export class EmailTemplates {
  /**
   * Replace template variables in a string
   */
  static replaceVariables(template: string, variables: TemplateVariables): string {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, String(value));
    });
    return result;
  }

  /**
   * Welcome email template
   */
  static welcomeEmail(variables: {
    userName: string;
    userEmail: string;
    loginUrl?: string;
  }): EmailOptions {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Spective</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #ffffff; padding: 30px; border: 1px solid #e9ecef; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6c757d; }
          .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Spective!</h1>
          </div>
          <div class="content">
            <h2>Hello {{ userName }}!</h2>
            <p>Thank you for joining Spective. We're excited to have you on board!</p>
            <p>Your account has been successfully created with the email address: <strong>{{ userEmail }}</strong></p>
            
            ${variables.loginUrl ? `
            <p>To get started, click the button below to access your dashboard:</p>
            <a href="{{ loginUrl }}" class="button">Access Dashboard</a>
            ` : ''}
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            <p>Best regards,<br>The Spective Kft.</p>
          </div>
          <div class="footer">
            <p>© 2025 Spective . All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Welcome to Spective !
      
      Hello {{ userName }}!
      
      Thank you for joining Spective . We're excited to have you on board!
      
      Your account has been successfully created with the email address: {{ userEmail }}
      
      ${variables.loginUrl ? `To get started, visit: {{ loginUrl }}` : ''}
      
      If you have any questions or need assistance, please don't hesitate to contact our support team.
      
      Best regards,
      The Spective Kft.
      
      © 2025 Spective . All rights reserved.
    `;

    return {
      to: variables.userEmail,
      subject: 'Welcome to Spective !',
      html: this.replaceVariables(htmlContent, variables),
      text: this.replaceVariables(textContent, variables),
    };
  }

  /**
   * Password reset email template
   */
  static passwordResetEmail(variables: {
    userName: string;
    userEmail: string;
    resetUrl: string;
    expiresIn?: string;
  }): EmailOptions {
    const expiresIn = variables.expiresIn || '1 hour';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #ffffff; padding: 30px; border: 1px solid #e9ecef; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6c757d; }
          .button { display: inline-block; padding: 12px 24px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello {{ userName }}!</h2>
            <p>We received a request to reset your password for your Spective  account.</p>
            
            <p>To reset your password, click the button below:</p>
            <a href="{{ resetUrl }}" class="button">Reset Password</a>
            
            <div class="warning">
              <strong>Important:</strong> This link will expire in {{ expiresIn }}. If you didn't request this password reset, please ignore this email.
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p><a href="{{ resetUrl }}">{{ resetUrl }}</a></p>
            
            <p>For security reasons, this link can only be used once.</p>
            
            <p>Best regards,<br>The Spective Kft.</p>
          </div>
          <div class="footer">
            <p>© 2025 Spective . All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Password Reset Request
      
      Hello {{ userName }}!
      
      We received a request to reset your password for your Spective  account.
      
      To reset your password, visit this link: {{ resetUrl }}
      
      IMPORTANT: This link will expire in {{ expiresIn }}. If you didn't request this password reset, please ignore this email.
      
      For security reasons, this link can only be used once.
      
      Best regards,
      The Spective Kft.
      
      © 2025 Spective . All rights reserved.
    `;

    const templateVars = { ...variables, expiresIn };

    return {
      to: variables.userEmail,
      subject: 'Password Reset Request - Spective ',
      html: this.replaceVariables(htmlContent, templateVars),
      text: this.replaceVariables(textContent, templateVars),
    };
  }

  /**
   * Email verification template
   */
  static emailVerificationEmail(variables: {
    userName: string;
    userEmail: string;
    verificationUrl: string;
    expiresIn?: string;
  }): EmailOptions {
    const expiresIn = variables.expiresIn || '24 hours';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email Address</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #ffffff; padding: 30px; border: 1px solid #e9ecef; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6c757d; }
          .button { display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email Address</h1>
          </div>
          <div class="content">
            <h2>Hello {{ userName }}!</h2>
            <p>Thank you for signing up for Spective . To complete your registration, please verify your email address.</p>
            
            <p>Click the button below to verify your email:</p>
            <a href="{{ verificationUrl }}" class="button">Verify Email Address</a>
            
            <p>This verification link will expire in {{ expiresIn }}.</p>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p><a href="{{ verificationUrl }}">{{ verificationUrl }}</a></p>
            
            <p>If you didn't create an account with us, please ignore this email.</p>
            
            <p>Best regards,<br>The Spective Kft.</p>
          </div>
          <div class="footer">
            <p>© 2025 Spective . All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Verify Your Email Address
      
      Hello {{ userName }}!
      
      Thank you for signing up for Spective . To complete your registration, please verify your email address.
      
      Click this link to verify your email: {{ verificationUrl }}
      
      This verification link will expire in {{ expiresIn }}.
      
      If you didn't create an account with us, please ignore this email.
      
      Best regards,
      The Spective Kft.
      
      © 2025 Spective . All rights reserved.
    `;

    const templateVars = { ...variables, expiresIn };

    return {
      to: variables.userEmail,
      subject: 'Verify Your Email Address - Spective ',
      html: this.replaceVariables(htmlContent, templateVars),
      text: this.replaceVariables(textContent, templateVars),
    };
  }

  /**
   * Company approval email template
   */
  static companyApprovalEmail(variables: {
    companyName: string;
    contactPerson: string;
    userEmail: string;
    loginUrl?: string;
  }): EmailOptions {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Company Profile Has Been Approved!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #d4f5d4; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #ffffff; padding: 30px; border: 1px solid #e9ecef; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6c757d; }
          .button { display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .success-badge { background-color: #28a745; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #28a745; margin: 0;">🎉 Company Approved!</h1>
            <div class="success-badge" style="margin-top: 10px;">Profile Activated</div>
          </div>
          <div class="content">
            <h2>Hello {{ contactPerson }}!</h2>
            <p>Excellent news! <strong>{{ companyName }}</strong>'s company profile has been approved by our admin team.</p>
            <p>You can now:</p>
            <ul>
              <li>✅ Access your company dashboard</li>
              <li>✅ Browse and search professional profiles</li>
              <li>✅ Contact professionals you're interested in</li>
              <li>✅ Manage your company information</li>
              <li>✅ Save professionals to your favorites</li>
            </ul>
            
            ${variables.loginUrl ? `
            <p>Ready to start finding talent? Click the button below to access your dashboard:</p>
            <a href="{{ loginUrl }}" class="button">Access Company Dashboard</a>
            ` : ''}
            
            <p>Welcome to Spective ! We're excited to help you find the perfect talent for your company.</p>
            <p>Best regards,<br>The Spective Kft.</p>
          </div>
          <div class="footer">
            <p>© 2025 Spective . All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      🎉 Company Approved!
      
      Hello {{ contactPerson }}!
      
      Excellent news! {{ companyName }}'s company profile has been approved by our admin team.
      
      You can now:
      ✅ Access your company dashboard
      ✅ Browse and search professional profiles
      ✅ Contact professionals you're interested in
      ✅ Manage your company information
      ✅ Save professionals to your favorites
      
      ${variables.loginUrl ? `Ready to start finding talent? Visit: {{ loginUrl }}` : ''}
      
      Welcome to Spective ! We're excited to help you find the perfect talent for your company.
      
      Best regards,
      The Spective Kft.
      
      © 2025 Spective . All rights reserved.
    `;

    return {
      to: variables.userEmail,
      subject: '🎉 Your Company Profile Has Been Approved!',
      html: this.replaceVariables(htmlContent, variables),
      text: this.replaceVariables(textContent, variables),
    };
  }

  /**
   * Company rejection email template
   */
  static companyRejectionEmail(variables: {
    companyName: string;
    contactPerson: string;
    userEmail: string;
    reason?: string;
    supportEmail?: string;
  }): EmailOptions {
    const supportEmail = variables.supportEmail || 'support@spective-talent-flow.com';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Update on Your Company Profile Application</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #fff3cd; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #ffffff; padding: 30px; border: 1px solid #e9ecef; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6c757d; }
          .button { display: inline-block; padding: 12px 24px; background-color: #ffc107; color: #212529; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .warning-badge { background-color: #ffc107; color: #212529; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; }
          .reason-box { background-color: #f8f9fa; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #856404; margin: 0;">Company Profile Application Update</h1>
            <div class="warning-badge" style="margin-top: 10px;">Requires Attention</div>
          </div>
          <div class="content">
            <h2>Hello {{ contactPerson }},</h2>
            <p>Thank you for <strong>{{ companyName }}</strong>'s interest in joining Spective .</p>
            <p>After reviewing your company profile application, we need to inform you that it does not meet our current requirements for approval.</p>
            
            ${variables.reason ? `
            <div class="reason-box">
              <h4 style="margin-top: 0; color: #856404;">Reason for rejection:</h4>
              <p style="margin-bottom: 0;">{{ reason }}</p>
            </div>
            ` : ''}
            
            <p>This decision is not final. We encourage you to:</p>
            <ul>
              <li>📧 Contact our support team for detailed feedback</li>
              <li>📝 Review and update your company profile information</li>
              <li>🔄 Reapply once you've addressed the concerns</li>
            </ul>
            
            <p>Our team is here to help your company succeed. Please don't hesitate to reach out if you have any questions or need assistance improving your application.</p>
            
            <a href="mailto:{{ supportEmail }}" class="button">Contact Support Team</a>
            
            <p>Best regards,<br>The Spective Kft.</p>
          </div>
          <div class="footer">
            <p>© 2025 Spective . All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Company Profile Application Update
      
      Hello {{ contactPerson }},
      
      Thank you for {{ companyName }}'s interest in joining Spective .
      
      After reviewing your company profile application, we need to inform you that it does not meet our current requirements for approval.
      
      ${variables.reason ? `Reason for rejection: {{ reason }}` : ''}
      
      This decision is not final. We encourage you to:
      📧 Contact our support team for detailed feedback
      📝 Review and update your company profile information
      🔄 Reapply once you've addressed the concerns
      
      Our team is here to help your company succeed. Please don't hesitate to reach out if you have any questions or need assistance improving your application.
      
      Contact Support: {{ supportEmail }}
      
      Best regards,
      The Spective Kft.
      
      © 2025 Spective . All rights reserved.
    `;

    const templateVars = { ...variables, supportEmail };

    return {
      to: variables.userEmail,
      subject: 'Update on Your Company Profile Application',
      html: this.replaceVariables(htmlContent, templateVars),
      text: this.replaceVariables(textContent, templateVars),
    };
  }

  /**
   * Professional approval email template
   */
  static professionalApprovalEmail(variables: {
    userName: string;
    userEmail: string;
    loginUrl?: string;
  }): EmailOptions {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Professional Profile Has Been Approved!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #d4f5d4; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #ffffff; padding: 30px; border: 1px solid #e9ecef; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6c757d; }
          .button { display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .success-badge { background-color: #28a745; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #28a745; margin: 0;">🎉 Congratulations!</h1>
            <div class="success-badge" style="margin-top: 10px;">Profile Approved</div>
          </div>
          <div class="content">
            <h2>Hello {{ userName }}!</h2>
            <p>Great news! Your professional profile has been approved by our admin team.</p>
            <p>You can now:</p>
            <ul>
              <li>✅ Access your full professional dashboard</li>
              <li>✅ Be discovered by companies looking for talent</li>
              <li>✅ Receive contact requests from interested employers</li>
              <li>✅ Update your profile information anytime</li>
            </ul>
            
            ${variables.loginUrl ? `
            <p>Ready to get started? Click the button below to access your dashboard:</p>
            <a href="{{ loginUrl }}" class="button">Access Your Dashboard</a>
            ` : ''}
            
            <p>Welcome to the Spective  community! We're excited to help you connect with great opportunities.</p>
            <p>Best regards,<br>The Spective Kft.</p>
          </div>
          <div class="footer">
            <p>© 2025 Spective . All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      🎉 Congratulations! Your Professional Profile Has Been Approved!
      
      Hello {{ userName }}!
      
      Great news! Your professional profile has been approved by our admin team.
      
      You can now:
      ✅ Access your full professional dashboard
      ✅ Be discovered by companies looking for talent
      ✅ Receive contact requests from interested employers
      ✅ Update your profile information anytime
      
      ${variables.loginUrl ? `Ready to get started? Visit: {{ loginUrl }}` : ''}
      
      Welcome to the Spective  community! We're excited to help you connect with great opportunities.
      
      Best regards,
      The Spective Kft.
      
      © 2025 Spective . All rights reserved.
    `;

    return {
      to: variables.userEmail,
      subject: '🎉 Your Professional Profile Has Been Approved!',
      html: this.replaceVariables(htmlContent, variables),
      text: this.replaceVariables(textContent, variables),
    };
  }

  /**
   * Professional rejection email template
   */
  static professionalRejectionEmail(variables: {
    userName: string;
    userEmail: string;
    reason?: string;
    supportEmail?: string;
  }): EmailOptions {
    const supportEmail = variables.supportEmail || 'support@spective-talent-flow.com';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Update on Your Professional Profile Application</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #fff3cd; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #ffffff; padding: 30px; border: 1px solid #e9ecef; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6c757d; }
          .button { display: inline-block; padding: 12px 24px; background-color: #ffc107; color: #212529; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .warning-badge { background-color: #ffc107; color: #212529; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; }
          .reason-box { background-color: #f8f9fa; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #856404; margin: 0;">Profile Application Update</h1>
            <div class="warning-badge" style="margin-top: 10px;">Requires Attention</div>
          </div>
          <div class="content">
            <h2>Hello {{ userName }},</h2>
            <p>Thank you for your interest in joining Spective  as a professional.</p>
            <p>After reviewing your profile application, we need to inform you that it does not meet our current requirements for approval.</p>
            
            ${variables.reason ? `
            <div class="reason-box">
              <h4 style="margin-top: 0; color: #856404;">Reason for rejection:</h4>
              <p style="margin-bottom: 0;">{{ reason }}</p>
            </div>
            ` : ''}
            
            <p>This decision is not final. We encourage you to:</p>
            <ul>
              <li>📧 Contact our support team for detailed feedback</li>
              <li>📝 Review and update your profile information</li>
              <li>🔄 Reapply once you've addressed the concerns</li>
            </ul>
            
            <p>Our team is here to help you succeed. Please don't hesitate to reach out if you have any questions or need assistance improving your application.</p>
            
            <a href="mailto:{{ supportEmail }}" class="button">Contact Support Team</a>
            
            <p>Best regards,<br>The Spective Kft.</p>
          </div>
          <div class="footer">
            <p>© 2025 Spective . All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Profile Application Update
      
      Hello {{ userName }},
      
      Thank you for your interest in joining Spective  as a professional.
      
      After reviewing your profile application, we need to inform you that it does not meet our current requirements for approval.
      
      ${variables.reason ? `Reason for rejection: {{ reason }}` : ''}
      
      This decision is not final. We encourage you to:
      📧 Contact our support team for detailed feedback
      📝 Review and update your profile information
      🔄 Reapply once you've addressed the concerns
      
      Our team is here to help you succeed. Please don't hesitate to reach out if you have any questions or need assistance improving your application.
      
      Contact Support: {{ supportEmail }}
      
      Best regards,
      The Spective Kft.
      
      © 2025 Spective . All rights reserved.
    `;

    const templateVars = { ...variables, supportEmail };

    return {
      to: variables.userEmail,
      subject: 'Update on Your Professional Profile Application',
      html: this.replaceVariables(htmlContent, templateVars),
      text: this.replaceVariables(textContent, templateVars),
    };
  }

  /**
   * Notification email template (generic)
   */
  static notificationEmail(variables: {
    userName: string;
    userEmail: string;
    title: string;
    message: string;
    actionUrl?: string;
    actionText?: string;
  }): EmailOptions {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{{ title }}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #ffffff; padding: 30px; border: 1px solid #e9ecef; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6c757d; }
          .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>{{ title }}</h1>
          </div>
          <div class="content">
            <h2>Hello {{ userName }}!</h2>
            <p>{{ message }}</p>
            
            ${variables.actionUrl && variables.actionText ? `
            <a href="{{ actionUrl }}" class="button">{{ actionText }}</a>
            ` : ''}
            
            <p>Best regards,<br>The Spective Kft.</p>
          </div>
          <div class="footer">
            <p>© 2025 Spective . All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      {{ title }}
      
      Hello {{ userName }}!
      
      {{ message }}
      
      ${variables.actionUrl ? `Visit: {{ actionUrl }}` : ''}
      
      Best regards,
      The Spective Kft.
      
      © 2025 Spective . All rights reserved.
    `;

    return {
      to: variables.userEmail,
      subject: variables.title,
      html: this.replaceVariables(htmlContent, variables),
      text: this.replaceVariables(textContent, variables),
    };
  }

  /**
   * Availability reminder email template
   */
  static availabilityReminderEmail(variables: {
    userName: string;
    userEmail: string;
    availableDate: string;
    profileUrl?: string;
  }): EmailOptions {
    const formattedAvailableDate = new Date(variables.availableDate).toLocaleDateString();
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🗓️ Availability Reminder - You're Available Today!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { background-color: #ffffff; padding: 30px; border: 1px solid #e9ecef; }
          .highlight-box { background: #e8f5e8; border: 1px solid #4caf50; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .highlight-box h3 { color: #2e7d32; margin-top: 0; }
          .highlight-box p { margin: 0; color: #2e7d32; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6c757d; }
          .button { display: inline-block; padding: 12px 24px; background-color: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .note { font-size: 14px; color: #777; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Availability Reminder</h1>
          </div>
          <div class="content">
            <h2>Hello {{ userName }}!</h2>
            
            <p style="font-size: 16px; line-height: 1.5; color: #555;">
              This is your scheduled reminder that you set yourself as available from <strong>` + formattedAvailableDate + `</strong>.
            </p>
            
            <div class="highlight-box">
              <h3>🎯 Action Required</h3>
              <p>
                Your profile will be automatically updated to show that you're available for new projects. 
                Companies will be able to contact you for opportunities!
              </p>
            </div>
            
            ${variables.profileUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{ profileUrl }}" class="button">
                View Your Profile
              </a>
            </div>
            ` : ''}
            
            <p class="note">
              If you're not ready to be available yet, you can update your availability status in your profile settings.
            </p>
          </div>
          <div class="footer">
            <p>© 2025 Spective . All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Availability Reminder - You're Available Today!
      
      Hello {{ userName }}!
      
      This is your scheduled reminder that you set yourself as available from {{ formattedAvailableDate }}.
      
      Action Required:
      Your profile will be automatically updated to show that you're available for new projects. 
      Companies will be able to contact you for opportunities!

      ${variables.profileUrl ? `View your profile: {{ profileUrl }}` : ''}
      
      If you're not ready to be available yet, you can update your availability status in your profile settings.
      
      Best regards,
      The Spective Kft.
      
      © 2025 Spective Kft. All rights reserved.
    `;

    return {
      to: variables.userEmail,
      subject: '🗓️ Availability Reminder - You\'re Available Today!',
      html: this.replaceVariables(htmlContent, variables),
      text: this.replaceVariables(textContent, variables),
    };
  }
}
