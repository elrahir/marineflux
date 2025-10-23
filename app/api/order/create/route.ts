import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, Timestamp, doc, getDoc, updateDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { 
      quotationId,
      rfqId,
      shipownerUid,
    } = await request.json();

    // Validate input
    if (!quotationId || !rfqId || !shipownerUid) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user is a shipowner
    const userDoc = await getDoc(doc(db, 'users', shipownerUid));
    if (!userDoc.exists() || userDoc.data().role !== 'shipowner') {
      return NextResponse.json(
        { error: 'Unauthorized - Only shipowners can create orders' },
        { status: 403 }
      );
    }

    // Get quotation details
    const quotationDoc = await getDoc(doc(db, 'quotations', quotationId));
    if (!quotationDoc.exists()) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }

    const quotation = quotationDoc.data();

    // Verify quotation belongs to this RFQ
    if (quotation.rfqId !== rfqId) {
      return NextResponse.json(
        { error: 'Quotation does not belong to this RFQ' },
        { status: 400 }
      );
    }

    // Get RFQ details
    const rfqDoc = await getDoc(doc(db, 'rfqs', rfqId));
    if (!rfqDoc.exists()) {
      return NextResponse.json(
        { error: 'RFQ not found' },
        { status: 404 }
      );
    }

    const rfq = rfqDoc.data();

    // Create order
    const orderData = {
      rfqId,
      quotationId,
      shipownerUid,
      shipownerCompany: userDoc.data().companyName,
      supplierUid: quotation.supplierUid,
      supplierCompany: quotation.supplierCompany,
      title: rfq.title,
      description: rfq.description,
      category: rfq.category,
      amount: quotation.price,
      currency: quotation.currency,
      deliveryTime: quotation.deliveryTime,
      deliveryLocation: quotation.deliveryLocation || '',
      vessel: rfq.vessel || null,
      status: 'pending',
      paymentStatus: 'pending',
      timeline: [
        {
          status: 'pending',
          description: 'Order created',
          timestamp: Timestamp.now(),
        }
      ],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'orders'), orderData);

    // Update quotation status to accepted
    await updateDoc(doc(db, 'quotations', quotationId), {
      status: 'accepted',
      updatedAt: Timestamp.now(),
    });

    // Update RFQ status to awarded
    await updateDoc(doc(db, 'rfqs', rfqId), {
      status: 'awarded',
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      order: {
        id: docRef.id,
        ...orderData,
      },
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}



