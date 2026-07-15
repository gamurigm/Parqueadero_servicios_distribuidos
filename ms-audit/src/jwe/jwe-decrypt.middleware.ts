import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as jose from 'jose';

@Injectable()
export class JweDecryptMiddleware implements NestMiddleware {
  private secret: Uint8Array;

  constructor() {
    try {
      const hex = fs.readFileSync('/keys/jwe-secret.key', 'utf8').trim();
      this.secret = Uint8Array.from(Buffer.from(hex, 'hex'));
    } catch {
      console.warn('[JWE] Could not load /keys/jwe-secret.key — JWE decryption will not work. Using zero key as fallback.');
      this.secret = new Uint8Array(32);
    }
  }

  async use(req: Request, _res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ') && authHeader.length > 80) {
      try {
        const jwe = authHeader.substring(7);
        const { plaintext } = await jose.compactDecrypt(jwe, this.secret);
        const jwtString = new TextDecoder().decode(plaintext);
        req.headers.authorization = `Bearer ${jwtString}`;
      } catch {
        // Leave as-is, passport will reject it
      }
    }
    next();
  }
}
