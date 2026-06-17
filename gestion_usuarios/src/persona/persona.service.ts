import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Person } from './entities/persona.entity';
import { Repository } from 'typeorm';
import { User } from '../usuario/entities/usuario.entity';
import { UsuarioService } from '../usuario/usuario.service';
import { CreateUsuarioDto } from '../usuario/dto/create-usuario.dto';

@Injectable()
export class PersonaService {

  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly usuarioService: UsuarioService,
  ){}

  private async generateUsername(
    firstName: string,
    middleName: string | undefined,
    lastName: string,
  ): Promise<string> {

    const baseUsername = `${firstName[0]}${middleName?.[0] ?? ''}${lastName}`.toLowerCase().replace(/\s+/g, '');

    let username = baseUsername;
    let counter = 1;

    while(
      await this.userRepository.findOne({
        where: { username },
      })
    ){
      username = `${baseUsername}${counter}`;
      counter++;
    }

    return username;
  }

  async cambioDeEstado(id: string){
    const person = await this.personRepository.findOne({
      where: { id },
    });

    if(!person){
      throw new NotFoundException(
        'Persona no encontrada',
      );
    }

    person.active = !person.active;

    return await this.personRepository.save(person);
  }

  async create(createPersonaDto: CreatePersonaDto) {

    const username = await this.generateUsername(
      createPersonaDto.firstName,
      createPersonaDto.middleName,
      createPersonaDto.lastName,
    );

    const dniExists = await this.personRepository.findOne({
      where: {
        dni: createPersonaDto.dni,
      },
    });

    if(dniExists){
      throw new ConflictException(
        'La cedula ya existe'
      );
    }

    const emailExists = await this.personRepository.findOne({
      where: {
        email: createPersonaDto.email,
      },
    });

    if(emailExists){
      throw new ConflictException(
        'El correo ya existe',
      );
    }

    const createUsuarioDto: CreateUsuarioDto = {
      ...createPersonaDto,
      username,
      password: createPersonaDto.dni,
    } as CreateUsuarioDto;

    return await this.usuarioService.create(createUsuarioDto);
  }

  async findAll() {
    return await this.personRepository.find();
  }

  async findOne(id: string) {

    const person = await this.personRepository.findOne({
      where: { id },
    });

    if(!person){
      throw new NotFoundException(
        'Persona no encontrada'
      );
    }

    return person;
  }

  async update(id: string, 
    updatePersonaDto: UpdatePersonaDto
  ) {

    const person = await this.personRepository.findOne({
      where: { id },
    })

    if(!person){
      throw new NotFoundException(
        'Persona no encontrada',
      );
    }

    if(
      updatePersonaDto.email &&
      updatePersonaDto.email !== person.email
    ){
      const emailExists = await this.personRepository.findOne({
        where: {
          email: updatePersonaDto.email,
        },
      });

      if(emailExists){
        throw new ConflictException(
          'El correo ya existe',
        );
      }
    }

    if(
      updatePersonaDto.dni &&
      updatePersonaDto.dni !== person.dni
    ){
      const dniExists = await this.personRepository.findOne({
        where: {
          dni: updatePersonaDto.dni,
        },
      });

      if(dniExists){
        throw new ConflictException(
          'La cedula ya existe ',
        );
      }
    }

    Object.assign(
      person,
      updatePersonaDto,
    );

    return await this.personRepository.save(person);
  }

  async remove(id: string) {

    const userExist = await this.userRepository.findOne({
      where:{
        id,
        active: false
      },
    });

    if(!userExist){
      throw new NotFoundException(
        'Usuario no encontrado o esta aun activo',
      );
    }

    const person = await this.personRepository.findOne({
      where: { id },
    });

    if(!person){
      throw new NotFoundException(
        'Persona no encontrada',
      );
    }

    await this.personRepository.remove(person);

    return {
      message: 'Persona eliminada'
    };
  }
}
