import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export const sendSMS = async (to, body) => {
  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE, // número Twilio verificado
      to
    });

    console.log('[TWILIO] SMS enviado:', message.sid);
    return message;
  } catch (err) {
    console.error('[TWILIO ERROR]', err);
    throw err;
  }
};
