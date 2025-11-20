import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export async function POST(request: Request) {
  // Request body: { filename: string, contentType: string }
  try {
    const body = await request.json()
    const filename = body.filename
    const contentType = body.contentType || 'application/octet-stream'
    if (!filename) return NextResponse.json({ error: 'missing_filename' }, { status: 400 })

    const accessKey = process.env.R2_ACCESS_KEY_ID
    const secretKey = process.env.R2_SECRET_ACCESS_KEY
    const endpoint = process.env.R2_ENDPOINT
    const bucket = process.env.R2_BUCKET_NAME

    if (!accessKey || !secretKey || !endpoint || !bucket) {
      return NextResponse.json({ error: 'r2_not_configured' }, { status: 501 })
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
  } catch (err: unknown) {
    return NextResponse.json({ error: 'presign_error', details: (err as Error).message }, { status: 500 })
  }
}
