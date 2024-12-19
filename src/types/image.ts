// src/types/image.ts
export interface ImageGenerateParams {
    imageUrl: string;
    returnType?: 'base64' | 'url';
    prompt?: string;
  }
  
  export interface ImageResponse {
    code: number;
    statusText: string;
    data?: {
      base64?: string;
      url?: string;
    };
  }
  
  // SD API 的配置类型
  export interface SDConfig {
    prompt: string;
    negative_prompt: string;
    strength: number;
    num_inference_steps: number;
    guidance_scale: number;
    mode: string;     // 添加这个
    model: string;    // 添加这个
  }