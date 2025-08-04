import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  ): Promise<Conversation> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new BadRequestException(ResponseMessages.USER.NOT_FOUND);
      }

        // let knowledge: Knowledge[] = [];
        // if (knowledges?.length) {
        //   knowledge = await this.knowledgeRepository.findByIds(knowledges);
        // }

      const conversation = this.conversationRepository.create({
        title,
        user,
        //knowledge,
      });

      const newConversation = this.conversationRepository.save(conversation);
      return newConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  }

  async getConversations(userId: string): Promise<Conversation[]> {
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

      return conversations;
    } catch (error) {
      console.error('Error fetching conversations:', error);
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
        throw new BadRequestException('Conversation not found');
      }

      const newMessage = this.messageRepository.create({
        content,
        user,
        conversation,
      });
      const savedMessage = this.messageRepository.save(newMessage);

      return savedMessage;
    } catch (error) {
      console.error('Error creating message:', error);
    }
  }

  async uploadPdf(
    files: Express.Multer.File[],
    //conversationId?: string,
  ): Promise<Knowledge> {
    try {
      if (!files) {
        throw new BadRequestException('No file uploaded');
      }
      
      const savedKnowledge: Knowledge[] = [];

      for(const file of files){
      if (file.mimetype !== 'application/pdf') {
        throw new BadRequestException('Only PDF files are allowed');
      }

      const fileUrl = await this.uploaderService.upload(file.buffer);

      const knowledge = this.knowledgeRepository.create({
        url: fileUrl,
      });

      // if (conversationId) {
      //   const conversation = await this.conversationRepository.findOne({
      //     where: { id: conversationId },
      //   });
      //   if (!conversation) {
      //     throw new BadRequestException('Conversation not found');
      //   }
      //   knowledge.conversations = [conversation];
      // }

      return await this.knowledgeRepository.save(knowledge);
    }}
     catch (error) {
      console.error('Error uploading PDF:', error);
    }
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
}
