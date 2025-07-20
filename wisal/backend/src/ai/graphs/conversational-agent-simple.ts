import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { Conversation, Message, AISuggestionRequest } from '../../types';
import { defaultAIConfig } from '../config';

// Simple conversational agent without LangGraph
export class ConversationalAgent {
  private llm: ChatOpenAI;

  constructor() {
    this.llm = new ChatOpenAI({
      openAIApiKey: defaultAIConfig.openai.apiKey,
      modelName: defaultAIConfig.openai.model,
      temperature: 0.5,
    });
  }

  async processMessage(
    conversationId: string,
    seekerId: string,
    lawyerId: string,
    currentMessage: string,
    messageType: 'seeker' | 'lawyer',
    messages: BaseMessage[] = [],
    legalContext?: any
  ): Promise<{
    suggestions: string[];
    legalCitations: string[];
    warnings: string[];
    conversationSummary?: string;
  }> {
    const result = {
      suggestions: [] as string[],
      legalCitations: [] as string[],
      warnings: [] as string[],
      conversationSummary: undefined as string | undefined,
    };

    try {
      // Analyze message
      const analysis = await this.analyzeMessage(currentMessage);
      if (analysis.warnings.length > 0) {
        result.warnings = analysis.warnings;
      }

      // Generate suggestions
      result.suggestions = await this.generateSuggestions(
        currentMessage,
        messageType,
        messages,
        legalContext
      );

      // Check compliance for lawyer messages
      if (messageType === 'lawyer') {
        result.suggestions = await this.checkCompliance(result.suggestions);
        
        // Find legal citations if needed
        if (legalContext) {
          result.legalCitations = await this.findCitations(
            currentMessage,
            legalContext
          );
        }
      }

      // Update conversation summary if needed
      if (messages.length >= defaultAIConfig.conversation.summaryThreshold) {
        result.conversationSummary = await this.updateSummary(messages);
      }

      return result;
    } catch (error) {
      console.error('Error processing conversation message:', error);
      return result;
    }
  }

  private async analyzeMessage(message: string): Promise<{
    warnings: string[];
  }> {
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
      const response = await this.llm.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(message)
      ]);

      const analysis = JSON.parse(response.content as string);
      
      const warnings = analysis.potentialRisks.length > 0 
        ? [`Legal Notice: ${analysis.potentialRisks.join(', ')}`]
        : [];
      
      return { warnings };
    } catch (error) {
      console.error('Error analyzing message:', error);
      return { warnings: [] };
    }
  }

  private async generateSuggestions(
    currentMessage: string,
    messageType: 'seeker' | 'lawyer',
    messages: BaseMessage[],
    legalContext?: any
  ): Promise<string[]> {
    const role = messageType === 'seeker' ? 'lawyer' : 'seeker';
    const systemPrompt = role === 'lawyer' 
      ? `You are assisting a lawyer in responding to a legal query. Generate 3 professional, helpful response suggestions that:
1. Address the key points raised
2. Provide clear legal guidance (with appropriate disclaimers)
3. Ask clarifying questions if needed
4. Maintain professional tone
5. Include relevant legal considerations

Context: ${legalContext ? JSON.stringify(legalContext) : 'General legal consultation'}`
      : `You are assisting someone seeking legal advice. Generate 3 response suggestions that:
1. Clearly express their concerns or questions
2. Provide relevant details
3. Ask appropriate follow-up questions
4. Maintain respectful tone`;

    try {
      const recentMessages = messages.slice(-5).map(msg => 
        msg._getType() === 'human' 
          ? new HumanMessage(String(msg.content))
          : new AIMessage(String(msg.content))
      );

      const response = await this.llm.invoke([
        new SystemMessage(systemPrompt),
        ...recentMessages,
        new HumanMessage(`Current message: ${currentMessage}\n\nGenerate 3 response suggestions as a JSON array of strings.`)
      ]);

      const suggestions = JSON.parse(response.content as string);
      return Array.isArray(suggestions) ? suggestions : [suggestions];
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return [
        'I understand your concern. Could you provide more details?',
        'Thank you for your message. Let me address your points.',
        'I appreciate you reaching out. Here\'s what I can help with.',
      ];
    }
  }

  private async checkCompliance(suggestions: string[]): Promise<string[]> {
    const systemPrompt = `Review these lawyer response suggestions for legal compliance:
1. Check for unauthorized practice of law issues
2. Ensure appropriate disclaimers are included
3. Verify no guarantees of outcomes
4. Confirm ethical boundaries are maintained

Suggestions to review:
${suggestions.join('\n\n')}

Return JSON with:
{
  "compliant": boolean,
  "issues": ["string"],
  "requiredDisclaimer": "string" // if needed
}`;

    try {
      const response = await this.llm.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage('Review compliance')
      ]);

      const compliance = JSON.parse(response.content as string);
      
      if (!compliance.compliant && compliance.requiredDisclaimer) {
        return suggestions.map(s => 
          `${s}\n\n${compliance.requiredDisclaimer}`
        );
      }
      
      return suggestions;
    } catch (error) {
      console.error('Error checking compliance:', error);
      return suggestions;
    }
  }

  private async findCitations(
    message: string,
    legalContext: any
  ): Promise<string[]> {
    const systemPrompt = `Based on the legal category "${legalContext.category}" and the current discussion, suggest 2-3 relevant legal citations, cases, or statutes that might be helpful. Format as JSON array of strings with brief descriptions.`;

    try {
      const response = await this.llm.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(message)
      ]);

      const citations = JSON.parse(response.content as string);
      return Array.isArray(citations) ? citations : [];
    } catch (error) {
      console.error('Error finding citations:', error);
      return [];
    }
  }

  private async updateSummary(messages: BaseMessage[]): Promise<string> {
    const systemPrompt = `Summarize this legal consultation conversation concisely, highlighting:
1. Main legal issue(s) discussed
2. Key points raised by both parties
3. Current status of the discussion
4. Any pending questions or next steps

Keep it under 200 words.`;

    try {
      const conversationText = messages
        .map(m => `${m._getType() === 'human' ? 'Seeker' : 'Lawyer'}: ${m.content}`)
        .join('\n');

      const response = await this.llm.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(conversationText)
      ]);

      return response.content as string;
    } catch (error) {
      console.error('Error updating summary:', error);
      return 'Conversation summary unavailable';
    }
  }
}

// Export functions for compatibility
export async function processConversationMessage(
  conversationId: string,
  seekerId: string,
  lawyerId: string,
  currentMessage: string,
  messageType: 'seeker' | 'lawyer',
  messages: BaseMessage[] = [],
  legalContext?: any
): Promise<any> {
  const agent = new ConversationalAgent();
  return agent.processMessage(
    conversationId,
    seekerId,
    lawyerId,
    currentMessage,
    messageType,
    messages,
    legalContext
  );
}

export async function generateAISuggestions(
  request: AISuggestionRequest
): Promise<{
  suggestions: string[];
  legalCitations?: string[];
  warnings?: string[];
}> {
  const agent = new ConversationalAgent();
  const result = await agent.processMessage(
    request.conversationId,
    '', // seekerId not provided in request
    '', // lawyerId not provided in request
    request.context,
    request.role,
    [], // No message history provided
    undefined
  );
  
  return {
    suggestions: result.suggestions,
    legalCitations: result.legalCitations,
    warnings: result.warnings,
  };
}