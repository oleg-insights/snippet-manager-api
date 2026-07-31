import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { demoTemplates } from './data/demo-templates.data';
import { randomString } from 'src/common/utils/random-string.util';
import { AuthService } from 'src/auth/auth.service';
import { User } from '@prisma/client';
import { JwtTokens } from 'src/auth/interfaces/jwt-tokens.interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class DemoService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) {}

    async createDemoAccount(userAgent: string | null, ip: string | null): Promise<{ user: User; tokens: JwtTokens }> {
        const name = `Demo_${randomString(5)}`;
        const email = `${name}@demo.com`;
        const password = `${name}_p`;

        return await this.prisma.$transaction(async () => {
            await this.authService.registerUser({ name, email, password });
            const user: User = await this.authService.validateUser({ email, password });
            await this.usersService.updateUser(user.id, {
                avatar: 'https://i.ibb.co/HDFC5Tyt/400x400-bgcolor-4590bf-textcolor-ffffff-text-D-fmt-png.png',
            });
            const tokens = await this.authService.generateTokens(user.id, user.role);
            const { refreshToken, expiresAt } = tokens;
            await this.authService.createSession(user.id, refreshToken, expiresAt, userAgent, ip);

            await this.fillDemoTemplates(user.id);

            return { user, tokens };
        });
    }

    async fillDemoTemplates(authorId: string): Promise<void> {
        for (const tpl of demoTemplates) {
            const tagIds: string[] = [];
            for (const tagName of tpl.tagNames) {
                const existingTag = await this.prisma.tag.findFirst({
                    where: { name: tagName },
                });

                if (existingTag) {
                    tagIds.push(existingTag.id);
                } else {
                    const tag = await this.prisma.tag.create({
                        data: {
                            name: tagName,
                            authorId,
                            scopeUserId: authorId,
                        },
                    });
                    if (tag) tagIds.push(tag.id);
                }
            }

            await this.prisma.template.create({
                data: {
                    title: `${tpl.title}(demo_${randomString(5)})`,
                    content: tpl.content,
                    authorId,
                    isPublic: false,
                    tags: { connect: tagIds.map((id) => ({ id })) },
                },
            });
        }
    }
}
