import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateThreadDto, CreateReplyDto, ThreadQueryDto } from './dto/community.dto';

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) {}

  // --- Threads ---

  async createThread(tenantId: string, courseId: string, authorId: string, dto: CreateThreadDto) {
    // Verify course belongs to tenant
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, tenantId },
    });
    if (!course) {
      throw new NotFoundException('درس یافت نشد');
    }

    return this.prisma.forumThread.create({
      data: {
        tenantId,
        courseId,
        authorId,
        title: dto.title,
        body: dto.body,
      },
      include: {
        author: { select: { id: true, fullName: true, role: true } },
        _count: { select: { replies: true } },
      },
    });
  }

  async findThreads(tenantId: string, courseId: string, query: ThreadQueryDto) {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const pageSize = query.pageSize ? parseInt(query.pageSize, 10) : 20;

    const where: any = { tenantId, courseId };
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { body: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [threads, total] = await Promise.all([
      this.prisma.forumThread.findMany({
        where,
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          author: { select: { id: true, fullName: true, role: true } },
          _count: { select: { replies: true } },
        },
      }),
      this.prisma.forumThread.count({ where }),
    ]);

    return { threads, total, page, pageSize };
  }

  async findThreadById(tenantId: string, threadId: string) {
    const thread = await this.prisma.forumThread.findFirst({
      where: { id: threadId, tenantId },
      include: {
        author: { select: { id: true, fullName: true, role: true } },
        course: { select: { id: true, title: true, slug: true } },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: { id: true, fullName: true, role: true } },
            _count: { select: { likes: true } },
          },
        },
        _count: { select: { replies: true } },
      },
    });
    if (!thread) {
      throw new NotFoundException('موضوع یافت نشد');
    }
    return thread;
  }

  // --- Replies ---

  async createReply(tenantId: string, threadId: string, authorId: string, dto: CreateReplyDto) {
    const thread = await this.prisma.forumThread.findFirst({
      where: { id: threadId, tenantId },
    });
    if (!thread) {
      throw new NotFoundException('موضوع یافت نشد');
    }
    if (thread.isLocked) {
      throw new ForbiddenException('این موضوع قفل شده است');
    }

    // Create reply and increment reply count in a transaction
    const [reply] = await this.prisma.$transaction([
      this.prisma.forumReply.create({
        data: {
          threadId,
          authorId,
          body: dto.body,
        },
        include: {
          author: { select: { id: true, fullName: true, role: true } },
        },
      }),
      this.prisma.forumThread.update({
        where: { id: threadId },
        data: { replyCount: { increment: 1 } },
      }),
    ]);

    return reply;
  }

  // --- Like/Unlike ---

  async toggleLike(tenantId: string, replyId: string, userId: string) {
    // Verify reply belongs to tenant
    const reply = await this.prisma.forumReply.findFirst({
      where: {
        id: replyId,
        thread: { tenantId },
      },
    });
    if (!reply) {
      throw new NotFoundException('پاسخ یافت نشد');
    }

    const existing = await this.prisma.forumLike.findUnique({
      where: { replyId_userId: { replyId, userId } },
    });

    if (existing) {
      // Unlike
      await this.prisma.$transaction([
        this.prisma.forumLike.delete({ where: { id: existing.id } }),
        this.prisma.forumReply.update({
          where: { id: replyId },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);
      return { liked: false };
    } else {
      // Like
      await this.prisma.$transaction([
        this.prisma.forumLike.create({ data: { replyId, userId } }),
        this.prisma.forumReply.update({
          where: { id: replyId },
          data: { likeCount: { increment: 1 } },
        }),
      ]);
      return { liked: true };
    }
  }

  // --- Mark as Answer ---

  async markAsAnswer(tenantId: string, replyId: string, userId: string, userRole: string) {
    const reply = await this.prisma.forumReply.findFirst({
      where: {
        id: replyId,
        thread: { tenantId },
      },
      include: {
        thread: { select: { authorId: true, courseId: true } },
      },
    });
    if (!reply) {
      throw new NotFoundException('پاسخ یافت نشد');
    }

    // Only the thread author or instructor/admin can mark as answer
    const isThreadAuthor = reply.thread.authorId === userId;
    const isPrivileged = ['admin', 'instructor', 'teaching_assistant'].includes(userRole);
    if (!isThreadAuthor && !isPrivileged) {
      throw new ForbiddenException('شما مجاز به انتخاب پاسخ نیستید');
    }

    // Unmark any existing answer on this thread, then mark the new one
    await this.prisma.$transaction([
      this.prisma.forumReply.updateMany({
        where: { threadId: reply.threadId, isAnswer: true },
        data: { isAnswer: false },
      }),
      this.prisma.forumReply.update({
        where: { id: replyId },
        data: { isAnswer: true },
      }),
    ]);

    return { marked: true };
  }

  // --- Thread moderation ---

  async togglePin(tenantId: string, threadId: string) {
    const thread = await this.prisma.forumThread.findFirst({
      where: { id: threadId, tenantId },
    });
    if (!thread) {
      throw new NotFoundException('موضوع یافت نشد');
    }

    return this.prisma.forumThread.update({
      where: { id: threadId },
      data: { isPinned: !thread.isPinned },
    });
  }

  async toggleLock(tenantId: string, threadId: string) {
    const thread = await this.prisma.forumThread.findFirst({
      where: { id: threadId, tenantId },
    });
    if (!thread) {
      throw new NotFoundException('موضوع یافت نشد');
    }

    return this.prisma.forumThread.update({
      where: { id: threadId },
      data: { isLocked: !thread.isLocked },
    });
  }
}
