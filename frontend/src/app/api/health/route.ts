import { NextResponse } from 'next/server'
import { withErrorHandler } from '@/lib/api/error-handler'
import { prisma } from '@/lib/server/prisma'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  service: string;
  version: string;
  timestamp: string;
  checks: {
    database: { status: 'ok' | 'error'; latencyMs?: number; error?: string };
    environment: { status: 'ok' | 'warning'; missing?: string[] };
  };
}

const getHandler = async () => {
  const checks: HealthStatus['checks'] = {
    database: { status: 'ok' },
    environment: { status: 'ok' },
  };

  // Check database connectivity
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: 'ok', latencyMs: Date.now() - dbStart };
  } catch (error) {
    checks.database = { 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Database connection failed' 
    };
  }

  // Check required environment variables
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  ];
  const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
  
  if (missingEnvVars.length > 0) {
    checks.environment = { status: 'warning', missing: missingEnvVars };
  }

  // Determine overall status
  let overallStatus: HealthStatus['status'] = 'healthy';
  if (checks.database.status === 'error') {
    overallStatus = 'unhealthy';
  } else if (checks.environment.status === 'warning') {
    overallStatus = 'degraded';
  }

  const response: HealthStatus = {
    status: overallStatus,
    service: 'triarvon-club-api',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    checks,
  };

  const httpStatus = overallStatus === 'unhealthy' ? 503 : 200;
  return NextResponse.json(response, { status: httpStatus });
}

export const GET = withErrorHandler(getHandler)
