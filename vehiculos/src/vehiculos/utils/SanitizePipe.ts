// sanitize.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { Utils } from './utils';

@Injectable()
export class SanitizePipe implements PipeTransform {
  private utils = new Utils();

  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'body') {
      return this.sanitizeBody(value);
    }
    return value;
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sanitized = { ...body };

    if (sanitized.datos) {
      const textFields = ['placa', 'marca', 'color', 'cabina', 'tipoMoto', 'clasificacion'];
      textFields.forEach(field => {
        if (sanitized.datos[field] !== undefined) {
          sanitized.datos[field] = this.utils.sanitizeString(field, sanitized.datos[field]);
        }
      });

      if (sanitized.datos.modelo !== undefined) {
        if (typeof sanitized.datos.modelo === 'string') {
          let modelo = sanitized.datos.modelo.trim();
          modelo = modelo.replace(/\s+/g, ' ');
          modelo = modelo.replace(/<[^>]*>/g, '');
          sanitized.datos.modelo = modelo;
        }
      }
    }

    return sanitized;
  }
}