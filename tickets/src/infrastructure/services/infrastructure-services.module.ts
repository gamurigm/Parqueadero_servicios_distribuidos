import { Module, Global } from '@nestjs/common';
import { TicketCodeGeneratorService } from './ticket-code-generator.service';
import { TarifaProviderService } from './tarifa-provider.service';

@Global()
@Module({
  providers: [TicketCodeGeneratorService, TarifaProviderService],
  exports: [TicketCodeGeneratorService, TarifaProviderService],
})
export class InfrastructureServicesModule {}
