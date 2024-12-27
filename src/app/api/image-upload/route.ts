import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@clerk/nextjs/server';

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryUploadResult {
  public_id: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  const { userId } = await auth(); // Await the `auth` function
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData(); // Await the formData method
    const file = formData.get('file') as File | null; // Use the `get` method of the `formData` object
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'next-cloudinary-uploads' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as CloudinaryUploadResult);
        }
      );
      uploadStream.end(buffer); // End the stream with the buffer
    });

    return NextResponse.json(
      { publicId: result.public_id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload image failed', error);
    return NextResponse.json({ error: 'Upload image failed' }, { status: 500 });
  }
}
