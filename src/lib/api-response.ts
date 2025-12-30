import { NextResponse } from 'next/server'

export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
    [key: string]: any
  }
}

export function successResponse<T>(data: T, meta?: ApiResponse['meta'], status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      meta,
    },
    { status }
  )
}

export function errorResponse(message: string, status = 400, errors?: any) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      errors,
    },
    { status }
  )
}
