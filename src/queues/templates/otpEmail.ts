import { baseTemplate } from './baseTemplate';

export const otpEmail = (data: { name: string; otp: string }) => {
	const greeting = data.name ? `<h2>Hello, ${data.name}!</h2>` : '<h2>Hello!</h2>';

	return baseTemplate(
		`${greeting}
        <p>
            We received a request to log in to your Ride account. To proceed, please use the One-Time Password (OTP) below:
        </p>

        <table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                 <tr>
                    <td align="center">
                    <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                            <td>
                                <span style="font-size: 22px; font-weight: bold;">
                                    ${data.otp}
                                </span>
                            </td>
                        </tr>
                    </table>
                    </td>
                 </tr>
                </table>
              </td>
            </tr>
        </table>

        <p>
            This OTP is valid for *5 minutes*. If you did not attempt to log in, please ignore this email or contact our support team immediately.
        </p>

        <p>Thanks,<br />The Joygiver Team</p>`
	);
};
