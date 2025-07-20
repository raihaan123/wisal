import { StateGraph, END, START } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
// import { ConversationSummaryMemory } from 'langchain/memory'; // Memory not available in current langchain version
import { z } from 'zod';
import { Conversation, Message, AISuggestionRequest } from '../../types';
import { defaultAIConfig } from '../config';

// Define the conversation state schema
const ConversationStateSchema = z.object({
  // Identifiers
  conversationId: z.string(),
  seekerId: z.string(),
  lawyerId: z.string(),
  
  // Current message
  currentMessage: z.string(),
  messageType: z.enum(['seeker', 'lawyer']),
  
  // Conversation history
  messages: z.array(z.custom<BaseMessage>()).default([]),
  messageCount: z.number().default(0),
  
  // Context and memory
  conversationSummary: z.string().optional(),
  legalContext: z.object({
    category: z.string(),
    keyIssues: z.array(z.string()),
    jurisdiction: z.string().optional(),
  }).optional(),
  
  // AI assistance
  suggestions: z.array(z.string()).default([]),
  legalCitations: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  
  // Control flow
  stage: z.enum([
    'receiving',
    'analyzing',
    'generating_suggestions',
    'checking_compliance',
    'finalizing',
    'complete'
  ]).default('receiving'),
  
  error: z.string().optional(),
});

export type ConversationState = z.infer<typeof ConversationStateSchema>;

// Create the conversational agent graph
export function createConversationalAgentGraph() {
  // Create workflow without schema - add nodes and edges manually
  const workflow = new StateGraph<ConversationState>({});

  const llm = new ChatOpenAI({
    openAIApiKey: defaultAIConfig.openai.apiKey,
    modelName: defaultAIConfig.openai.model,
    temperature: 0.5, // Lower temperature for more consistent legal advice
  });

  // Memory for conversation context
  // const memory = new ConversationSummaryMemory({
  //   llm,
  //   memoryKey: 'conversationSummary',
  //   returnMessages: true,
  // });

  // Analyze incoming message
  workflow.addNode('analyze_message', async (state) => {
    console.log('Analyzing message:', state.currentMessage);
    
    const systemPrompt = `You are analyzing a message in a legal consultation conversation.
Identify:
1. Key legal points or questions raised
2. Any urgent matters that need immediate attention
3. Whether the message requires legal expertise to answer
4. Any potential legal risks or compliance issues

Format as JSON:
{
  "keyPoints": ["string"],
  "urgentMatters": ["string"],
  "requiresLegalExpertise": boolean,
  "potentialRisks": ["string"],
  "suggestedTopics": ["string"]
}`;

    try {
      const response = await llm.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(state.currentMessage)
      ]);

      const analysis = JSON.parse(response.content as string);
      
      // Add warnings if risks identified
      const warnings = analysis.potentialRisks.length > 0 
        ? [`Legal Notice: ${analysis.potentialRisks.join(', ')}`]
        : [];
      
      return {
        warnings,
        stage: 'generating_suggestions',
      };
    } catch (error) {
      console.error('Error analyzing message:', error);
      return {
        stage: 'generating_suggestions',
      };
    }
  });

  // Generate response suggestions
  workflow.addNode('generate_suggestions', async (state) => {
    console.log('Generating suggestions for:', state.messageType);
    
    const role = state.messageType === 'seeker' ? 'lawyer' : 'seeker';
    const systemPrompt = role === 'lawyer' 
      ? `You are assisting a lawyer in responding to a legal query. Generate 3 professional, helpful response suggestions that:
1. Address the key points raised
2. Provide clear legal guidance (with appropriate disclaimers)
3. Ask clarifying questions if needed
4. Maintain professional tone
5. Include relevant legal considerations

Context: ${state.legalContext ? JSON.stringify(state.legalContext) : 'General legal consultation'}`
      : `You are assisting someone seeking legal advice. Generate 3 response suggestions that:
1. Clearly express their concerns or questions
2. Provide relevant details
3. Ask appropriate follow-up questions
4. Maintain respectful tone`;

    try {
      // Include conversation history for context
      const recentMessages = state.messages.slice(-5).map(msg => ({
        role: msg._getType() === 'human' ? 'user' : 'assistant',
        content: msg.content,
      }));

      const response = await llm.invoke([
        new SystemMessage(systemPrompt),
        ...recentMessages.map(msg => 
          msg.role === 'user' ? new HumanMessage(String(msg.content)) : new AIMessage(String(msg.content))
        ),
        new HumanMessage(`Current message: ${state.currentMessage}\n\nGenerate 3 response suggestions as a JSON array of strings.`)
      ]);

      const suggestions = JSON.parse(response.content as string);
      
      return {
        suggestions: Array.isArray(suggestions) ? suggestions : [suggestions],
        stage: 'checking_compliance',
      };
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return {
        suggestions: [
          'I understand your concern. Could you provide more details?',
          'Thank you for your message. Let me address your points.',
          'I appreciate you reaching out. Here\'s what I can help with.',
        ],
        stage: 'checking_compliance',
      };
    }
  });

  // Check legal compliance
  workflow.addNode('check_compliance', async (state) => {
    console.log('Checking legal compliance');
    
    if (state.messageType !== 'lawyer') {
      return { stage: 'finalizing' };
    }

    const systemPrompt = `Review these lawyer response suggestions for legal compliance:
1. Check for unauthorized practice of law issues
2. Ensure appropriate disclaimers are included
3. Verify no guarantees of outcomes
4. Confirm ethical boundaries are maintained

Suggestions to review:
${state.suggestions.join('\n\n')}

Return JSON with:
{
  "compliant": boolean,
  "issues": ["string"],
  "requiredDisclaimer": "string" // if needed
}`;

    try {
      const response = await llm.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage('Review compliance')
      ]);

      const compliance = JSON.parse(response.content as string);
      
      if (!compliance.compliant && compliance.requiredDisclaimer) {
        // Add disclaimer to suggestions
        const updatedSuggestions = state.suggestions.map(s => 
          `${s}\n\n${compliance.requiredDisclaimer}`
        );
        
        return {
          suggestions: updatedSuggestions,
          stage: 'finalizing',
        };
      }
      
      return { stage: 'finalizing' };
    } catch (error) {
      console.error('Error checking compliance:', error);
      return { stage: 'finalizing' };
    }
  });

  // Find relevant legal citations
  workflow.addNode('find_citations', async (state) => {
    console.log('Finding legal citations');
    
    if (state.messageType !== 'lawyer' || !state.legalContext) {
      return {};
    }

    const systemPrompt = `Based on the legal category "${state.legalContext.category}" and the current discussion, suggest 2-3 relevant legal citations, cases, or statutes that might be helpful. Format as JSON array of strings with brief descriptions.`;

    try {
      const response = await llm.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(state.currentMessage)
      ]);

      const citations = JSON.parse(response.content as string);
      
      return {
        legalCitations: Array.isArray(citations) ? citations : [],
      };
    } catch (error) {
      console.error('Error finding citations:', error);
      return { legalCitations: [] };
    }
  });

  // Finalize and update conversation
  workflow.addNode('finalize_conversation', async (state) => {
    console.log('Finalizing conversation update');
    
    // Update message history
    const newMessage = state.messageType === 'seeker'
      ? new HumanMessage({ content: state.currentMessage })
      : new AIMessage({ content: state.currentMessage });
    
    const updatedMessages = [...state.messages, newMessage];
    const newMessageCount = state.messageCount + 1;
    
    // Check if we need to summarize
    let updatedSummary = state.conversationSummary;
    if (newMessageCount >= defaultAIConfig.conversation.summaryThreshold) {
      try {
        // const summary = await memory.predictNewSummary(
        const summary = 'Conversation summary updated'; // Placeholder - memory disabled
        // Commented out due to missing memory implementation:
          updatedMessages.map(m => m.content).join('\n'),
          state.conversationSummary || ''
        );
        updatedSummary = summary;
      } catch (error) {
        console.error('Error generating summary:', error);
      }
    }
    
    return {
      messages: updatedMessages,
      messageCount: newMessageCount,
      conversationSummary: updatedSummary,
      stage: 'complete',
    };
  });

  // Define workflow edges
  workflow.addEdge(START, 'analyze_message');
  workflow.addEdge('analyze_message', 'generate_suggestions');
  workflow.addEdge('generate_suggestions', 'check_compliance');
  workflow.addEdge('check_compliance', 'find_citations');
  workflow.addEdge('find_citations', 'finalize_conversation');
  workflow.addEdge('finalize_conversation', END);

  // Conditional edges
  workflow.addConditionalEdges('check_compliance', (state) => {
    if (state.messageType === 'lawyer' && state.legalContext) {
      return 'find_citations';
    }
    return 'finalize_conversation';
  });

  return workflow.compile();
}

// Process conversation message
export async function processConversationMessage(
  conversationId: string,
  seekerId: string,
  lawyerId: string,
  message: string,
  messageType: 'seeker' | 'lawyer',
  conversationHistory: Message[],
  legalContext?: any
): Promise<ConversationState> {
  const graph = createConversationalAgentGraph();
  
  // Convert message history to BaseMessage format
  const messages = conversationHistory.map(msg => {
    if (msg.senderId.toString() === seekerId) {
      return new HumanMessage({ content: msg.content });
    } else {
      return new AIMessage({ content: msg.content });
    }
  });

  const initialState: ConversationState = {
    conversationId,
    seekerId,
    lawyerId,
    currentMessage: message,
    messageType,
    messages,
    messageCount: messages.length,
    suggestions: [],
    legalCitations: [],
    warnings: [],
    stage: 'receiving',
    legalContext,
  };

  try {
    const result = await graph.invoke(initialState);
    return result;
  } catch (error) {
    console.error('Error processing conversation:', error);
    return {
      ...initialState,
      error: 'Failed to process conversation',
      stage: 'complete',
    };
  }
}

// Generate AI suggestions for a message
export async function generateAISuggestions(
  request: AISuggestionRequest,
  conversationHistory: Message[],
  legalContext?: any
): Promise<{
  suggestions: string[];
  legalCitations?: string[];
  warnings?: string[];
}> {
  const state = await processConversationMessage(
    request.conversationId,
    'seeker-id', // These would come from the actual conversation
    'lawyer-id',
    request.context,
    request.role,
    conversationHistory,
    legalContext
  );

  return {
    suggestions: state.suggestions,
    legalCitations: state.legalCitations,
    warnings: state.warnings,
  };
}