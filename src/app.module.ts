import { Module } from '@nestjs/common';
import { EventModule } from './event/event.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [EventModule, ChatModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
