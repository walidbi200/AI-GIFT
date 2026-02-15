import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkRateLimit, generalRateLimit } from './middleware/rateLimit';
import { EmailSchema, validateAndSanitize, formatValidationErrors } from '../src/utils/validation';

const allowedOrigins = [
    'https://www.smartgiftfinder.xyz',
    'https://smartgiftfinder.xyz',
];

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // CORS
    const origin = req.headers.origin || '';
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS first
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Then check POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Rate limiting (stricter for email signups to prevent spam)
    const rateLimitPassed = await checkRateLimit(req, res, generalRateLimit);
    if (!rateLimitPassed) {
        return;
    }

    try {
        // Validate email with Zod
        const validation = validateAndSanitize(EmailSchema, req.body);

        if (!validation.success) {
            const errors = formatValidationErrors(validation.errors);
            return res.status(400).json({
                error: 'Invalid input',
                validationErrors: errors,
            });
        }

        const { email, name } = validation.data;

        // TODO: Integrate with Mailchimp or email service
        // For now, just log and return success
        console.log('[EMAIL SIGNUP]', email, name);

        // In production, add to Mailchimp:
        /*
        const response = await fetch(
          `https://${process.env.MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email_address: email,
              status: 'subscribed',
              merge_fields: name ? { FNAME: name } : {},
              tags: ['Website Signup'],
            }),
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to subscribe');
        }
        */

        return res.status(200).json({
            success: true,
            message: 'Successfully subscribed to newsletter',
            redirectUrl: '/thank-you'
        });

    } catch (error) {
        console.error('[SUBSCRIBE ERROR]', error);

        return res.status(500).json({
            error: 'Failed to subscribe',
            message: 'Please try again later',
        });
    }
}
