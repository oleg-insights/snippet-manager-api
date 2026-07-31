import { Module } from '@nestjs/common';
import { DemoService } from './demo.service';
import { DemoController } from './demo.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [AuthModule, UsersModule],
    controllers: [DemoController],
    providers: [DemoService],
})
export class DemoModule {}
