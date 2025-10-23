import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc, addDoc, collection, Timestamp, increment } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { quotationId, shipownerUid } = await request.json();

    if (!quotationId || !shipownerUid) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user is a shipowner
    const userDoc = await getDoc(doc(db, 'users', shipownerUid));
    if (!userDoc.exists() || userDoc.data().role !== 'shipowner') {
      return NextResponse.json(
        { error: 'Unauthorized - Only shipowners can accept quotations' },
        { status: 403 }
      );
    }

    // Get quotation
    const quotationDoc = await getDoc(doc(db, 'quotations', quotationId));
    if (!quotationDoc.exists()) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }

    const quotation = quotationDoc.data();

    // Verify this is the shipowner's quotation
    if (quotation.shipownerUid !== shipownerUid) {
      return NextResponse.json(
        { error: 'Unauthorized - This quotation does not belong to you' },
        { status: 403 }
      );
    }

    // Check if quotation is still pending
    if (quotation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Quotation has already been processed' },
        { status: 400 }
      );
    }

    // Get RFQ details
    const rfqDoc = await getDoc(doc(db, 'rfqs', quotation.rfqId));
    if (!rfqDoc.exists()) {
      return NextResponse.json(
        { error: 'RFQ not found' },
        { status: 404 }
      );
    }

    const rfq = rfqDoc.data();

    // Create order
    const orderData = {
      rfqId: quotation.rfqId,
      quotationId,
      shipownerUid,
      shipownerCompany: quotation.shipownerCompany,
      supplierUid: quotation.supplierUid,
      supplierCompany: quotation.supplierCompany,
      title: quotation.rfqTitle,
      description: rfq.description,
      category: rfq.category,
      amount: quotation.price,
      currency: quotation.currency,
      deliveryTime: quotation.deliveryTime,
      deliveryLocation: quotation.deliveryLocation || '',
      vessel: rfq.vessel || null,
      specifications: quotation.specifications || '',
      notes: quotation.notes || '',
      status: 'pending',
      paymentStatus: 'pending',
      timeline: [
        {
          status: 'pending',
          description: 'Order created',
          timestamp: Timestamp.now(),
          actor: 'shipowner',
        }
      ],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const orderRef = await addDoc(collection(db, 'orders'), orderData);

    // Update quotation status to accepted
    await updateDoc(doc(db, 'quotations', quotationId), {
      status: 'accepted',
      acceptedAt: Timestamp.now(),
      orderId: orderRef.id,
      updatedAt: Timestamp.now(),
    });

    // Update RFQ status to awarded
    await updateDoc(doc(db, 'rfqs', quotation.rfqId), {
      status: 'awarded',
      awardedQuotationId: quotationId,
      updatedAt: Timestamp.now(),
    });

    // Reject other pending quotations for this RFQ
    // (This would ideally be done in a Cloud Function for better performance)

    return NextResponse.json({
      success: true,
      orderId: orderRef.id,
      message: 'Quotation accepted and order created successfully',
    });
  } catch (error: any) {
    console.error('Error accepting quotation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to accept quotation' },
      { status: 500 }
    );
  }
}

