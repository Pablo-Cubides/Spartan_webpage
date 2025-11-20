import { NextResponse, NextRequest } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { withErrorHandler, ValidationError } from '@/lib/api/error-handler'

const postHandler = async (request: NextRequest) => {
  // Request body: { filename: string, contentType: string }
  const body = await request.json()
  const filename = body.filename
  const contentType = body.contentType || 'application/octet-stream'
  
  if (!filename) {
    throw new ValidationError('Missing filename', { filename: 'Required field' });
  }

  const accessKey = process.env.R2_ACCESS_KEY_ID
  const secretKey = process.env.R2_SECRET_ACCESS_KEY
  const endpoint = process.env.R2_ENDPOINT
  const bucket = process.env.R2_BUCKET_NAME

  if (!accessKey || !secretKey || !endpoint || !bucket) {
    throw new Error('R2 storage not configured');
  }

  const s3 = new S3Client({
    region: process.env.R2_REGION || 'auto',
    endpoint,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    forcePathStyle: false,
  })

  const key = `avatars/${filename}`
  const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType })
  const url = await getSignedUrl(s3, command, { expiresIn: 60 * 10 })

  return NextResponse.json({ url, key })
}

export const POST = withErrorHandler(postHandler)
