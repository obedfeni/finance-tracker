import { NextRequest, NextResponse } from 'next/server';
import { parseSMS } from '@/lib/sms';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sms } = body;

    if (!sms || typeof sms !== 'string') {
      return NextResponse.json({ error: 'sms field required' }, { status: 400 });
    }

    const parsed = parseSMS(sms);

    if (!parsed) {
      return NextResponse.json({ success: false, message: 'Could not parse SMS', raw: sms }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      transaction: { ...parsed, id: `api_${Date.now()}` },
      message: `Parsed: ${parsed.type} GHS ${parsed.amount} (${parsed.category})`,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'NeonWallet SMS Import API',
    version: '5.0.0',
    usage: 'POST /api/sms-import with body: { "sms": "Your MoMo SMS text" }',
    example: {
      sms: 'You have received GHS 500.00 from Kwame. Your new balance is GHS 1200.00. MTN MoMo.'
    }
  });
}
