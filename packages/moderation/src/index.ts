export interface ModerationResult {
  flagged: boolean;
  confidence: number;
  reasons: string[];
  suggestion: 'allow' | 'review' | 'block';
}

export interface ModerationConfig {
  enableProfanityFilter: boolean;
  enableSpamDetection: boolean;
  customBlockedWords: string[];
}

class TextModerator {
  private config: ModerationConfig;
  private profanityWords: string[] = ['spam', 'scam']; // Basic example list

  constructor(config: ModerationConfig) {
    this.config = config;
  }

  async moderateText(text: string): Promise<ModerationResult> {
    const reasons: string[] = [];
    let flagged = false;
    let confidence = 0;

    if (this.config.enableProfanityFilter) {
      const hasProfanity = this.checkProfanity(text);
      if (hasProfanity) {
        flagged = true;
        confidence += 0.8;
        reasons.push('Contains profanity');
      }
    }

    if (this.config.enableSpamDetection) {
      const isSpam = this.checkSpam(text);
      if (isSpam) {
        flagged = true;
        confidence += 0.6;
        reasons.push('Potential spam content');
      }
    }

    const customWordCheck = this.checkCustomWords(text);
    if (customWordCheck) {
      flagged = true;
      confidence += 0.7;
      reasons.push('Contains blocked words');
    }

    let suggestion: 'allow' | 'review' | 'block' = 'allow';
    if (confidence > 0.8) {
      suggestion = 'block';
    } else if (confidence > 0.5) {
      suggestion = 'review';
    }

    return {
      flagged,
      confidence: Math.min(confidence, 1.0),
      reasons,
      suggestion,
    };
  }

  private checkProfanity(text: string): boolean {
    const lowerText = text.toLowerCase();
    return this.profanityWords.some(word => lowerText.includes(word));
  }

  private checkSpam(text: string): boolean {
    // Simple spam detection: excessive caps, repeated characters
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    const hasRepeatedChars = /(.)\1{4,}/.test(text);
    
    return capsRatio > 0.5 || hasRepeatedChars;
  }

  private checkCustomWords(text: string): boolean {
    const lowerText = text.toLowerCase();
    return this.config.customBlockedWords.some(word => 
      lowerText.includes(word.toLowerCase())
    );
  }
}

export function createModerator(config: ModerationConfig): TextModerator {
  return new TextModerator(config);
}

export const defaultModerationConfig: ModerationConfig = {
  enableProfanityFilter: true,
  enableSpamDetection: true,
  customBlockedWords: [],
};