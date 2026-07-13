import { Controller, Post, Body, Get, Req, HttpCode, HttpStatus, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { RefreshDto } from './dto/refresh.dto';
import { Public } from './decorators/public.decorator';
import { Resource } from '../opa/decorators/resource.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiBody({ type: RegisterAuthDto })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o cédula inválida' })
  @ApiResponse({ status: 409, description: 'Cédula o username ya existen' })
  register(@Body() registerAuthDto: RegisterAuthDto, @Req() req: any, @Headers('x-mac-address') mac?: string) {
    const ip = req.ip || req.socket?.remoteAddress || '0.0.0.0';
    return this.authService.register(registerAuthDto, ip, mac);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión y obtener tokens de acceso y refresh' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas o usuario inactivo' })
  login(@Body() loginDto: LoginDto, @Req() req: any, @Headers('x-mac-address') mac?: string) {
    const ip = req.ip || req.socket?.remoteAddress || '0.0.0.0';
    return this.authService.login(loginDto, ip, mac);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refrescar el token de acceso utilizando un token de refresh' })
  @ApiBody({ type: RefreshDto })
  @ApiResponse({ status: 200, description: 'Token refrescado exitosamente' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido o expirado' })
  refresh(@Body() refreshDto: RefreshDto) {
    return this.authService.refresh(refreshDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @Resource('auth.logout')
  @ApiOperation({ summary: 'Cerrar sesión y revocar el token de refresh' })
  @ApiBody({ type: RefreshDto })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
  logout(@Body() refreshDto: RefreshDto, @Req() req: any, @Headers('x-mac-address') mac?: string) {
    const ip = req.ip || req.socket?.remoteAddress || '0.0.0.0';
    return this.authService.logout(refreshDto, req.user?.username, ip, mac);
  }

  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @Resource('auth.profile')
  @ApiOperation({ summary: 'Obtener el perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario retornado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getProfile(@Req() req: any) {
    return this.authService.getProfile(req.user.id);
  }
}
