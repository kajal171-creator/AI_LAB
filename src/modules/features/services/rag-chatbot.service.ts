import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
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
import { RagEvaluation } from 'src/entities/rag-evaluation.entity';
import { CreateRagEvaluationDto } from '../dto/create-rag-evaluation.dto';
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
    @InjectRepository(RagEvaluation)
    private readonly ragEvaluationRepository: Repository<RagEvaluation>,
    private readonly uploaderService: UploaderService,
    private readonly aiAgentApiService: AiAgentApiService,
  ) {}

  // Create RAG Evaluation
  async createRagEvaluation(
    createRagEvaluationDto: CreateRagEvaluationDto,
  ): Promise<any> {
    try {
      const { query, answer, retrieved_contexts, reference } = createRagEvaluationDto;

      // Call the Python service to get the evaluation
      const evaluationResult = await this.aiAgentApiService.evaluateRag(
        query,
        answer,
        retrieved_contexts,
        reference,
      );

      const newEvaluation = this.ragEvaluationRepository.create({
        query,
        answer,
        retrieved_contexts,
        reference,
        ...evaluationResult.evaluation,
      });

      await this.ragEvaluationRepository.save(newEvaluation);

      return evaluationResult.evaluation;
    } catch (error) {
      console.error('Error creating RAG evaluation:', error);
      throw new InternalServerErrorException(
        'Failed to create RAG evaluation.',
      );
    }
  }

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
      select: ['id', 'title', 'createdAt', 'updatedAt', 'knowledge'],
      relations: ['knowledge'],
    });
  }

  async getAllChatsByConversation(conversationId, userId): Promise<Message[]> {
    const conversation = await this.conversationRepository.findOne({
      where: {
        id: conversationId,
        user: { id: userId },
      },
    });

    if (!conversation) {
      throw new BadRequestException(
        'Conversation not found or does not belong to the user',
      );
    }
    return await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where('message.conversation = :conversationId', { conversationId })
      .orderBy('message.createdAt', 'ASC')
      .getMany();
  }

  // Create Message
  async createMessage(body: CreateMessageDto, userId: string): Promise<string> {
    try {
      const [ai, user, allKnowledge, conversation] = await Promise.all([
        this.userRepository.findOne({ where: { role: UserRole.AI } }),
        this.userRepository.findOne({ where: { id: userId } }),
        this.knowledgeRepository.find({
          where: {
            id: In(body.knowledge),
            userId,
          },
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

      const aiResponse = await this.aiAgentApiService.chatWithPdf(
        body.content,
        allKnowledge.map((knowledge) => knowledge.fileName),
        userId,
      );
      const message = this.messageRepository.create({
        content: body.content,
        senderId: user.id,
        receiverId: ai.id,
        conversation: { id: conversation.id },
        user,
      });

      await this.messageRepository.save(message);

      const aiMessage = this.messageRepository.create({
        content: aiResponse,
        senderId: ai.id,
        receiverId: user.id,
        conversation: { id: conversation.id },
        user,
      });

      await this.messageRepository.save(aiMessage);

      return aiResponse;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // Upload PDF
  async uploadPdf(
    files: Express.Multer.File[],
    userId: string,
  ): Promise<Knowledge[]> {
    if (!files || !files.length) {
      throw new BadRequestException('No files uploaded');
    }

    const validFiles = files.filter(
      (file) => file.mimetype === 'application/pdf',
    );

    if (validFiles.length !== files.length) {
      const invalidFiles = files
        .filter((f) => f.mimetype !== 'application/pdf')
        .map((f) => f.originalname);
      throw new BadRequestException(
        `Only PDF files are allowed. Invalid files: ${invalidFiles.join(', ')}`,
      );
    }

    const uploadInputs = validFiles.map((file) => ({
      buffer: file.buffer,
      fileName: file.originalname,
      contentType: file.mimetype,
    }));

    const uploadedUrls = await Promise.all(
      uploadInputs.map(({ buffer, contentType, fileName }) =>
        this.uploaderService.upload(buffer, {
          mimetype: contentType,
          fileName,
          folder: 'pdfs',
        }),
      ),
    );

    const uploadedFiles = uploadedUrls.map((url, index) => ({
      fileName: uploadInputs[index].fileName,
      url,
    }));

    let embeddedResponse: { fileName: string }[];
    try {
      const payload = {
        userId,
        files: uploadedFiles,
      };

      const response = await this.aiAgentApiService.callEmbeddingAPI(payload);
      embeddedResponse = response.successFiles || [];
    } catch (error) {
      console.error('Error calling embedding API:', error);
      throw new InternalServerErrorException('Embedding generation failed');
    }

    const embeddedFileNames = new Set(embeddedResponse.map((f) => f.fileName));
    const failedEmbeddings = uploadedFiles
      .filter(({ fileName }) => !embeddedFileNames.has(fileName))
      .map((f) => f.fileName);

    if (failedEmbeddings.length > 0) {
      throw new BadRequestException(
        `Embedding failed for the following files: ${failedEmbeddings.join(', ')}`,
      );
    }

    const knowledgeEntities = uploadedFiles.map(({ fileName, url }) =>
      this.knowledgeRepository.create({
        userId,
        url,
        fileName,
      }),
    );

    return this.knowledgeRepository.save(knowledgeEntities);
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

      await this.conversationRepository.softDelete(conversation);

      return { message: ResponseMessages.RAG.DELETE_CONVERSATION };
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  // Get All Knowledge
  async getAllKnowledge(userId): Promise<Knowledge[]> {
    return await this.knowledgeRepository.find({
      where: { userId },
      select: ['id', 'url', 'createdAt', 'updatedAt', 'fileName'],
    });
  }
}
