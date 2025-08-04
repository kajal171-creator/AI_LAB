import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Conversation } from '../../../entities/conversation.entity';
import { Message } from '../../../entities/message.entity';
import { User } from '../../../entities/user.entity';
import { Knowledge } from 'src/entities/knowledge.entity';
import { ResponseMessages } from 'src/common/constants/response-message.constants';
import { UploaderService } from '../../../common/helpers/uplaod.helper';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { UserRole } from 'src/common/enums/role.enum';

@Injectable()
export class RagChatbotService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Knowledge)
    private readonly knowledgeRepository: Repository<Knowledge>,
    private readonly uploaderService: UploaderService,
  ) {}

  async createConversation(
    body: CreateConversationDto,
    userId: string,
  ): Promise<string> {
    try {
      const [ai, user, allKnowledge] = await Promise.all([
        this.userRepository.findOne({ where: { role: UserRole.AI } }),
        this.userRepository.findOne({ where: { id: userId } }),
        this.knowledgeRepository.findBy({
          id: In(body.knowledge),
          userId,
        }),
      ]);
      if (!user) {
        throw new BadRequestException(ResponseMessages.USER.NOT_FOUND);
      }

      if (allKnowledge.length !== body.knowledge.length) {
        const foundIds = new Set(allKnowledge.map((k) => k.id));
        const missingIds = body.knowledge.filter((id) => !foundIds.has(id));
        throw new BadRequestException(
          `Invalid knowledge IDs: ${missingIds.join(', ')}`,
        );
      }

      const conversation = this.conversationRepository.create({
        title: body.title,
        aiUser: ai,
        user,
        knowledge: allKnowledge,
      });

      await this.conversationRepository.save(conversation);

      return conversation.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  }

  // async getConversations(userId: string): Promise<Conversation[]> {
  //   try {
  //     const user = await this.userRepository.findOne({
  //       where: { id: userId },
  //     });
  //     if (!user) {
  //       throw new BadRequestException(ResponseMessages.USER.NOT_FOUND);
  //     }
  //     const conversations = await this.conversationRepository.find({
  //       where: { user: { id: userId } },
  //       relations: ['messages', 'knowledge', 'user'],
  //       order: {
  //         createdAt: 'DESC',
  //         messages: { createdAt: 'ASC' },
  //       },
  //     });

  //     return conversations;
  //   } catch (error) {
  //     console.error('Error fetching conversations:', error);
  //   }
  // }

  // // Create Message
  // async createMessage(
  //   conversationId: string,
  //   senderId: string,
  //   content: string,
  // ): Promise<void> {
  //   try {
  //     const [aiUser, user] = await Promise.all([
  //       this.userRepository.findOne({ where: { role: UserRole.AI } }),
  //       this.userRepository.findOne({
  //         where: { id: senderId },
  //       }),
  //     ]);
  //     if (!user) {
  //       throw new BadRequestException(ResponseMessages.USER.NOT_FOUND);
  //     }

  //     const conversation = await this.conversationRepository.findOne({
  //       where: { id: conversationId },
  //       relations: ['knowledge'],
  //     });
  //     if (!conversation) {
  //       throw new BadRequestException('Conversation not found');
  //     }
  //     const urls = conversation.knowledge.map((k) => k.url);

  //     const payload = {
  //       knowledge: urls,
  //       content,
  //     };

  //     const newMessage = this.messageRepository.create({
  //       content,
  //       senderId,
  //       receiverId: aiUser.id,
  //       conversation,
  //     });

  //     const agentMessage = this.messageRepository.create({
  //       receiverId: aiUser.id,
  //       senderId,
  //       conversation,
  //     });
  //   } catch (error) {
  //     console.error('Error creating message:', error);
  //   }
  // }

  async uploadPdf(files: Express.Multer.File[], userId): Promise<Knowledge[]> {
    if (!files || !files.length) {
      throw new BadRequestException('No files uploaded');
    }

    const uploadInputs = files.map((file) => {
      if (file.mimetype !== 'application/pdf') {
        throw new BadRequestException(
          `Only PDF files are allowed: ${file.originalname}`,
        );
      }

      return {
        buffer: file.buffer,
        fileName: file.originalname,
        contentType: file.mimetype,
      };
    });

    const uploadedUrls = await Promise.all(
      uploadInputs.map(({ buffer, contentType, fileName }) =>
        this.uploaderService.upload(buffer, {
          mimetype: contentType,
          fileName,
          folder: 'pdfs',
        }),
      ),
    );

    const knowledgeEntities = uploadedUrls.map((url, index) =>
      this.knowledgeRepository.create({
        url,
        userId,
      }),
    );

    await Promise.all(
      knowledgeEntities.map((entity) => this.knowledgeRepository.save(entity)),
    );
    return null;
  }

  async deleteConversation(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    try {
      const conversation = await this.conversationRepository.findOne({
        where: { id: conversationId, user: { id: userId } },
      });
      if (!conversation) {
        throw new BadRequestException('Conversation not found');
      }

      await this.conversationRepository.remove(conversation);
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }

  async getAllKnowledge(userId): Promise<Knowledge[]> {
    return await this.knowledgeRepository.find({
      where: { userId },
      select: ['id', 'url', 'createdAt', 'updatedAt'],
    });
  }
}
