import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, doc, getDoc, updateDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, shipownerUid, supplierUid, rating, comment, shipownerCompany, orderTitle } = body;

    // Validate inputs
    if (!orderId || !shipownerUid || !supplierUid || !rating || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if review already exists for this order
    const existingReviewQuery = query(
      collection(db, 'reviews'),
      where('orderId', '==', orderId),
      where('shipownerUid', '==', shipownerUid)
    );
    const existingReview = await getDocs(existingReviewQuery);

    if (!existingReview.empty) {
      return NextResponse.json(
        { error: 'You have already reviewed this order' },
        { status: 400 }
      );
    }

    // Create review document
    const reviewRef = await addDoc(collection(db, 'reviews'), {
      orderId,
      shipownerUid,
      supplierUid,
      rating,
      comment,
      shipownerCompany,
      orderTitle,
      createdAt: Timestamp.now(),
    });

    console.log('Review created:', reviewRef.id);

    // Get all reviews for this supplier to calculate average rating
    const supplierReviewsQuery = query(
      collection(db, 'reviews'),
      where('supplierUid', '==', supplierUid)
    );
    const supplierReviews = await getDocs(supplierReviewsQuery);

    let totalRating = 0;
    supplierReviews.forEach((doc) => {
      totalRating += doc.data().rating;
    });

    const averageRating = supplierReviews.size > 0 ? totalRating / supplierReviews.size : 0;

    // Update supplier's rating and review count
    const supplierDoc = await getDoc(doc(db, 'suppliers', supplierUid));
    if (supplierDoc.exists()) {
      await updateDoc(doc(db, 'suppliers', supplierUid), {
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        reviewCount: supplierReviews.size,
      });

      console.log('Supplier rating updated:', {
        supplierUid,
        rating: Math.round(averageRating * 10) / 10,
        reviewCount: supplierReviews.size,
      });
    }

    return NextResponse.json({
      success: true,
      review: {
        id: reviewRef.id,
        orderId,
        shipownerUid,
        supplierUid,
        rating,
        comment,
        shipownerCompany,
        orderTitle,
      },
    });
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create review' },
      { status: 500 }
    );
  }
}
