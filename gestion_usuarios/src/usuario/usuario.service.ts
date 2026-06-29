import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { User } from './entities/usuario.entity';
import * as crypto from 'crypto';
import { Utils } from '../utils/utils';
import { Person } from '../persona/entities/persona.entity';
import { RolesUsuarios } from '../roles_usuario/entities/roles_usuario.entity';

@Injectable()
export class UsuarioService {
  private utils : Utils;
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    @InjectRepository(RolesUsuarios)
    private readonly rolesUsuarioRepository : Repository<RolesUsuarios>
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
    
    if(!existPerson) throw new BadRequestException("No existe esta persona para generar el usuario con este id");
    
    if(!existPerson.active) throw new ConflictException("No se puede generar un usuario a una persona inactiva");
    const existUser = await this.userRepository.findOne({
      where: {
          id:idSnt,
        }
    });

    if(existUser) throw new BadRequestException("Una persona ya esta registrada con ese id, no es posible generar el usuario");

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
    const idUser = this.utils.validateUUID(id);

    const user = await this.userRepository.findOne({
      where: { id:idUser },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    delete (user as any).passwordHash;
    return user;
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    const idUser = this.utils.validateUUID(id);
    const user = await this.userRepository.findOne({where:{id:idUser}});

    if (!user) throw new NotFoundException("No se encontro el usuario para actualizar");

    const username = this.utils.sanitizeString("nombre de usuario",updateUsuarioDto.username);

    if(user.username === username) throw new BadRequestException("No existe un cambio a realizar");

    const usedUsername = await this.userRepository.findOne({
      where:{
        username,
        id:Not(idUser)
      }
    })

    if(usedUsername) throw new ConflictException("El usuario ya esta utilizado");

    user.username = username;

    const updatedUser = await this.userRepository.save(user);
    delete (updatedUser as any).passwordHash;
    return updatedUser;
  }

  async updatePassword(id:string, newPassword:string){
    const idUser = this.utils.validateUUID(id);
    const user = await this.userRepository.findOne({where:{id:idUser}});

    if (!user) throw new NotFoundException("No se encontro el usuario para actualizar");

    const [currentSalt, currentHash] = user.passwordHash.split(':');
    const newHash = crypto.scryptSync(newPassword, currentSalt, 64).toString('hex');
    const newPasswordHash = `${currentSalt}:${newHash}`;

    if (user.passwordHash === newPasswordHash) {
        throw new BadRequestException("La nueva contraseña debe ser diferente a la actual");
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(newPassword, salt, 64).toString('hex');
    const passwordHash = `${salt}:${hash}`;

    await this.userRepository.update(idUser, { passwordHash });

    return {message:"Contraseña actualizada"};
  }

  async activarDesactivar(id:string){
    
    const idUser = this.utils.validateUUID(id);

    const user = await this.userRepository.findOne({
      where:{
        id:idUser
      }
    });

    if(!user) throw new NotFoundException("El usuario no fue encontrado");

    if(user.active){

      const rolesAsigned = await this.rolesUsuarioRepository.findOne({
        where:{
          id_usuario:idUser,
          activo:true
        }
      })
        
      if(rolesAsigned) throw new ConflictException("El usuario tiene roles activos asignados no se puede desactivar")
    
    }
    
    user.active = !user.active;
    await this.userRepository.update(idUser,user);
    
    return user;
  }

  async remove(id: string) {
    const idUser = this.utils.validateUUID(id);

    const userExist = this.userRepository.findOne({
      where:{
        id:idUser
      }
    });

    if(!userExist) throw new NotFoundException("El usuario no fue encontrado");

    const rolesAsigned = await this.rolesUsuarioRepository.findOne({
        where:{
          id_usuario:idUser,
          activo:true
        }
      })
        
    if(rolesAsigned) throw new ConflictException("El usuario tiene roles activos asignados no se puede eliminar")
    
      await this.userRepository.delete(idUser);
      
    return {message:"usuario eliminado"};
  }

  async findByUsernameWithPassword(username: string): Promise<User | null> {
    const usernameSnt = this.utils.sanitizeString("nombre usuario", username);
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.username = :username', { username: usernameSnt })
      .getOne();
  }
}
