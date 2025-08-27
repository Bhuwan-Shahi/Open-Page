import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { withAdminAuth } from '@/lib/authMiddleware';

export const POST = withAdminAuth(async function(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum 10MB allowed.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${originalName}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'pdfs');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, that's okay
    }

    // Save file
    const filePath = path.join(uploadsDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);

    // Return the public URL
    const fileUrl = `/uploads/pdfs/${filename}`;

    return NextResponse.json({
      message: 'File uploaded successfully',
      fileUrl: fileUrl,
      originalName: file.name,
      size: file.size
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
});
