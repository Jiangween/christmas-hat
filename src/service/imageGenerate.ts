import axios from 'axios';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { ImageGenerateParams, ImageResponse, SDConfig } from '@/types/image';
import fs from 'fs';
import path from 'path';

export class ImageGenerateService {
  private static instance: ImageGenerateService;
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly sdConfig: SDConfig;

  private constructor() {
    this.apiKey = process.env.SD_API_KEY || '';
    this.apiUrl = process.env.SD_API_URL || 'https://draw.openai-next.com/sd/v2beta/stable-image/generate/sd3';
    this.sdConfig = {
      mode: 'image-to-image',
      model: 'sd3-large',
      prompt: `masterpiece, best quality, highly detailed anime style,
        ((red christmas hat:2.2)), ((wearing santa hat:2.2)), 
        ((perfect christmas hat placement on head:2.0)), 
        ((christmas themed:1.8)), ((fluffy white trim:1.8)),
        ((santa costume accessories:1.7)), ((holiday spirit:1.7)),
        
        ((anime style:1.8)), ((beautiful detailed anime illustration:1.6)),
        ((professional digital anime artwork:1.6)), ((detailed anime face:1.7)),
        ((clean sharp anime lineart:1.5)), ((anime character design:1.6)),
        ((perfect anime aesthetics:1.6)), ((high quality anime art:1.7)),
        
        ((detailed normal hands:1.4)), ((five fingers:1.3)),
        ((anatomically correct hands:1.4)), ((natural hand pose:1.3)),
        ((clear hand details)), ((proper finger proportions)),
        
        ((Studio Ghibli style:1.5)), ((Hayao Miyazaki style:1.5)),
        precise facial features, soft detailed lighting,
        perfect composition, ((vibrant anime colors:1.4)), ((cel shading:1.4)),
        ((high quality anime face:1.6)), ((detailed anime eyes:1.5)), 
        ((maintain character's identity:1.4)),
        ((japanese animation style:1.5)), ((authentic anime aesthetic:1.5))`,
      
      negative_prompt: `realistic, photorealistic, 3d, western art style,
        semi-realistic, realistic details, photographic, real life,
        western comic style, cartoon style, non-anime style,
        
        missing fingers, extra fingers, fused fingers,
        malformed hands, distorted hands, extra hands, missing hands,
        wrong hand proportions, bad hand anatomy, mutated hands,
        ((poorly drawn hands)), deformed fingers, long fingers,
        twisted fingers, broken fingers, disconnected fingers,
        
        missing hat, no hat, hat missing, incomplete hat,
        deformed hat, floating hat, unrealistic hat placement,
        wrong hat position, multiple hats, poorly drawn hat,
        oversized hat, tiny hat, damaged hat,
        
        oil painting, watercolor, low quality, blurry,
        noise, grainy, deformed face, distorted features,
        bad anatomy, wrong proportions, amateur, text,
        watermark, signature, cropped, oversaturated,
        bad art, poorly drawn, ugly, duplicate, morbid,
        extra limbs, gross proportions, malformed limbs,
        missing arms, missing legs`,
      
      strength: 0.8,
      num_inference_steps: 50,
      guidance_scale: 9.0
    };
  }

  public static getInstance() {
    if (!ImageGenerateService.instance) {
      ImageGenerateService.instance = new ImageGenerateService();
    }
    return ImageGenerateService.instance;
  }

  // src/service/imageGenerate.ts
  private async downloadAndProcessImage(url: string): Promise<Buffer> {
    try {
      // 验证 URL 格式
      const validUrl = new URL(url);
      
      const response = await axios.get(validUrl.toString(), {
        responseType: 'arraybuffer',
        timeout: 10000,
        // 添加错误重试
        maxRedirects: 5,
        validateStatus: (status) => status < 400
      });
      
      const buffer = Buffer.from(response.data);
      
      return await sharp(buffer)
        .resize(1024, 1024, { fit: 'inside' })
        .png()
        .toBuffer();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`图片下载处理失败: ${error.message}`);
      }
      throw new Error('图片下载处理失败');
    }
  }

  async generateImage(params: ImageGenerateParams): Promise<ImageResponse> {
    try {
      console.log('开始处理图片...');
      const processedImage = await this.downloadAndProcessImage(params.imageUrl);
      console.log('图片处理完成，大小:', processedImage.length, 'bytes');
      
      const formData = new FormData();
      const file = new File([processedImage], 'image.png', { type: 'image/png' });
      formData.append('image', file);

      console.log('用户提示词params.prompt:', params.prompt);
      
      // 合并提示词
      const finalConfig = {
        ...this.sdConfig,
        prompt: params.prompt 
          ? `${this.sdConfig.prompt}, ${params.prompt}`  // 如果有用户提示词，则合并
          : this.sdConfig.prompt  // 否则使用默认提示词
      };
      
      // 添加所有配置到 formData
      Object.entries(finalConfig).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
  
      // 修改这里：不要设置 responseType 为 arraybuffer
      const response = await axios.post(this.apiUrl, formData, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'application/json'  // 修改为接受 JSON
        },
        timeout: 30000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      });
      
      console.log('SD API 响应状态:', response.status);
      console.log('响应头:', response.headers);
      console.log('响应数据:', typeof response.data === 'string' ? response.data.substring(0, 100) : '...');
  
      if (response.status !== 200) {
        throw new Error(`API returned status ${response.status}`);
      }
  
      // 从 JSON 响应中获取图片数据
      const imageResponse = response.data;
      if (!imageResponse || typeof imageResponse !== 'object') {
        throw new Error('Invalid response format');
      }
  
      // 获取图片数据（假设返回的是 base64 格式）
      const base64Data = imageResponse.data?.base64 || imageResponse.image;
      if (!base64Data) {
        throw new Error('No image data in response');
      }
  
      // 解码 base64 数据
      const imageBuffer = Buffer.from(base64Data.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      
      // 保存图片
      const fileName = `${uuidv4()}.png`;
      const publicDir = path.join(process.cwd(), 'public', 'images');
      
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      
      await fs.promises.writeFile(
        path.join(publicDir, fileName),
        imageBuffer
      );
      
      const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://curuszqlvenx.sealoshzh.site';
      const fullUrl = `${domain}/images/${fileName}`;
      console.log('生成的图片 URL:', fullUrl);
      
      return {
        code: 200,
        statusText: 'success',
        data: {
          url: fullUrl
        }
      };
    } catch (error) {
      console.error('详细错误信息:', error);
      if (axios.isAxiosError(error)) {
        console.error('请求详情:', {
          status: error.response?.status,
          headers: error.response?.headers,
          data: error.response?.data
        });
      }
      return {
        code: 500,
        statusText: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}