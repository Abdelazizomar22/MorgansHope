import type { Options } from 'swagger-jsdoc';

const swaggerConfig: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: "Morgan's Hope API",
      version: '3.1.0',
      description:
        "AI-assisted platform for early lung cancer screening using chest CT scans and X-ray images. Supports scan analysis, result review, hospital guidance, and a patient-facing assistant.",
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Development' },
      { url: 'https://morgans-hope-backend.vercel.app', description: 'Production' },
    ],
    tags: [
      { name: 'Health', description: 'Server health and status' },
      { name: 'Auth', description: 'Authentication and user management' },
      { name: 'Analysis', description: 'Scan upload and result management' },
      { name: 'Hospitals', description: 'Oncology hospital directory' },
      { name: 'Chat', description: 'AI medical assistant chat' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Paste your Bearer access token here. Get one by registering or logging in via /api/auth/login.',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {},
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
        SafeUser: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            fullName: { type: 'string' },
            email: { type: 'string', nullable: true },
            phone: { type: 'string' },
            emailVerified: { type: 'boolean' },
            phoneVerified: { type: 'boolean' },
            acceptedDisclaimer: { type: 'boolean' },
            onboardingCompleted: { type: 'boolean' },
            authProvider: { type: 'string', enum: ['local', 'google'] },
            age: { type: 'integer', nullable: true },
            gender: { type: 'string', enum: ['male', 'female', 'other'], nullable: true },
            smokingHistory: { type: 'string', enum: ['never', 'former', 'current'], nullable: true },
            medicalHistory: { type: 'string', nullable: true },
            profilePicture: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['user', 'admin'] },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        AnalysisResult: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            userId: { type: 'integer' },
            imageType: { type: 'string', enum: ['xray', 'ct'] },
            imagePath: { type: 'string' },
            originalFilename: { type: 'string' },
            classification: { type: 'string' },
            confidence: { type: 'number' },
            hasFindings: { type: 'boolean' },
            hasCancer: { type: 'boolean', nullable: true },
            cancerProbability: { type: 'number', nullable: true },
            isMalignant: { type: 'boolean', nullable: true },
            allProbabilities: { type: 'object', additionalProperties: { type: 'number' } },
            nextStep: { type: 'string', nullable: true },
            sessionId: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['pending', 'completed', 'failed'] },
            processingTimeMs: { type: 'integer', nullable: true },
            urgencyLevel: { type: 'string', enum: ['none', 'low', 'medium', 'high', 'critical'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Hospital: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            cityId: { type: 'integer' },
            hospitalName: { type: 'string' },
            specialization: { type: 'string' },
            address: { type: 'string' },
            phone: { type: 'string' },
            website: { type: 'string', nullable: true },
            rating: { type: 'number' },
            totalReviews: { type: 'integer' },
            imageUrl: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
            city: { $ref: '#/components/schemas/City' },
          },
        },
        City: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            cityName: { type: 'string' },
            state: { type: 'string' },
            country: { type: 'string' },
          },
        },
        UploadResponse: {
          type: 'object',
          properties: {
            result: { $ref: '#/components/schemas/AnalysisResult' },
            urgencyLevel: { type: 'string', enum: ['none', 'low', 'medium', 'high', 'critical'] },
            recommendedHospitals: {
              type: 'array',
              items: { $ref: '#/components/schemas/Hospital' },
            },
            processingTimeMs: { type: 'integer' },
          },
        },
        ChatTurn: {
          type: 'object',
          properties: {
            role: { type: 'string', enum: ['user', 'assistant'] },
            content: { type: 'string' },
          },
        },
        HealthData: {
          type: 'object',
          properties: {
            server: { type: 'string', example: 'online' },
            database: { type: 'string', example: 'online' },
            ai: {
              type: 'object',
              properties: {
                ctService: { type: 'string', example: 'online' },
                xrayService: { type: 'string', example: 'online' },
              },
            },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
        RegisterInput: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'acceptedDisclaimer'],
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8, description: 'Must contain uppercase, lowercase, and number' },
            confirmPassword: { type: 'string' },
            acceptedDisclaimer: { type: 'boolean' },
            age: { type: 'integer' },
            gender: { type: 'string', enum: ['male', 'female', 'other'] },
            smokingHistory: { type: 'string', enum: ['never', 'former', 'current'] },
            medicalHistory: { type: 'string' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['password'],
          properties: {
            email: { type: 'string', format: 'email', description: 'Email address (use this or identifier)' },
            identifier: { type: 'string', description: 'Email or phone (alternative to email)' },
            password: { type: 'string', description: 'Account password' },
            rememberMe: { type: 'boolean' },
          },
          example: { email: 'admin@medtech.com', password: 'Admin@123456' },
        },
        UpdateProfileInput: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string' },
            age: { type: 'integer' },
            gender: { type: 'string', enum: ['male', 'female', 'other'] },
            smokingHistory: { type: 'string', enum: ['never', 'former', 'current'] },
            medicalHistory: { type: 'string' },
            onboardingCompleted: { type: 'boolean' },
            currentPassword: { type: 'string', description: 'Required if changing password' },
            newPassword: { type: 'string', minLength: 8 },
          },
        },
        ChatInput: {
          type: 'object',
          required: ['message'],
          properties: {
            message: { type: 'string', minLength: 1, maxLength: 4000 },
            history: {
              type: 'array',
              maxItems: 12,
              items: { $ref: '#/components/schemas/ChatTurn' },
            },
          },
        },
      },
    },
    paths: {},
  },
  apis: ['./src/routes/*.ts', './src/server.ts'],
};

export default swaggerConfig;
