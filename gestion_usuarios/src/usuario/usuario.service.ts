import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { User } from './entities/usuario.entity';
import * as crypto from 'crypto';
import { Utils } from '../utils/utils';
import { Person } from '../persona/entities/persona.entity';

@Injectable()
export class UsuarioService {
  private utils : Utils;
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>
  ) {
    this.utils = new Utils();
  }

  async create(createUsuarioDto: CreateUsuarioDto) {
    const idSnt = this.utils.sanitizeString("id",createUsuarioDto.id)
    const existPerson = await this.personRepository.findOne({
        where: {
          id:idSnt,
        }
      });
    
    if(!existPerson) throw new BadRequestException("No existe esta persona para generar el usuario con este id")
      
    const existUser = await this.userRepository.findOne({
      where: {
          id:idSnt,
        }
    });

    if(existUser) throw new BadRequestException("La persona ya esta registrada con ese id, no es posible generar el usuario");

    const usernameSnt = this.utils.sanitizeString("nombre usuario",createUsuarioDto.username);
    const existUsername= await this.userRepository.findOne({
      where: {
          username:usernameSnt
        }
    });

    if(existUsername) throw new BadRequestException("Ya existe una persona con ese nombre de usuario");

    const { password } = createUsuarioDto;

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    const passwordHash = `${salt}:${hash}`;

    const user = this.userRepository.create({
      id : idSnt,
      username: usernameSnt,
      passwordHash,
    });

    const savedUser = await this.userRepository.save(user);
    delete (savedUser as any).passwordHash;
    return savedUser;
  }

  async findAll() {
    const users = await this.userRepository.find();
    return users.map(user => {
      delete (user as any).passwordHash;
      return user;
    });
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    delete (user as any).passwordHash;
    return user;
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    const user = await this.findOne(id);

    const { password, ...userData } = updateUsuarioDto;

    if (password) {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.scryptSync(password, salt, 64).toString('hex');
      (userData as any).passwordHash = `${salt}:${hash}`;
    }

    Object.assign(user, userData);

    const updatedUser = await this.userRepository.save(user);
    delete (updatedUser as any).passwordHash;
    return updatedUser;
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    return await this.userRepository.remove(user);
  }
}
