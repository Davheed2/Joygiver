import {
	EmailJobData,
	OtpEmailData,
	ResetPasswordData,
	ForgotPasswordData,
	WelcomeEmailData,
	LoginEmailData,
} from '@/common/interfaces';
import { logger } from '@/common/utils';
import { Resend } from 'resend';
import { ENVIRONMENT } from 'src/common/config';
import { forgotPasswordEmail, loginEmail, otpEmail, resetPasswordEmail, welcomeEmail } from '../templates';

const resend = new Resend(ENVIRONMENT.EMAIL.RESEND_API_KEY);

export const sendEmail = async (job: EmailJobData) => {
	const { data, type } = job as EmailJobData;

	let htmlContent: string;
	let subject: string;

	switch (type) {
		case 'otpEmail':
			htmlContent = otpEmail(data as OtpEmailData);
			subject = 'OTP Verification';
			break;
		case 'welcomeEmail':
			htmlContent = welcomeEmail(data as WelcomeEmailData);
			subject = 'Welcome to Millennia Trades';
			break;
		case 'loginEmail':
			htmlContent = loginEmail(data as LoginEmailData);
			subject = 'Login Alert';
			break;
		case 'forgotPassword':
			htmlContent = forgotPasswordEmail(data as ForgotPasswordData);
			subject = 'Forgot Password';
			break;
		case 'resetPassword':
			htmlContent = resetPasswordEmail(data as ResetPasswordData);
			subject = 'Reset Password';
			break;
		// Handle other email types...
		default:
			throw new Error(`No template found for email type: ${type}`);
	}

	try {
		const result = await resend.emails.send({
			from: 'JOYGIVER <updates@joygiver.co>',
			to: data.to,
			subject: subject,
			html: htmlContent,
		});

		console.log(result);
		logger.info(`Email successfully sent to ${data.to}`);
	} catch (error) {
		console.error(error);
		logger.error(`Failed to send email to ${data.to}: ${error}`);
	}
};
