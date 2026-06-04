import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET = process.env.R2_BUCKET_NAME || 'restaurante-veg';

const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || `${R2_ENDPOINT}/${R2_BUCKET}`;

const s3 = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export async function uploadToR2(file: Express.Multer.File): Promise<string> {
  const ext = file.originalname.split('.').pop() || 'jpg';
  const key = `menu-items/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${ext}`;

  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  }));

  // Retornar la URL pública para que el frontend pueda cargar la imagen directamente
  return `${R2_PUBLIC_URL}/${key}`;
}

export async function deleteFromR2(imageUrl: string): Promise<void> {
  try {
    const url = new URL(imageUrl);
    // Elimina el slash inicial y extrae el nombre del bucket si está presente en la ruta
    let key = url.pathname.replace(/^\//, '');
    if (key.startsWith(`${R2_BUCKET}/`)) {
      key = key.substring(R2_BUCKET.length + 1);
    }

    if (!key) return;

    await s3.send(new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    }));
  } catch (error) {
    console.error('Error al intentar eliminar objeto de R2:', error);
  }
}
