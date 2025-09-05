export const ResponseMessages = {
  AUTH: {
    LOGIN_SUCCESS: 'Login successful',
    LOGIN_FAILED: 'Invalid credentials',
    UNAUTHORIZED: 'Unauthorized access',
    TOKEN_EXPIRED: 'Token has expired',
    LOGOUT_SUCCESS: 'Logged out successfully',
  },
  USER: {
    CREATED: 'User created successfully',
    UPDATED: 'User updated successfully',
    NOT_FOUND: 'User not found',
    EMAIL_ALREADY_EXISTS: 'Email already exists',
    USERNAME_ALREADY_EXISTS: 'Username already exists',
    INVALID_CREDENTIALS: 'Invalid Credentials',
  },
  CONVERSATION: {
    CREATED: 'Conversation created successfully',
    NOT_FOUND: 'Conversation not found',
    DELETED: 'Conversation deleted successfully',
  },
  COMMON: {
    SUCCESS: 'Operation completed successfully',
    FAILURE: 'Something went wrong',
    NOT_FOUND: 'Resource not found',
    FORBIDDEN: 'Access denied',
    IMAGE_GENERATION_SUCCESS: 'Image generated successfully',
    IMAGE_GENERATION_FAILED: 'Image generation failed. Please try again later.',
    SOMETHING_WENT_WRONG: 'Something Went Wrong',
    RESUME_NOT_FOUND: 'Resume not found',
    UPLOAD_FOLDERS: 'Upload folders'
  },
  VALIDATION: {
    MISSING_FIELDS: 'Required fields are missing',
    INVALID_INPUT: 'Input data is invalid',
  },
  COOKIE: {
    SET: 'Cookie set successfully',
    CLEARED: 'Cookie cleared',
  },
  HEALTH_CHECK: {
    HEALTH_CHECK_MESSAGE: 'ANTINO AI BACKEND Service Health Check Route',
  },

  Translation: {
    TRANSLATION_ERROR: 'AI translation failed',
    NOT_FOUND: 'Translation not found for this user',
  },

  RAG: {
    FILE_UPLOADED: 'PDF file uploaded successfully',
    MESSAGE_CREATED: 'Chat created successfully',
    MESSAGE_SAVED: 'Chat message saved successfully',
    CONVERSATION_NOT_FOUND: 'Conversation not found',
    GET_CONVERSATION: 'Conversation retrieved successfully',
    DELETE_CONVERSATION: 'Conversation deleted successfully',
    CONVERSATION_CREATED: 'Conversation created successfully',
  },

  RESUME:{
    ANALYSIS_SUCCESS: 'Resumes analyzed successfully',
    FETCHED_SUCCESS: 'Resume fetched successfully',
    ANALYZE_FAILED: 'Analysis failed, no data returned from AI service',
  }
};
