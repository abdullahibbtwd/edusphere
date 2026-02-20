export const getVerificationEmailTemplate = (name: string, code: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">EduSphere</h1>
              <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 14px;">Educational Excellence Platform</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #1a202c; font-size: 24px; font-weight: 600;">Verify Your Email Address</h2>
              
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Hello <strong>${name}</strong>,
              </p>
              
              <p style="margin: 0 0 30px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Thank you for registering with EduSphere! To complete your registration and activate your account, please use the verification code below:
              </p>
              
              <!-- Verification Code Box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 20px; display: inline-block;">
                      <p style="margin: 0; color: #e0e7ff; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                      <p style="margin: 10px 0 0; color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                        ${code}
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                This code will <strong>expire in 24 hours</strong> for security reasons.
              </p>
              
              <p style="margin: 0 0 30px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                If you didn't create an account with EduSphere, please ignore this email.
              </p>
              
              <!-- Divider -->
              <div style="border-top: 1px solid #e2e8f0; margin: 30px 0;"></div>
              
              <p style="margin: 0; color: #718096; font-size: 14px; line-height: 1.6;">
                Need help? Contact our support team at <a href="mailto:support@edusphere.com" style="color: #667eea; text-decoration: none;">support@edusphere.com</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px; color: #a0aec0; font-size: 12px;">
                © ${new Date().getFullYear()} EduSphere. All rights reserved.
              </p>
              <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                This is an automated email, please do not reply.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

export const getPasswordResetEmailTemplate = (name: string, code: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">EduSphere</h1>
              <p style="margin: 10px 0 0; color: #ffe0e6; font-size: 14px;">Password Reset Request</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #1a202c; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
              
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Hello <strong>${name}</strong>,
              </p>
              
              <p style="margin: 0 0 30px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password. Use the code below to reset your password:
              </p>
              
              <!-- Reset Code Box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 8px; padding: 20px; display: inline-block;">
                      <p style="margin: 0; color: #ffe0e6; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Your Reset Code</p>
                      <p style="margin: 10px 0 0; color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                        ${code}
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                This code will <strong>expire in 1 hour</strong> for security reasons.
              </p>
              
              <div style="background-color: #fff5f5; border-left: 4px solid #f56565; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #742a2a; font-size: 14px; font-weight: 500;">
                  ⚠️ If you didn't request a password reset, please ignore this email or contact support if you're concerned about your account security.
                </p>
              </div>
              
              <!-- Divider -->
              <div style="border-top: 1px solid #e2e8f0; margin: 30px 0;"></div>
              
              <p style="margin: 0; color: #718096; font-size: 14px; line-height: 1.6;">
                Need help? Contact our support team at <a href="mailto:support@edusphere.com" style="color: #f5576c; text-decoration: none;">support@edusphere.com</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px; color: #a0aec0; font-size: 12px;">
                © ${new Date().getFullYear()} EduSphere. All rights reserved.
              </p>
              <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                This is an automated email, please do not reply.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

export const getSchoolApprovalEmailTemplate = (schoolName: string, subdomain: string, principalName: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>School Application Approved</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🎉 Congratulations!</h1>
              <p style="margin: 10px 0 0; color: #d1fae5; font-size: 14px;">Your School Application Has Been Approved</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #1a202c; font-size: 24px; font-weight: 600;">Welcome to EduSphere!</h2>
              
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Dear <strong>${principalName}</strong>,
              </p>
              
              <p style="margin: 0 0 30px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                We are thrilled to inform you that <strong>${schoolName}</strong>'s application to join the EduSphere platform has been <strong style="color: #10b981;">approved</strong>!
              </p>
              
              <!-- School Details Box -->
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 15px; color: #065f46; font-size: 18px; font-weight: 600;">Your School Portal</h3>
                <p style="margin: 0 0 10px; color: #065f46; font-size: 14px;">
                  <strong>School Name:</strong> ${schoolName}
                </p>
                <p style="margin: 0 0 10px; color: #065f46; font-size: 14px;">
                  <strong>Portal URL:</strong> <a href="https://${subdomain}.edusphere.com" style="color: #059669; text-decoration: none; font-weight: 600;">${subdomain}.edusphere.com</a>
                </p>
              </div>
              
              <h3 style="margin: 30px 0 15px; color: #1a202c; font-size: 18px; font-weight: 600;">Next Steps:</h3>
              
              <ol style="margin: 0 0 30px; padding-left: 20px; color: #4a5568; font-size: 16px; line-height: 1.8;">
                <li>Access your school portal at <a href="https://${subdomain}.edusphere.com" style="color: #10b981; text-decoration: none; font-weight: 500;">${subdomain}.edusphere.com</a></li>
                <li>Set up your school profile and customize settings</li>
                <li>Add teachers, students, and classes</li>
                <li>Start managing your school operations efficiently</li>
              </ol>
              
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #1e40af; font-size: 14px; font-weight: 500;">
                  💡 <strong>Tip:</strong> Check your inbox for a separate email with your admin credentials and setup instructions.
                </p>
              </div>
              
              <!-- Divider -->
              <div style="border-top: 1px solid #e2e8f0; margin: 30px 0;"></div>
              
              <p style="margin: 0; color: #718096; font-size: 14px; line-height: 1.6;">
                Need help getting started? Contact our support team at <a href="mailto:support@edusphere.com" style="color: #10b981; text-decoration: none;">support@edusphere.com</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px; color: #a0aec0; font-size: 12px;">
                © ${new Date().getFullYear()} EduSphere. All rights reserved.
              </p>
              <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                This is an automated email, please do not reply.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

export const getSchoolRejectionEmailTemplate = (schoolName: string, principalName: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>School Application Status Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">EduSphere</h1>
              <p style="margin: 10px 0 0; color: #fecaca; font-size: 14px;">School Application Status Update</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #1a202c; font-size: 24px; font-weight: 600;">Application Status Update</h2>
              
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Dear <strong>${principalName}</strong>,
              </p>
              
              <p style="margin: 0 0 30px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Thank you for your interest in joining the EduSphere platform. After careful review of <strong>${schoolName}</strong>'s application, we regret to inform you that we are unable to approve the application at this time.
              </p>
              
              <!-- Rejection Notice Box -->
              <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 10px; color: #7f1d1d; font-size: 16px; font-weight: 600;">Application Status: Not Approved</h3>
                <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                  <strong>School Name:</strong> ${schoolName}
                </p>
              </div>
              
              <h3 style="margin: 30px 0 15px; color: #1a202c; font-size: 18px; font-weight: 600;">What's Next?</h3>
              
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                While this application was not successful, we encourage you to:
              </p>
              
              <ul style="margin: 0 0 30px; padding-left: 20px; color: #4a5568; font-size: 16px; line-height: 1.8;">
                <li>Review the application requirements on our platform</li>
                <li>Ensure all required documentation is complete and accurate</li>
                <li>Contact our support team for guidance on the application process</li>
                <li>Submit a new application when you're ready</li>
              </ul>
              
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #1e40af; font-size: 14px; font-weight: 500;">
                  💡 <strong>Note:</strong> We're here to help! If you have any questions about the application process or need clarification, please don't hesitate to reach out to our support team.
                </p>
              </div>
              
              <!-- Divider -->
              <div style="border-top: 1px solid #e2e8f0; margin: 30px 0;"></div>
              
              <p style="margin: 0; color: #718096; font-size: 14px; line-height: 1.6;">
                Need assistance? Contact our support team at <a href="mailto:support@edusphere.com" style="color: #ef4444; text-decoration: none;">support@edusphere.com</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px; color: #a0aec0; font-size: 12px;">
                © ${new Date().getFullYear()} EduSphere. All rights reserved.
              </p>
              <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                This is an automated email, please do not reply.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};
