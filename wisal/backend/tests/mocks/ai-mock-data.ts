// Mock data for AI integration testing
export const mockQueryResponses = {
  visaStatus: {
    intent: "visa_status_inquiry",
    confidence: 0.95,
    entities: {
      type: "visa",
      action: "status_check"
    },
    suggestedResponse: "I can help you check your visa application status. Please provide your application number and passport number.",
    requiredInfo: ["application_number", "passport_number"]
  },
  
  passportRenewal: {
    intent: "passport_renewal",
    confidence: 0.92,
    entities: {
      type: "passport",
      action: "renewal"
    },
    suggestedResponse: "I can guide you through the passport renewal process. The standard renewal takes 6-8 weeks.",
    requiredInfo: ["current_passport_number", "expiry_date"]
  },
  
  legalAdvice: {
    intent: "legal_consultation",
    confidence: 0.88,
    entities: {
      type: "consultation",
      topic: "immigration_law"
    },
    suggestedResponse: "For legal advice, I recommend consulting with one of our certified immigration lawyers.",
    requiredInfo: ["specific_issue", "country_of_origin"]
  }
};

export const mockCategories = {
  visa: {
    keywords: ["visa", "application", "status", "processing", "approval"],
    examples: [
      "What is the status of my visa application?",
      "How long does visa processing take?",
      "My visa was rejected, what can I do?"
    ]
  },
  
  passport: {
    keywords: ["passport", "renewal", "expedite", "lost", "stolen"],
    examples: [
      "How do I renew my passport?",
      "I lost my passport while traveling",
      "Can I expedite passport processing?"
    ]
  },
  
  general: {
    keywords: ["help", "information", "question", "support"],
    examples: [
      "I need help with immigration",
      "Can you provide information about travel requirements?",
      "General inquiry about services"
    ]
  },
  
  technical: {
    keywords: ["website", "login", "account", "error", "bug"],
    examples: [
      "I can't login to my account",
      "The website is showing an error",
      "How do I reset my password?"
    ]
  }
};

export const mockSearchResults = [
  {
    text: "Visa processing typically takes 15-20 business days from the date of application submission.",
    score: 0.94,
    metadata: {
      documentId: "doc-visa-001",
      section: "processing_times",
      lastUpdated: "2024-01-15"
    }
  },
  {
    text: "Express visa processing is available for urgent travel, reducing processing time to 5-7 business days.",
    score: 0.88,
    metadata: {
      documentId: "doc-visa-002",
      section: "express_service",
      lastUpdated: "2024-01-10"
    }
  },
  {
    text: "Visa applications require: valid passport, completed form DS-160, photo, and supporting documents.",
    score: 0.82,
    metadata: {
      documentId: "doc-visa-003",
      section: "requirements",
      lastUpdated: "2024-01-20"
    }
  }
];

export const mockSuggestionTemplates = {
  professional: [
    "Thank you for your inquiry. [MAIN_CONTENT]. Please let me know if you need any clarification.",
    "I understand your concern about [TOPIC]. [MAIN_CONTENT]. Is there anything else I can help you with?",
    "[MAIN_CONTENT]. For more detailed information, please refer to our official documentation."
  ],
  
  friendly: [
    "Hi there! [MAIN_CONTENT]. Feel free to ask if you have any other questions!",
    "Great question! [MAIN_CONTENT]. Hope this helps!",
    "Thanks for reaching out! [MAIN_CONTENT]. Let me know if you need anything else!"
  ],
  
  formal: [
    "Dear valued client, [MAIN_CONTENT]. Should you require further assistance, please do not hesitate to contact us.",
    "In response to your inquiry: [MAIN_CONTENT]. We remain at your service for any additional questions.",
    "[MAIN_CONTENT]. We appreciate your patience and understanding in this matter."
  ]
};

export const mockConversationContext = {
  recentMessages: [
    {
      role: "user",
      content: "I applied for my visa last week",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      role: "assistant",
      content: "Thank you for applying. Your visa application has been received and is being processed.",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 60000)
    },
    {
      role: "user",
      content: "When will I hear back about the decision?",
      timestamp: new Date()
    }
  ],
  
  userProfile: {
    name: "Test User",
    applicationNumber: "VA2024001234",
    applicationType: "tourist_visa",
    submissionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  }
};

export const mockEmbeddings = {
  dimensions: 768,
  model: "text-embedding-ada-002",
  generateMockEmbedding: (seed: number = 0.1) => {
    return new Array(768).fill(0).map((_, i) => 
      Math.sin(seed * i) * 0.1 + Math.random() * 0.01
    );
  }
};

export const mockAIServiceErrors = {
  rateLimitExceeded: {
    code: "RATE_LIMIT_EXCEEDED",
    message: "API rate limit exceeded. Please try again later.",
    retryAfter: 60
  },
  
  invalidApiKey: {
    code: "INVALID_API_KEY",
    message: "Invalid API key provided",
    status: 401
  },
  
  serviceUnavailable: {
    code: "SERVICE_UNAVAILABLE",
    message: "AI service is temporarily unavailable",
    status: 503
  },
  
  invalidInput: {
    code: "INVALID_INPUT",
    message: "The provided input does not meet the required format",
    status: 400
  }
};

// Performance test data
export const performanceTestData = {
  largeTextBatch: new Array(50).fill(null).map((_, i) => 
    `This is test text number ${i} for performance testing of batch operations`
  ),
  
  complexQuery: `I am a software engineer from India currently on H1B visa in the US. 
    My visa expires in 6 months and I want to apply for green card. My employer is willing 
    to sponsor me. What are my options and what documents do I need? Also, can my spouse 
    work while my green card is being processed? We have been married for 3 years and 
    she is currently on H4 visa. Additionally, I'm interested in knowing about the premium 
    processing options and typical timeline for EB2 category.`,
  
  largeCategoriesList: [
    "visa_b1", "visa_b2", "visa_f1", "visa_h1b", "visa_h4", "visa_l1", "visa_o1",
    "green_card_eb1", "green_card_eb2", "green_card_eb3", "green_card_family",
    "citizenship", "passport_new", "passport_renewal", "passport_lost",
    "legal_consultation", "document_translation", "form_assistance",
    "appeal_process", "status_check", "general_inquiry"
  ]
};