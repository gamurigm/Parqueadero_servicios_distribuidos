import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketEntity } from './ticket.entity';
import { TicketRepository } from './ticket.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TicketEntity])],
  providers: [TicketRepository],
  exports: [TicketRepository],
})
export class TicketRepositoryModule {}
