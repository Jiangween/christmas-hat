// src/app/api/image/route.ts
import { ImageGenerateService } from '@/service/imageGenerate';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageUrl, returnType, prompt } = body;  // 解构 prompt

    if (!imageUrl) {
      return NextResponse.json(
        { code: 400, statusText: 'Image URL is required' },
        { status: 400 }
      );
    }

    const result = await ImageGenerateService.getInstance().generateImage({
      imageUrl,
      returnType,
      prompt
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        code: 500,
        statusText: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}