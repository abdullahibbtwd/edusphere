import { Resend } from 'resend';
import {
    getVerificationEmailTemplate,
    getPasswordResetEmailTemplate,
    getStudentRegistrationEmailTemplate,
    getFeePaymentEmailTemplate,
    getUnpaidFeeReminderEmailTemplate,
    getStudentAdmissionEmailTemplate,
    getStudentRejectionEmailTemplate
} from './email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
    to: string | string[];
    subject: string;
    html: string;
    type?: 'verification' | 'password-reset' | 'general';
}

export async function sendEmail({ to, subject, html, type = 'general' }: SendEmailParams) {
    try {
        if (!process.env.RESEND_API_KEY) {
            throw new Error('Resend API key not configured');
        }

        const fromEmail = 'onboarding@resend.dev';

        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: Array.isArray(to) ? to : [to],
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

export async function sendStudentAdmissionEmail(email: string, studentName: string, schoolName: string, className: string) {
    const html = getStudentAdmissionEmailTemplate(studentName, schoolName, className);

    return sendEmail({
        to: email,
        subject: `🎉 Admission Gallery: Welcome to ${schoolName}`,
        html,
        type: 'general',
    });
}

export async function sendStudentRejectionEmail(email: string, studentName: string, schoolName: string) {
    const html = getStudentRejectionEmailTemplate(studentName, schoolName);

    return sendEmail({
        to: email,
        subject: `Application Status - ${schoolName}`,
        html,
        type: 'general',
    });
}

export async function sendStudentRegistrationEmail(email: string, studentName: string, schoolName: string, regNumber: string) {
    const html = getStudentRegistrationEmailTemplate(studentName, schoolName, regNumber);

    return sendEmail({
        to: email,
        subject: `📝 Student Registration Complete - ${regNumber}`,
        html,
        type: 'general',
    });
}

export async function sendFeePaymentEmail(data: {
    to: string,
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
    const html = getFeePaymentEmailTemplate(data);

    return sendEmail({
        to: data.to,
        subject: `💳 Payment Receipt: ₦${data.amountPaid.toLocaleString()} received`,
        html,
        type: 'general',
    });
}

export async function sendFeeReminderEmail(data: {
    to: string[],
    studentName: string,
    schoolName: string,
    sessionName: string,
    term: string,
    amountDue: number,
    amountPaid: number,
    dueDate?: string
}) {
    const html = getUnpaidFeeReminderEmailTemplate(data);
    const balance = data.amountDue - data.amountPaid;

    return sendEmail({
        to: data.to,
        subject: `⚠️ Payment Reminder: Outstanding balance for ${data.studentName} (₦${balance.toLocaleString()})`,
        html,
        type: 'general',
    });
}
