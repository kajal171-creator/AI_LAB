import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Conversation } from '../../../entities/conversation.entity';
import { Message } from '../../../entities/message.entity';
import { User } from '../../../entities/user.entity';
import { Knowledge } from 'src/entities/knowledge.entity';
import { ResponseMessages } from 'src/common/constants/response-message.constants';
import { UploaderService } from '../../../common/helpers/uplaod.helper';

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
    title: string,
    userId: string,
    //knowledges?: string[],
  ): Promise<{ message: string }> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new BadRequestException(ResponseMessages.USER.NOT_FOUND);
      }

      // let knowledge: Knowledge[] = [];
      // if (knowledges?.length) {
      //   knowledge = await this.knowledgeRepository.find({
      //     where: { id: In(knowledges) },
      //   });
      // }

      const conversation = this.conversationRepository.create({
        title,
        user,
        //knowledge,
      });

      await this.conversationRepository.save(conversation);

      return {
        message: ResponseMessages.RAG.CONVERSATION_CREATED,
      };
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  async getConversations(
    userId: string,
  ): Promise<{ message: string; conversations: Conversation[] }> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new BadRequestException(ResponseMessages.USER.NOT_FOUND);
      }
      const conversations = await this.conversationRepository.find({
        where: { user: { id: userId } },
        relations: ['messages', 'knowledge', 'user'],
        order: {
          createdAt: 'DESC',
          messages: { createdAt: 'ASC' },
        },
      });

      return { message: ResponseMessages.RAG.GET_CONVERSATION, conversations };
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  // Create Message
  async createMessage(
    conversationId: string,
    senderId: string,
    content: string,
  ): Promise<Message> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: senderId },
      });
      if (!user) {
        throw new BadRequestException(ResponseMessages.USER.NOT_FOUND);
      }

      const conversation = await this.conversationRepository.findOne({
        where: { id: conversationId },
      });
      if (!conversation) {
        throw new BadRequestException(ResponseMessages.CONVERSATION.NOT_FOUND);
      }

      const newMessage = this.messageRepository.create({
        content,
        user,
        conversation,
      });
      const savedMessage = await this.messageRepository.save(newMessage);

      return savedMessage;
    } catch (error) {
      console.error('Error creating message:', error);
    }
  }

  async uploadPdf(
    files: Express.Multer.File[],
    //conversationId?: string,
  ): Promise<{ message: string; knowledge: Knowledge[] }> {
    try {
      if (!files || (Array.isArray(files) && files.length === 0)) {
        throw new BadRequestException('No file uploaded');
      }

      const maxFileSize = 10 * 1024 * 1024;
      const validFiles = files.filter((file) => {
        return file.mimetype === 'application/pdf' && file.size <= maxFileSize;
      });

      if (validFiles.length === 0) {
        throw new BadRequestException(
          'No valid PDF files uploaded or file size exceeds 10 MB',
        );
      }

      const uploadedPdf = validFiles.map((file) =>
        this.uploaderService.upload(file.buffer),
      );

      const uploadedPdfUrls = await Promise.all(uploadedPdf);

      const pdfFiles = uploadedPdfUrls.map((url) =>
        this.knowledgeRepository.create({ url }),
      );

      const savedKnowledge = await this.knowledgeRepository.save(pdfFiles);

      // if (conversationId) {
      //   const conversation = await this.conversationRepository.findOne({
      //     where: { id: conversationId },
      //     relations: ['knowledge'],
      //   });
      //   if (!conversation) {
      //     throw new BadRequestException(
      //       ResponseMessages.CONVERSATION.NOT_FOUND,
      //     );
      //   }

      //   conversation.knowledge.push(...savedKnowledge);
      //   await this.conversationRepository.save(conversation);
      // }

      return {
        message: ResponseMessages.RAG.FILE_UPLOADED,
        knowledge: savedKnowledge,
      };
    } catch (error) {
      console.error('Error uploading PDF:', error);
      throw error;
    }
  }

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
}
