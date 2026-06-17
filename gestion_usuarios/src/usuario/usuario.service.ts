import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { User } from './entities/usuario.entity';
import * as crypto from 'crypto';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const { password, ...userData } = createUsuarioDto;

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    const passwordHash = `${salt}:${hash}`;

    const user = this.userRepository.create({
      ...userData,
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
