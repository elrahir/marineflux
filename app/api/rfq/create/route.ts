import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { 
      shipownerUid, 
      title, 
      description, 
      supplierType,
      mainCategory,
      subcategory,
      category, // Backward compatibility
      vessel,
      deadline,
      attachments = []
    } = await request.json();

    // Validate input (support both old and new format)
    if (!shipownerUid || !title || !description || !deadline) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate new category system
    if (!category && !mainCategory) {
      return NextResponse.json(
        { error: 'Main category is required' },
        { status: 400 }
      );
    }

    // Verify user is a shipowner
    const userDoc = await getDoc(doc(db, 'users', shipownerUid));
    if (!userDoc.exists() || userDoc.data().role !== 'shipowner') {
      return NextResponse.json(
        { error: 'Unauthorized - Only shipowners can create RFQs' },
        { status: 403 }
      );
    }

    // Validate and convert deadline
    let deadlineTimestamp;
    try {
      deadlineTimestamp = Timestamp.fromDate(new Date(deadline));
    } catch (error) {
      console.error('Invalid deadline format:', deadline);
      return NextResponse.json(
        { error: 'Invalid deadline format' },
        { status: 400 }
      );
    }

    // Create RFQ with new category system
    const rfqData = {
      shipownerUid,
      shipownerCompany: userDoc.data().companyName,
      title,
      description,
      // New category system
      supplierType: supplierType || 'supplier',
      mainCategory: mainCategory || category, // Fallback to old category if new system not used
      subcategory: subcategory || null,
      // Old category field for backward compatibility
      category: category || mainCategory,
      vessel: vessel || null,
      deadline: deadlineTimestamp,
      status: 'open',
      quotationCount: 0,
      attachments,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    console.log('Creating RFQ with data:', { ...rfqData, deadline: deadline });

    const docRef = await addDoc(collection(db, 'rfqs'), rfqData);
    
    console.log('RFQ created successfully with ID:', docRef.id);

    return NextResponse.json({
      success: true,
      rfq: {
        id: docRef.id,
        ...rfqData,
      },
    });
  } catch (error: any) {
    console.error('Error creating RFQ:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create RFQ' },
      { status: 500 }
    );
  }
}



