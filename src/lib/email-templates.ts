export function getVerificationEmailTemplate(name: string, code: string) {
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

export function getPasswordResetEmailTemplate(name: string, code: string) {
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
}

export function getStudentAdmissionEmailTemplate(studentName: string, schoolName: string, className: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admission Confirmed</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🎉 Admission Confirmed!</h1>
              <p style="margin: 10px 0 0; color: #d1fae5; font-size: 14px;">Welcome to ${schoolName}</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #1a202c; font-size: 24px; font-weight: 600;">Congratulations, ${studentName}!</h2>
              
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                We are delighted to inform you that your application for admission to <strong>${schoolName}</strong> has been approved.
              </p>
              
              <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <p style="margin: 0 0 10px; color: #065f46; font-size: 16px;">
                  <strong>Assigned Class:</strong> ${className}
                </p>
                <p style="margin: 0; color: #065f46; font-size: 16px;">
                  <strong>Status:</strong> Admitted
                </p>
              </div>
              
              <p style="margin: 0 0 30px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                You are now officially a student at ${schoolName}. We are excited to have you join our academic community and look forward to your contributions and success.
              </p>
              
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #1e40af; font-size: 14px; font-weight: 500;">
                  💡 <strong>Next Steps:</strong> Please visit the school office to complete your registration and pick up your school supplies and timetable.
                </p>
              </div>
              
              <!-- Divider -->
              <div style="border-top: 1px solid #e2e8f0; margin: 30px 0;"></div>
              
              <p style="margin: 0; color: #718096; font-size: 14px; line-height: 1.6;">
                If you have any questions, please contact the school administration.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px; color: #a0aec0; font-size: 12px;">
                © ${new Date().getFullYear()} ${schoolName}. Powered by EduSphere.
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
}

export function getStudentRejectionEmailTemplate(studentName: string, schoolName: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #64748b 0%, #475569 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Application Update</h1>
              <p style="margin: 10px 0 0; color: #cbd5e1; font-size: 14px;">${schoolName}</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #1a202c; font-size: 24px; font-weight: 600;">Dear ${studentName},</h2>
              
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Thank you for your interest in <strong>${schoolName}</strong>. After careful consideration of your application, we regret to inform you that we are unable to offer you admission at this time.
              </p>
              
              <p style="margin: 0 0 30px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                This decision was made after a thorough review of all applications. We appreciate the time and effort you put into your application and wish you the best in your future academic endeavors.
              </p>
              
              <!-- Divider -->
              <div style="border-top: 1px solid #e2e8f0; margin: 30px 0;"></div>
              
              <p style="margin: 0; color: #718096; font-size: 14px; line-height: 1.6;">
                Regards,<br>
                Admissions Committee<br>
                ${schoolName}
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px; color: #a0aec0; font-size: 12px;">
                © ${new Date().getFullYear()} ${schoolName}. Powered by EduSphere.
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
}

export function getStudentRegistrationEmailTemplate(studentName: string, schoolName: string, regNumber: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Student Registration Complete</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Student Registration</h1>
              <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 14px;">Official Student Credentials</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: 600;">Welcome, ${studentName}!</h2>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Your registration at <strong>${schoolName}</strong> is now complete. You have been assigned an official registration number.
              </p>
              
              <div style="background-color: #f3f4f6; border: 2px dashed #4f46e5; padding: 25px; margin: 30px 0; border-radius: 12px; text-align: center;">
                <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Your Registration Number</p>
                <p style="margin: 0; color: #4f46e5; font-size: 32px; font-weight: 800; font-family: 'Courier New', monospace; letter-spacing: 2px;">
                  ${regNumber}
                </p>
              </div>
              
              <h3 style="margin: 30px 0 15px; color: #111827; font-size: 18px; font-weight: 600;">Student Records Portal</h3>
              <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Use your registration number and password to access the student dashboard, view your timetable, attendance records, and track your academic progress.
              </p>
              
              <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 500;">
                  📌 <strong>Important:</strong> Keep this registration number safe as it will be required for all your official student activities.
                </p>
              </div>
              
              <!-- Divider -->
              <div style="border-top: 1px solid #e5e7eb; margin: 30px 0;"></div>
              
              <p style="margin: 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                Best regards,<br>
                Registrar's Office<br>
                ${schoolName}
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 5px; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} ${schoolName}. All rights reserved.
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
}

export function getFeePaymentEmailTemplate(data: {
  studentName: string,
  schoolName: string,
  sessionName: string,
  term: string,
  amountPaid: number,
  totalPaid: number,
  totalDue: number,
  method: string,
  reference: string
}) {
  const balance = data.totalDue - data.totalPaid;
  const paymentStatus = balance <= 0 ? "PAID IN FULL" : `BALANCE DUE: ₦${balance.toLocaleString()}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Success Banner -->
          <tr>
            <td style="background-color: #059669; padding: 15px; text-align: center;">
              <p style="margin: 0; color: #ffffff; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">Payment Successful</p>
            </td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #1e293b; font-size: 24px; font-weight: 800;">Receipt from ${data.schoolName}</h1>
              <p style="margin: 10px 0 0; color: #64748b; font-size: 16px;">Fee Payment Confirmation</p>
            </td>
          </tr>
          
          <!-- Receipt Summary -->
          <tr>
            <td style="padding: 0 30px;">
              <div style="background-color: #f8fafc; border-radius: 8px; padding: 30px; text-align: center;">
                <p style="margin: 0 0 10px; color: #64748b; font-size: 14px; font-weight: 600; text-transform: uppercase;">Amount Paid</p>
                <p style="margin: 0; color: #059669; font-size: 40px; font-weight: 800;">₦${data.amountPaid.toLocaleString()}</p>
                <p style="margin: 15px 0 0; color: #64748b; font-size: 13px;">Transaction Ref: ${data.reference}</p>
              </div>
            </td>
          </tr>

          <!-- Details Table -->
          <tr>
            <td style="padding: 40px 30px;">
              <h3 style="margin: 0 0 20px; color: #1e293b; font-size: 16px; font-weight: 700; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">Payment Breakdown</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Student Name</td>
                  <td align="right" style="padding: 10px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${data.studentName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Academic Session</td>
                  <td align="right" style="padding: 10px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${data.sessionName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Term / Plan</td>
                  <td align="right" style="padding: 10px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${data.term.replace('_', ' ')}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Payment Method</td>
                  <td align="right" style="padding: 10px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${data.method}</td>
                </tr>
                <tr>
                  <td style="padding: 20px 0 10px; border-top: 1px solid #f1f5f9; color: #64748b; font-size: 14px;">Total session/term Fee</td>
                  <td align="right" style="padding: 20px 0 10px; border-top: 1px solid #f1f5f9; color: #1e293b; font-size: 14px; font-weight: 600;">₦${data.totalDue.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Total Paid to Date</td>
                  <td align="right" style="padding: 10px 0; color: #059669; font-size: 14px; font-weight: 700;">₦${data.totalPaid.toLocaleString()}</td>
                </tr>
              </table>

              <!-- Status Box -->
              <div style="margin-top: 30px; padding: 15px; background-color: ${balance <= 0 ? '#ecfdf5' : '#fff7ed'}; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: ${balance <= 0 ? '#065f46' : '#9a3412'}; font-size: 14px; font-weight: 800; letter-spacing: 0.05em;">${paymentStatus}</p>
              </div>

              <!-- CTA -->
              <div style="margin-top: 40px; text-align: center;">
                <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
                  View your complete financial history and download official receipts on the student dashboard.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #f1f5f9;">
              <p style="margin: 0 0 5px; color: #94a3b8; font-size: 12px;">This is a system-generated receipt for your records.</p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">Questions? Contact the Bursar's Office at ${data.schoolName}.</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function getUnpaidFeeReminderEmailTemplate(data: {
  studentName: string,
  schoolName: string,
  sessionName: string,
  term: string,
  amountDue: number,
  amountPaid: number,
  dueDate?: string
}) {
  const balance = data.amountDue - data.amountPaid;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fff1f2;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff1f2; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); overflow: hidden; border-top: 6px solid #e11d48;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <div style="width: 60px; height: 60px; background-color: #fff1f2; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <span style="font-size: 30px;">🔔</span>
              </div>
              <h1 style="margin: 0; color: #9f1239; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Payment Reminder</h1>
              <p style="margin: 10px 0 0; color: #4b5563; font-size: 16px;">Outstanding School Fees Notice</p>
            </td>
          </tr>
          
          <!-- Alert Box -->
          <tr>
            <td style="padding: 0 30px;">
              <div style="background-color: #fff1f2; border: 1px solid #fda4af; border-radius: 8px; padding: 25px; text-align: center;">
                <p style="margin: 0 0 10px; color: #9f1239; font-size: 14px; font-weight: 700; text-transform: uppercase;">Outstanding Balance</p>
                <p style="margin: 0; color: #e11d48; font-size: 40px; font-weight: 800;">₦${balance.toLocaleString()}</p>
                ${data.dueDate ? `<p style="margin: 15px 0 0; color: #9f1239; font-size: 13px; font-weight: 600;">Due Date: ${data.dueDate}</p>` : ''}
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Dear <strong>${data.studentName}</strong> and Guardian,
              </p>
              <p style="margin: 0 0 25px; color: #4b5563; font-size: 15px; line-height: 1.6;">
                This is a friendly reminder from <strong>${data.schoolName}</strong> regarding your outstanding school fees for the <strong>${data.sessionName}</strong>, <strong>${data.term.replace('_', ' ')}</strong>.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px;">Total Amount Due</td>
                  <td align="right" style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-size: 14px; font-weight: 600;">₦${data.amountDue.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px;">Amount Paid to Date</td>
                  <td align="right" style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #059669; font-size: 14px; font-weight: 600;">₦${data.amountPaid.toLocaleString()}</td>
                </tr>
                <tr style="background-color: #fafafa;">
                  <td style="padding: 15px 10px; color: #9f1239; font-size: 15px; font-weight: 700;">Remaining Balance</td>
                  <td align="right" style="padding: 15px 10px; color: #e11d48; font-size: 18px; font-weight: 800;">₦${balance.toLocaleString()}</td>
                </tr>
              </table>

              <div style="background-color: #fefce8; border-left: 4px solid #eab308; padding: 15px; border-radius: 4px; margin-bottom: 30px;">
                <p style="margin: 0; color: #854d0e; font-size: 14px; line-height: 1.5;">
                  <strong>Note:</strong> Timely payment of school fees is essential to ensure uninterrupted access to academic resources, examinations, and other school facilities.
                </p>
              </div>

              <div style="text-align: center;">
                <p style="margin: 0 0 20px; color: #4b5563; font-size: 14px;">Payments can be made via bank transfer or online through the student portal.</p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #f3f4f6;">
              <p style="margin: 0 0 5px; color: #9ca3af; font-size: 12px;">Bursar's Office, ${data.schoolName}</p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">This is an automated reminder. If you have already made this payment, please disregard this email.</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
