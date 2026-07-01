import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface OpaToken {
  iss: string;
  sub: string;
  aud: string;
  jti: string;
  iat?: number;
  exp?: number;
}

export interface OpaInput {
  token?: OpaToken;
  user: {
    id: string;
    username: string;
    roles: string[];
  };
  resource: string;
  action: string;
  context: {
    ip: string;
    method: string;
    path: string;
  };
}

@Injectable()
export class OpaService {
  private readonly logger = new Logger(OpaService.name);
  private readonly opaUrl: string;
  private readonly serviceName: string;

  constructor(private configService: ConfigService) {
    this.opaUrl = this.configService.get<string>('OPA_URL', 'http://opa:8181/v1/data');
    this.serviceName = this.configService.get<string>('OPA_SERVICE', 'vehiculos');
  }

  async checkPermission(input: OpaInput): Promise<boolean> {
    try {
      // Endpoint específico para este microservicio
      const url = `${this.opaUrl}/authz/${this.serviceName}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
        signal: AbortSignal.timeout(500), // Timeout de 500ms
      });

      if (!response.ok) {
        this.logger.error(`Error de OPA HTTP ${response.status}`);
        return false; // Fail closed
      }

      const data = await response.json();
      const allow = data.result?.allow === true;

      if (!allow) {
        this.logger.warn(`Acceso denegado por OPA: ${JSON.stringify(input)}`);
      } else {
        this.logger.debug(`Acceso permitido por OPA: ${JSON.stringify(input)}`);
      }

      return allow;
    } catch (error) {
      this.logger.error(`Error conectando con OPA: ${error.message}`);
      return false; // Fail closed
    }
  }
}
