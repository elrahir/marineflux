import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, Timestamp, doc, getDoc, updateDoc, increment } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { 
      rfqId,
      supplierUid,
      supplierCompany,
      price,
      currency,
      deliveryTime,
      estimatedReadyDate,
      deliveryLocation,
      notes,
      specifications
    } = await request.json();

    console.log('Creating quotation - REQUEST DATA:', { 
      rfqId, 
      supplierUid, 
      supplierCompany,
      price, 
      currency, 
      estimatedReadyDate 
    });
    console.log('rfqId type:', typeof rfqId, 'value:', rfqId);

    // Validate input
    if (!rfqId || !supplierUid || !price || !currency || !estimatedReadyDate) {
      console.error('Validation failed - missing fields:', { 
        rfqId: !!rfqId, 
        supplierUid: !!supplierUid, 
        price: !!price, 
        currency: !!currency, 
        estimatedReadyDate: !!estimatedReadyDate 
      });
      return NextResponse.json(
        { error: 'Missing required fields', details: { rfqId: !!rfqId, supplierUid: !!supplierUid, price: !!price, currency: !!currency, estimatedReadyDate: !!estimatedReadyDate } },
        { status: 400 }
      );
    }

    // Verify user is a supplier
    console.log('Verifying supplier...');
    const userDoc = await getDoc(doc(db, 'users', supplierUid));
    if (!userDoc.exists()) {
      console.error('User not found:', supplierUid);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    if (userDoc.data().role !== 'supplier') {
      console.error('User is not a supplier:', userDoc.data().role);
      return NextResponse.json(
        { error: 'Unauthorized - Only suppliers can create quotations' },
        { status: 403 }
      );
    }
    console.log('Supplier verified:', userDoc.data().companyName);

    // Verify RFQ exists and is open
    console.log('Verifying RFQ:', rfqId);
    const rfqDoc = await getDoc(doc(db, 'rfqs', rfqId));
    if (!rfqDoc.exists()) {
      console.error('RFQ not found:', rfqId);
      return NextResponse.json(
        { error: 'RFQ not found' },
        { status: 404 }
      );
    }

    const rfqData = rfqDoc.data();
    console.log('RFQ found:', { title: rfqData.title, status: rfqData.status });

    if (rfqData.status !== 'open') {
      console.error('RFQ is not open:', rfqData.status);
      return NextResponse.json(
        { error: 'RFQ is not open for quotations' },
        { status: 400 }
      );
    }

    // Check if deadline has passed
    const deadline = rfqData.deadline.toDate();
    const now = new Date();
    console.log('Checking deadline:', { deadline, now, isPassed: deadline < now });
    
    // TEMPORARY: Skip deadline check for testing
    // TODO: Re-enable this in production
    /*
    if (deadline < now) {
      console.error('RFQ deadline has passed');
      return NextResponse.json(
        { error: 'RFQ deadline has passed' },
        { status: 400 }
      );
    }
    */
    console.log('⚠️ WARNING: Deadline check is disabled for testing!');

    // Create quotation
    const quotationData = {
      rfqId,
      supplierUid,
      supplierCompany: supplierCompany || userDoc.data().companyName || 'Unknown Company',
      rfqTitle: rfqDoc.data().title,
      rfqCategory: rfqData.mainCategory || rfqData.category || '', // Add category for calendar
      vesselName: rfqData.vessel?.name || '', // Add vessel name for calendar
      vesselType: rfqData.vessel?.type || '', // Add vessel type for calendar
      shipownerUid: rfqDoc.data().shipownerUid,
      price: parseFloat(price),
      currency,
      estimatedReadyDate: estimatedReadyDate ? Timestamp.fromDate(new Date(estimatedReadyDate)) : null, // Convert to Timestamp
      deliveryLocation: deliveryLocation || '',
      notes: notes || '',
      specifications: specifications || '',
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    console.log('Quotation data prepared:', quotationData);

    console.log('Creating quotation document...');
    const docRef = await addDoc(collection(db, 'quotations'), quotationData);
    console.log('Quotation created with ID:', docRef.id);

    // Update RFQ quotation count
    console.log('Updating RFQ quotation count...');
    await updateDoc(doc(db, 'rfqs', rfqId), {
      quotationCount: increment(1),
      updatedAt: Timestamp.now(),
    });
    console.log('RFQ updated successfully');

    // Send notification to shipowner
    const shipownerUid = rfqData.shipownerUid;
    try {
      await addDoc(collection(db, 'notifications'), {
        userId: shipownerUid,
        type: 'quotation',
        title: '📋 Yeni Teklif Alındı',
        message: `${supplierCompany} şirketi '${rfqData.title}' RFQ'sı için teklif verdi. Teklifi incelemek için tıklayın.`,
        link: `/shipowner/rfq/${rfqId}/quotations`,
        rfqId,
        read: false,
        createdAt: Timestamp.now(),
      });
      console.log('✅ Quotation notification sent to shipowner:', shipownerUid);
    } catch (error) {
      console.error('❌ Error sending quotation notification:', error);
    }

    return NextResponse.json({
      success: true,
      quotation: {
        id: docRef.id,
        ...quotationData,
      },
    });
  } catch (error: any) {
    console.error('Error creating quotation:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Failed to create quotation', details: error.toString() },
      { status: 500 }
    );
  }
}



