import { Resend } from 'resend';
import { getVerificationEmailTemplate, getPasswordResetEmailTemplate } from './email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
    type?: 'verification' | 'password-reset' | 'general';
}

export async function sendEmail({ to, subject, html, type = 'general' }: SendEmailParams) {
    try {
        if (!process.env.RESEND_API_KEY) {
            throw new Error('Resend API key not configured');
        }

        const fromEmail = 'onboarding@resend.dev'; // Resend's default testing domain

        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: [to],
            subject,
            html,
        });

        if (error) {
            console.error('Resend error:', error);
            throw new Error(error.message || 'Failed to send email');
        }

        console.log(`📧 Email sent successfully (${type}):`, data?.id);

        return {
            success: true,
            messageId: data?.id,
        };
    } catch (error) {
        console.error('Error sending email:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

export async function sendVerificationEmail(email: string, name: string, code: string) {
    const html = getVerificationEmailTemplate(name, code);

    return sendEmail({
        to: email,
        subject: '🔐 Verify Your EduSphere Account',
        html,
        type: 'verification',
    });
}

export async function sendPasswordResetEmail(email: string, name: string, code: string) {
    const html = getPasswordResetEmailTemplate(name, code);

    return sendEmail({
        to: email,
        subject: '🔑 Reset Your EduSphere Password',
        html,
        type: 'password-reset',
    });
}

export async function sendSchoolApprovalEmail(email: string, schoolName: string, subdomain: string, principalName: string) {
    const { getSchoolApprovalEmailTemplate } = await import('./email-templates');
    const html = getSchoolApprovalEmailTemplate(schoolName, subdomain, principalName);

    return sendEmail({
        to: email,
        subject: '🎉 Congratulations! Your School Application Has Been Approved',
        html,
        type: 'general',
    });
}

export async function sendSchoolRejectionEmail(email: string, schoolName: string, principalName: string) {
    const { getSchoolRejectionEmailTemplate } = await import('./email-templates');
    const html = getSchoolRejectionEmailTemplate(schoolName, principalName);

    return sendEmail({
        to: email,
        subject: '📋 School Application Status Update - EduSphere',
        html,
        type: 'general',
    });
}
