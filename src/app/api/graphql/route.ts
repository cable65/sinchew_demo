import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  return NextResponse.json(
    {
      data: null,
      errors: [
        {
          message: 'GraphQL schema not yet implemented. This endpoint is reserved for future GraphQL support.',
        },
      ],
    },
    { status: 501 }
  )
}

export async function GET(req: Request) {
  return NextResponse.json(
    {
      message: 'GraphQL Endpoint',
      status: 'Not Implemented',
      description: 'Use POST to query. Schema implementation pending.',
    },
    { status: 501 }
  )
}
