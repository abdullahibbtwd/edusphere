import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using your credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
    try {
        // Read the file from the request form data
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Convert the file to a buffer and then to a base64 data URI
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`;

        // Upload the file to Cloudinary
        const result = await cloudinary.uploader.upload(dataUri, {
            resource_type: 'auto'
        });

        // Return the secure URL from Cloudinary
        return NextResponse.json({ imageUrl: result.secure_url });

    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        return NextResponse.json({ error: 'Failed to upload file to Cloudinary' }, { status: 500 });
    }
}
