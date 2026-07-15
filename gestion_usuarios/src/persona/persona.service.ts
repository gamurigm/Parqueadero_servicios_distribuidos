import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Person } from './entities/persona.entity';
import { Repository } from 'typeorm';
import { User } from '../usuario/entities/usuario.entity';
import { UsuarioService } from '../usuario/usuario.service';
import { Utils } from '../utils/utils';
import { FactoryPersonas } from './factory/factory-persona';
import { UUID } from 'typeorm/driver/mongodb/bson.typings.js';
import { AuditEvent, EventPublisher } from '../event-publisher.service';

@Injectable()
export class PersonaService {
  private utils: Utils;
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly eventPublisher: EventPublisher,
  ){
    this.utils = new Utils();
  }

  private async emitEvent(
    accion: string,
    datos: any,
    usuario?: string,
    rol?: string,
    ip?: string,
    mac?: string,
  ) {
    const event: AuditEvent = {
      servicio: 'ms-usuarios',
      accion,
      entidad: 'PERSONA',
      usuario,
      rol,
      ip,
      mac,
      datos,
    };
    await this.eventPublisher.publish(event);
  }

  private async generateUsername(
    firstName: string,
    middleName: string,
    lastName: string,
): Promise<string> {

    const baseUsername = `${firstName[0]}${middleName?.[0] ?? ''}${lastName}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '');
    const users = await this.userRepository
        .createQueryBuilder('user')
        .where('user.username LIKE :pattern', { pattern: `${baseUsername}%` })
        .getMany();

    if (users.length === 0) {
        return baseUsername;
    }

    const numbers = users
        .map(user => {
            const suffix = user.username.replace(baseUsername, '');
            if (suffix === '') return 0;
            const num = parseInt(suffix, 10);
            return isNaN(num) ? 0 : num;
        })
        .filter(num => !isNaN(num));

    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;

    return `${baseUsername}${maxNumber + 1}`;
}

  private async findUsernameByPersonId(personId: string): Promise<string | undefined> {
    const user = await this.userRepository.findOne({ where: { id: personId } });
    return user?.username;
  }

  async cambioDeEstado(id: string, ip?: string, mac?: string){
    const idPerson = this.utils.validateUUID(id);

    const person = await this.personRepository.findOne({
      where: { id:idPerson },
    });

    if(!person) throw new NotFoundException('Persona no encontrada',);
    

    const afiliatedUser = await this.userRepository.find({
      where:{
        id:idPerson,
        active:true
      }
    })

    if(!afiliatedUser) throw new ConflictException("La persona tiene un usuario activo afiliado")

    const previousActive = person.active;
    person.active = !person.active;
    await this.personRepository.update(idPerson,person);

    const username = await this.findUsernameByPersonId(idPerson);
    await this.emitEvent('UPDATE', person, username, undefined, ip, mac);

    return this.personRepository.findOne({where:{id:idPerson}});
  }

  async create(createPersonaDto: CreatePersonaDto, ip?: string, mac?: string) {

    const dniSnt = this.utils.sanitizeString("cedula",createPersonaDto.dni);
    
    const dniExists = await this.personRepository.findOne({
      where: {
        dni: dniSnt,
      },
    });

    if(dniExists)throw new ConflictException('La cedula ya existe');
    
    const emailSnt= createPersonaDto.email.trim().replace(/\s+/g, ' ');
    const emailExists = await this.personRepository.findOne({
      where: {
        email: emailSnt,
      },
    });

    if(emailExists) throw new ConflictException('El correo ya existe',);
    
    const phoneSnt = this.utils.sanitizeString("telefono",createPersonaDto.phone);

    const phoneExists = await this.personRepository.findOne({
      where: {
        phone:phoneSnt,
      },
    });

    if(phoneExists) throw new ConflictException('El Telefono ya existe',);

    const firstNameSnt = this.utils.sanitizeString("nombre",createPersonaDto.firstName); 
    const secondNameSnt = this.utils.sanitizeString("nombre intermedio",createPersonaDto.middleName); 
    const thirdNameSnt = this.utils.sanitizeString("apellido",createPersonaDto.lastName);

    const username = await this.generateUsername(
      firstNameSnt,
      secondNameSnt,
      thirdNameSnt,
    );

    const datos={
      firstName: firstNameSnt,
      middleName: secondNameSnt,
      lastName: thirdNameSnt,
      email:emailSnt,
      address: this.utils.sanitizeString("direccion",createPersonaDto.address),
      dni: dniSnt,
      nationality: this.utils.sanitizeString("nacionalidad",createPersonaDto.nationality),
      phone: phoneSnt,
      tipo: this.utils.sanitizeString("tipo",createPersonaDto.tipo)
    };

    const person= FactoryPersonas.crear(datos);
    
    await this.personRepository.save(person);

    const result = {
      ...person,
      username:username
    };

    await this.emitEvent('CREATE', result, username, undefined, ip, mac);

    return result;
  }

  async findAll() {
    return await this.personRepository.find();
  }

  async findByCedula(cedula: string) {
    const dni = this.utils.sanitizeString("cedula", cedula);
    const person = await this.personRepository.findOne({
      where: { dni },
    });

    if (!person) throw new NotFoundException('Persona no encontrada');

    return person;
  }
  async findOne(id: string) {
    const idPerson = this.utils.validateUUID(id);
    const person = await this.personRepository.findOne({
      where: { id:idPerson },
    });

    if(!person) throw new NotFoundException('Persona no encontrada');
    
    return person;
  }

  async update(id: string, updatePersonaDto: UpdatePersonaDto, ip?: string, mac?: string) {
      const idPerson = this.utils.validateUUID(id);
      
      const person = await this.personRepository.findOne({
        where: { id: idPerson },
      });
      
      if (!person) throw new NotFoundException('Persona no encontrada');      
      
      const sanitizedData: any = {};
      
        sanitizedData.firstName = this.utils.sanitizeString("nombre",updatePersonaDto.firstName); 
        sanitizedData.middleName = this.utils.sanitizeString("nombre intermedio",updatePersonaDto.middleName);
        sanitizedData.lastName = this.utils.sanitizeString("apellido",updatePersonaDto.lastName);
        sanitizedData.address = this.utils.sanitizeString("direccion",updatePersonaDto.address);
        sanitizedData.dni = this.utils.sanitizeString("cedula",updatePersonaDto.dni);
        sanitizedData.nationality = this.utils.sanitizeString("nacionalidad",updatePersonaDto.nationality);
        sanitizedData.phone = this.utils.sanitizeString("telefono",updatePersonaDto.phone);
        if (updatePersonaDto.email) {
          sanitizedData.email = updatePersonaDto.email.trim().replace(/\s+/g, ' ');
        }

        sanitizedData.tipo = this.utils.sanitizeString("tipo",updatePersonaDto.tipo);
      
        if (sanitizedData.phone && sanitizedData.phone !== person.phone) {
        const phoneExists = await this.personRepository.findOne({
          where: { phone: sanitizedData.phone},
        });

        if (phoneExists) throw new ConflictException('El telefono ya existe');
        
      }

      if (sanitizedData.email && sanitizedData.email !== person.email) {
        const emailExists = await this.personRepository.findOne({
          where: { email: sanitizedData.email },
        });

        if (emailExists) throw new ConflictException('El correo ya existe');
        
      }

      if (sanitizedData.dni && sanitizedData.dni !== person.dni) {
        const dniExists = await this.personRepository.findOne({
          where: { dni: sanitizedData.dni },
        });

        if (dniExists) throw new ConflictException('La cédula ya existe');
        
      }

      if (sanitizedData.tipo && sanitizedData.tipo !== person.obtenerTipo()) {
          const datosCompletos = {
            firstName: sanitizedData.firstName ?? person.firstName,
            middleName: sanitizedData.middleName !== undefined ? sanitizedData.middleName : person.middleName,
            lastName: sanitizedData.lastName ?? person.lastName,
            email: sanitizedData.email ?? person.email,
            address: sanitizedData.address ?? person.address,
            dni: sanitizedData.dni ?? person.dni,
            nationality: sanitizedData.nationality ?? person.nationality,
            phone: sanitizedData.phone ?? person.phone,
            tipo: sanitizedData.tipo,
          };

          const newPerson = FactoryPersonas.crear(datosCompletos);
          
          newPerson.id = person.id;
          newPerson.active = person.active;
          newPerson.createdAt = person.createdAt;

          const savedPerson = await this.personRepository.save(newPerson);
          
          const updated = await this.personRepository.findOne({
            where: { id: savedPerson.id },
          });

          const username = await this.findUsernameByPersonId(savedPerson.id);
          await this.emitEvent('UPDATE', updated, username, undefined, ip, mac);

          return updated;
        }

      
      Object.assign(person, sanitizedData);
      return await this.personRepository.save(person);
    
  }

  async remove(id: string, ip?: string, mac?: string) {
    const idPerson = this.utils.validateUUID(id);

    const userExist = await this.userRepository.findOne({
      where:{
        id:idPerson,
        active: true
      },
    });

    if(userExist) throw new NotFoundException ('Usuario tiene un usuario anexado aun activo',);
    
    const person = await this.personRepository.findOne({
      where: { id:idPerson },
    });

    if(!person)throw new NotFoundException('Persona no encontrada');

    await this.personRepository.remove(person);

    const username = await this.findUsernameByPersonId(idPerson);
    await this.emitEvent('DELETE', { id: idPerson, dni: person.dni }, username, undefined, ip, mac);

    return {
      message: 'Persona eliminada'
    };
  }
}
