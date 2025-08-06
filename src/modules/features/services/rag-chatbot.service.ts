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
import { CreateMessageDto } from '../dto/create-message.dto';
import { AiAgentApiService } from 'src/modules/http-service/http-service.service';
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
    private readonly aiAgentApiService: AiAgentApiService,
  ) {}

  // Create Conversation
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
      throw error;
    }
  }

  // Get All Conversations
  async getAllConversations(userId): Promise<Conversation[]> {
    return await this.conversationRepository.find({
      where: { user: { id: userId } },
      select: ['id', 'title', 'createdAt', 'updatedAt'],
    });
  }

  // Create Message
  async createMessage(body: CreateMessageDto, userId: string): Promise<string> {
    try {
      const [ai, user, allKnowledge, conversation] = await Promise.all([
        this.userRepository.findOne({ where: { role: UserRole.AI } }),
        this.userRepository.findOne({ where: { id: userId } }),
        this.knowledgeRepository.findBy({
          id: In(body.knowledge),
          userId,
        }),
        this.conversationRepository.findOne({
          where: {
            id: body.conversation,
            user: { id: userId },
          },
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

      if (!conversation) {
        throw new BadRequestException(
          'Conversation not found or does not belong to the user',
        );
      }

      const message = this.messageRepository.create({
        content: body.content,
        senderId: user.id,
        receiverId: ai.id,
        conversation: { id: conversation.id },
        user,
      });

      await this.messageRepository.save(message);

      // Below logic is for AI response generation
      const firstPdfUrl = allKnowledge[0]?.url;
      if (!firstPdfUrl) {
        throw new BadRequestException('No PDF URL found for AI processing');
      }

      const aiResponse = await this.aiAgentApiService.chatWithPdf(
        body.content,
        firstPdfUrl,
      );

      const aiMessage = this.messageRepository.create({
        content: aiResponse,
        senderId: ai.id,
        receiverId: user.id,
        conversation: { id: conversation.id },
        user,
      });
      await this.messageRepository.save(aiMessage);

      return message.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
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

  // Upload PDF
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

  // Delete Conversation
  async deleteConversation(
    conversationId: string,
    userId: string,
  ): Promise<{ message: string }> {
    try {
      const conversation = await this.conversationRepository.findOne({
        where: { id: conversationId, user: { id: userId } },
      });
      if (!conversation) {
        throw new BadRequestException(ResponseMessages.CONVERSATION.NOT_FOUND);
      }

      await this.conversationRepository.remove(conversation);

      return { message: ResponseMessages.RAG.DELETE_CONVERSATION };
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  // async getAllKnowledge(userId): Promise<Knowledge[]> {
  //   return await this.knowledgeRepository.find({
  //     where: { userId },
  //     select: ['id', 'url', 'createdAt', 'updatedAt'],
  //   });
  // }

  async getAllKnowledge(userId): Promise<Knowledge[]> {
    return await this.knowledgeRepository.find({
      where: { userId },
      select: ['id', 'url', 'createdAt', 'updatedAt'],
    });
  }
}
