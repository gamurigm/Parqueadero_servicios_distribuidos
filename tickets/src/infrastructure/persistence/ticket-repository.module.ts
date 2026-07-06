import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketEntity } from './ticket.entity';
import { TicketRepository } from './ticket.repository';
import { TICKET_REPOSITORY } from '../../application/ports/ticket-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([TicketEntity])],
  providers: [
    {
      provide: TICKET_REPOSITORY,
      useClass: TicketRepository,
    },
    TicketRepository,
  ],
  exports: [
    TICKET_REPOSITORY,
    TicketRepository,
  ],
})
export class TicketRepositoryModule {}