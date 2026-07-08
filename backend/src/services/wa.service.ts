import dotenv from 'dotenv';

dotenv.config();

const WA_GATEWAY_URL = process.env.WA_GATEWAY_URL || 'http://localhost:3000';

export async function sendWhatsAppMessage(targetPhone: string, message: string): Promise<boolean> {
  if (!targetPhone) {
    console.warn('[WA Gateway] No target phone provided, skipping message sending.');
    return false;
  }

  try {
    const response = await fetch(`${WA_GATEWAY_URL}/api/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target: targetPhone,
        message,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error');
      console.error(`[WA Gateway] Failed to send message to ${targetPhone}. Status: ${response.status}, Error: ${errText}`);
      return false;
    }

    console.log(`[WA Gateway] Successfully sent WhatsApp message to ${targetPhone}`);
    return true;
  } catch (error) {
    console.error(`[WA Gateway] Network or execution error while sending message to ${targetPhone}:`, error);
    return false;
  }
}
