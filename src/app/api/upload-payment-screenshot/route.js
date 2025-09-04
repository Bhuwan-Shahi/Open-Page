import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import { prisma } from '@/lib/prisma';
import { uploadToS3 } from '@/lib/s3';
import path from 'path';

export const POST = withAuth(async function(request) {
  try {
    console.log('📸 Upload payment screenshot API called');
    console.log('User:', request.user);
    
    const formData = await request.formData();
      const file = formData.get('file');
      const orderId = formData.get('orderId');
      const type = formData.get('type');

      console.log('📋 Upload details:', {
        fileName: file?.name,
        fileSize: file?.size,
        orderId,
        type
      });

      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }

      if (!orderId) {
        return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
      }

      // Verify that the order belongs to the user
      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          userId: request.user.id
        }
      });

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const timestamp = Date.now();
      const originalName = file.name;
      const extension = path.extname(originalName);
      const filename = `payment-screenshots/${orderId}-${timestamp}${extension}`;

      // Upload to S3
      console.log('☁️ Uploading to S3...');
      const s3Url = await uploadToS3(buffer, filename, file.type);
      console.log('✅ S3 upload successful:', s3Url);

      // Store screenshot info in database
      console.log('💾 Creating database record...');
      const screenshot = await prisma.paymentScreenshot.create({
        data: {
          orderId: orderId,
          userId: request.user.id,
          filename: filename,
          originalName: originalName,
          filePath: s3Url,
          uploadedAt: new Date(),
          verified: false
        }
      });

      console.log('✅ Screenshot saved:', screenshot.id);

      // Update order to indicate screenshot uploaded
      console.log('📦 Updating order...');
      await prisma.order.update({
        where: { id: orderId },
        data: { 
          screenshotUploaded: true,
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        message: 'Screenshot uploaded successfully',
        screenshot: {
          id: screenshot.id,
          filename: screenshot.filename,
          uploadedAt: screenshot.uploadedAt
        }
      }, { status: 201 });

    } catch (error) {
      console.error('Error uploading payment screenshot:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
});
