import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
export class HelperService {
  constructor(protected readonly configService: ConfigService) {}
  private readonly algorithm = 'aes-256-cbc';
  private readonly ivLength = 16;
  private getKey(): Buffer {
    return crypto
      .createHash('sha256')
      .update(String(this.configService.get<string>('SECRET')))
      .digest()
      .subarray(0, 32); // 32 bytes for AES-256
  }
  async encrypt(content: string): Promise<string> {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.getKey(), iv);
    let encrypted = cipher.update(content, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }
  async decrypt(encryptedContent: string): Promise<string> {
    const parts = encryptedContent.split(':');
    const iv = Buffer.from(parts.shift()!, 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.getKey(), iv);
    let decrypted = Buffer.concat([
      decipher.update(encryptedText),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  }
}
