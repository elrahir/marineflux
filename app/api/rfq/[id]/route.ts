import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rfqId } = await params;

    if (!rfqId) {
      return NextResponse.json(
        { error: 'Missing RFQ ID' },
        { status: 400 }
      );
    }

    // Get RFQ document
    const rfqDoc = await getDoc(doc(db, 'rfqs', rfqId));
    
    if (!rfqDoc.exists()) {
      return NextResponse.json(
        { error: 'RFQ not found' },
        { status: 404 }
      );
    }

    const rfqData = {
      id: rfqDoc.id,
      ...rfqDoc.data(),
      createdAt: rfqDoc.data().createdAt?.toDate?.()?.toISOString(),
      updatedAt: rfqDoc.data().updatedAt?.toDate?.()?.toISOString(),
      deadline: rfqDoc.data().deadline?.toDate?.()?.toISOString(),
    };

    return NextResponse.json({
      success: true,
      rfq: rfqData,
    });
  } catch (error: any) {
    console.error('Error fetching RFQ:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch RFQ' },
      { status: 500 }
    );
  }
}

