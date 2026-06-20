// factory-persona.ts
import { Person } from "../entities/persona.entity";
import { Juridica } from "../entities/tipos/juridica.entity";
import { Natural } from "../entities/tipos/natural.entity";

export class FactoryPersonas {
  static crear(dto: any): Person {
    const tipo = dto.tipo || 'natural';
    dto.tipo = tipo; 
    
    let person: Person;
    
    switch (tipo) {
      case 'natural':
        person = new Natural();
        break;
      case 'juridica':
        person = new Juridica();
        break;
      default:
        throw new Error(`Tipo de persona no soportado: ${tipo}`);
    }
    
    const campos = {
      firstName: dto.firstName,
      middleName: dto.middleName,
      lastName: dto.lastName,
      email: dto.email,
      address: dto.address,
      dni: dto.dni,
      nationality: dto.nationality,
      phone: dto.phone,
      tipo: tipo,
      active: dto.active !== undefined ? dto.active : true,
    };
    
    Object.assign(person, campos);
    
    return person;
  }
}