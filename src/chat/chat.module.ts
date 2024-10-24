import { Module } from '@nestjs/common';
import { ChatApiController } from './chat-api.controller';

@Module({
  imports: [],
  providers: [],
  exports: [],
  controllers: [ChatApiController],
})
export class ChatModule {}