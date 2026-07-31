import { Controller, Ip, Headers, Post, Res, UseGuards } from '@nestjs/common';
import { DemoService } from './demo.service';
import { LoginUserResponseDto } from 'src/auth/dto/login-user-response.dto';
import type { Response } from 'express';
import { getCookieConfig } from 'src/common/config/cookie.config';
import { ConfigService } from '@nestjs/config';
import { toUserPrivateDto } from 'src/users/helpers/user-mapper.helper';
import { ApiConflictResponse, ApiCreatedResponse, ApiOperation, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { ConflictResponseDto, TooManyRequestsResponseDto } from 'src/common/dto/error-responses.dto';
import { CustomThrottlerGuard } from 'src/common/guards/custom-trottler.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('demo')
export class DemoController {
    constructor(
        private readonly demoService: DemoService,
        private readonly configService: ConfigService,
    ) {}

    @ApiOperation({ summary: 'Создание и наполнение демо-аккаунта' })
    @ApiCreatedResponse({
        description: 'Аккаунт и шаблоны созданы, вход выполнен',
        type: LoginUserResponseDto,
        headers: {
            'Set-Cookie': {
                description: 'Записывает refreshToken. Флаги HttpOnly, Secure (prod), SameSite=Strict, expires',
                schema: {
                    type: 'string',
                    example: 'refreshToken=xyz123; HttpOnly; SameSite=Strict; expires=1000000000',
                },
            },
        },
    })
    @ApiConflictResponse({ description: 'Пересечение тестовых данных', type: ConflictResponseDto })
    @ApiTooManyRequestsResponse({ description: 'Превышен лимит запросов', type: TooManyRequestsResponseDto })
    @UseGuards(CustomThrottlerGuard)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Post('create')
    async createDemoAccount(
        @Headers('user-agent') userAgent: string | null,
        @Ip() ip: string | null,
        @Res({ passthrough: true }) res: Response,
    ): Promise<LoginUserResponseDto> {
        const { user, tokens } = await this.demoService.createDemoAccount(userAgent, ip);

        res.cookie('refreshToken', tokens.refreshToken, {
            ...getCookieConfig(this.configService),
            expires: tokens.expiresAt,
        });

        return { user: toUserPrivateDto(user), accessToken: tokens.accessToken };
    }
}
