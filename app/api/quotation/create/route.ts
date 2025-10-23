import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, Timestamp, doc, getDoc, updateDoc, increment } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { 
      rfqId,
      supplierUid,
      price,
      currency,
      deliveryTime,
      deliveryLocation,
      notes,
      specifications
    } = await request.json();

    // Validate input
    if (!rfqId || !supplierUid || !price || !currency || !deliveryTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user is a supplier
    const userDoc = await getDoc(doc(db, 'users', supplierUid));
    if (!userDoc.exists() || userDoc.data().role !== 'supplier') {
      return NextResponse.json(
        { error: 'Unauthorized - Only suppliers can create quotations' },
        { status: 403 }
      );
    }

    // Verify RFQ exists and is open
    const rfqDoc = await getDoc(doc(db, 'rfqs', rfqId));
    if (!rfqDoc.exists()) {
      return NextResponse.json(
        { error: 'RFQ not found' },
        { status: 404 }
      );
    }

    if (rfqDoc.data().status !== 'open') {
      return NextResponse.json(
        { error: 'RFQ is not open for quotations' },
        { status: 400 }
      );
    }

    // Check if deadline has passed
    const deadline = rfqDoc.data().deadline.toDate();
    if (deadline < new Date()) {
      return NextResponse.json(
        { error: 'RFQ deadline has passed' },
        { status: 400 }
      );
    }

    // Create quotation
    const quotationData = {
      rfqId,
      supplierUid,
      supplierCompany: userDoc.data().companyName,
      rfqTitle: rfqDoc.data().title,
      shipownerUid: rfqDoc.data().shipownerUid,
      price: parseFloat(price),
      currency,
      deliveryTime,
      deliveryLocation: deliveryLocation || '',
      notes: notes || '',
      specifications: specifications || '',
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'quotations'), quotationData);

    // Update RFQ quotation count
    await updateDoc(doc(db, 'rfqs', rfqId), {
      quotationCount: increment(1),
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      quotation: {
        id: docRef.id,
        ...quotationData,
      },
    });
  } catch (error: any) {
    console.error('Error creating quotation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create quotation' },
      { status: 500 }
    );
  }
}



