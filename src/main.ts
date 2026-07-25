import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use(helmet());
    app.setGlobalPrefix('api');

    const configService = app.get(ConfigService);
    const allowedOrigins = configService
        .get<string>('CORS_ORIGINS', '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

    app.enableCors({
        origin: allowedOrigins,
        methods: 'POST, GET, PATCH, DELETE',
        credentials: true,
    });

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            transformOptions: {
                exposeDefaultValues: true,
            },
        }),
    );
    app.use(cookieParser());

    const config = new DocumentBuilder()
        .setTitle('Snippet Manager API')
        .setDescription('API для управления шаблонами и иерархией тегов')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api-docs', app, document);

    await app.listen(process.env.PORT ?? 3002);
}
void bootstrap();
