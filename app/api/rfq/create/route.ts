import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, Timestamp, doc, getDoc, getDocs } from 'firebase/firestore';

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

    // Send notifications to relevant suppliers
    try {
      // Get all suppliers (no index required)
      const suppliersSnapshot = await getDocs(collection(db, 'suppliers'));
      const supplierIds: string[] = [];
      
      // Filter suppliers client-side by categories
      suppliersSnapshot.forEach((doc) => {
        const supplierData = doc.data();
        // Check both 'categories' and 'mainCategories' fields for compatibility
        const categories = supplierData.categories || supplierData.mainCategories || [];
        
        console.log(`Checking supplier ${doc.id}: categories=${JSON.stringify(categories)}, rfqCategory=${mainCategory || category}`);
        
        // Check if supplier handles this category
        if (categories.includes(mainCategory || category)) {
          supplierIds.push(doc.id);
          console.log(`✅ Match found for supplier ${doc.id}`);
        }
      });

      console.log(`Found ${supplierIds.length} suppliers for category ${mainCategory || category}`);

      // Send notification to each supplier
      if (supplierIds.length > 0) {
        console.log(`📬 Sending RFQ notifications to ${supplierIds.length} suppliers`);
        for (const supplierId of supplierIds) {
          try {
            // Direct Firestore write instead of API call
            await addDoc(collection(db, 'notifications'), {
              userId: supplierId,
              type: 'rfq',
              title: '📋 Yeni RFQ Teklifini Bekleniyor',
              message: `${userDoc.data().companyName} şirketi '${title}' için yeni bir RFQ oluşturdu. Detayları görmek ve teklif vermek için tıklayın.`,
              link: `/tr/supplier/rfqs/${docRef.id}/quote`,
              rfqId: docRef.id,
              read: false,
              createdAt: Timestamp.now(),
            });
            console.log(`✅ Notification sent to ${supplierId}: Success`);
          } catch (error) {
            console.error(`❌ Error sending notification to supplier ${supplierId}:`, error);
          }
        }
      } else {
        console.log('⚠️ No suppliers found for this category');
      }
    } catch (error) {
      console.error('Error sending RFQ notifications:', error);
      // Don't fail the request if notifications fail
    }

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



