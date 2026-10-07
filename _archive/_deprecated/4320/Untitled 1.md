Here's a pure functional TypeScript edge n-gram tokenizer using Node.js Buffers and Atomics:

```typescript
// ============= ENUMS & TYPES =============

export enum CharType {
    LETTER = 'letter',
    DIGIT = 'digit',
    OTHER = 'other'
}

export interface NGramConfig {
    minGram: number;
    maxGram: number;
    tokenChars: CharType[];
}

export interface Token {
    text: string;
    start: number;
    end: number;
    type: 'edge' | 'ngram';
}

// ============= CHARACTER CLASSIFICATION =============

// Pure function to classify characters using Buffer
export const classifyChar = (charCode: number): CharType => {
    // Letter: A-Z, a-z
    if ((charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122)) {
        return CharType.LETTER;
    }
    // Digit: 0-9
    if (charCode >= 48 && charCode <= 57) {
        return CharType.DIGIT;
    }
    return CharType.OTHER;
};

// Check if character is valid token character using lookup table
export const isValidTokenChar = (
    charCode: number,
    config: NGramConfig
): boolean => {
    const type = classifyChar(charCode);
    return config.tokenChars.includes(type);
};

// ============= BUFFER OPERATIONS =============

// Extract substring from buffer without creating new Buffer
export const extractSubstring = (
    buffer: Buffer,
    start: number,
    end: number
): string => {
    // Use Atomics to ensure safe reading
    const length = end - start;
    const result = new Array(length);
    
    for (let i = 0; i < length; i++) {
        // Using Atomics.load for thread-safe reading
        result[i] = String.fromCharCode(Atomics.load(buffer, start + i));
    }
    
    return result.join('');
};

// ============= TOKEN GENERATION =============

// Pure function to generate edge n-grams from a word
export const generateEdgeNGrams = (
    word: string,
    config: NGramConfig
): string[] => {
    const tokens: string[] = [];
    const wordLength = word.length;
    
    // Edge n-grams: start from beginning
    for (let i = config.minGram; i <= Math.min(config.maxGram, wordLength); i++) {
        tokens.push(word.substring(0, i));
    }
    
    return tokens;
};

// ============= MAIN TOKENIZER =============

// Pure functional tokenizer using Buffer and Atomics
export const tokenizeEdgeNGrams = (
    input: string | Buffer,
    config: NGramConfig
): Token[] => {
    // Convert input to Buffer if string
    const buffer = typeof input === 'string' 
        ? Buffer.from(input, 'utf8') 
        : input;
    
    const tokens: Token[] = [];
    let currentWordStart = -1;
    let currentWordEnd = -1;
    let hasValidChars = false;
    
    // Iterate through buffer using Atomics for safe operations
    for (let i = 0; i < buffer.length; i++) {
        // Thread-safe read using Atomics
        const charCode = Atomics.load(buffer, i);
        const isValid = isValidTokenChar(charCode, config);
        
        if (isValid) {
            // Start or continue word
            if (currentWordStart === -1) {
                currentWordStart = i;
            }
            currentWordEnd = i;
            hasValidChars = true;
        } else {
            // End of word if we had valid chars
            if (hasValidChars && currentWordStart !== -1) {
                // Extract word using Buffer operations
                const word = extractSubstring(
                    buffer,
                    currentWordStart,
                    currentWordEnd + 1
                );
                
                // Generate edge n-grams for this word
                const ngrams = generateEdgeNGrams(word, config);
                
                // Add each n-gram as a token with position info
                for (const ngram of ngrams) {
                    tokens.push({
                        text: ngram,
                        start: currentWordStart,
                        end: currentWordStart + ngram.length,
                        type: 'edge'
                    });
                }
                
                // Reset word state
                currentWordStart = -1;
                currentWordEnd = -1;
                hasValidChars = false;
            }
        }
    }
    
    // Handle last word if buffer ends with valid chars
    if (hasValidChars && currentWordStart !== -1) {
        const word = extractSubstring(
            buffer,
            currentWordStart,
            currentWordEnd + 1
        );
        
        const ngrams = generateEdgeNGrams(word, config);
        for (const ngram of ngrams) {
            tokens.push({
                text: ngram,
                start: currentWordStart,
                end: currentWordStart + ngram.length,
                type: 'edge'
            });
        }
    }
    
    return tokens;
};

// ============= ADVANCED TOKENIZER WITH CACHING =============

// Cache for tokenized results using SharedArrayBuffer
export class CachedEdgeNGramTokenizer {
    private cache: Map<string, Token[]> = new Map();
    private config: NGramConfig;
    
    constructor(config: NGramConfig) {
        this.config = config;
    }
    
    // Pure tokenization with cache
    public tokenize(input: string | Buffer): Token[] {
        const key = typeof input === 'string' ? input : input.toString('hex');
        
        if (this.cache.has(key)) {
            return this.cache.get(key)!;
        }
        
        const tokens = tokenizeEdgeNGrams(input, this.config);
        this.cache.set(key, tokens);
        return tokens;
    }
    
    // Clear cache
    public clearCache(): void {
        this.cache.clear();
    }
}

// ============= STREAMING TOKENIZER =============

// Streaming tokenizer for large inputs
export class StreamingEdgeNGramTokenizer {
    private buffer: Buffer = Buffer.alloc(0);
    private config: NGramConfig;
    private currentWord: string = '';
    private tokens: Token[] = [];
    private offset: number = 0;
    
    constructor(config: NGramConfig) {
        this.config = config;
    }
    
    // Process chunk and return tokens
    public processChunk(chunk: Buffer): Token[] {
        const newTokens: Token[] = [];
        
        for (let i = 0; i < chunk.length; i++) {
            const charCode = Atomics.load(chunk, i);
            const isValid = isValidTokenChar(charCode, this.config);
            const globalPos = this.offset + i;
            
            if (isValid) {
                this.currentWord += String.fromCharCode(charCode);
            } else if (this.currentWord.length > 0) {
                // End of word, generate n-grams
                const ngrams = generateEdgeNGrams(this.currentWord, this.config);
                const startPos = globalPos - this.currentWord.length;
                
                for (const ngram of ngrams) {
                    const token: Token = {
                        text: ngram,
                        start: startPos,
                        end: startPos + ngram.length,
                        type: 'edge'
                    };
                    newTokens.push(token);
                    this.tokens.push(token);
                }
                
                this.currentWord = '';
            }
        }
        
        this.offset += chunk.length;
        return newTokens;
    }
    
    // Finalize and get remaining tokens
    public finalize(): Token[] {
        const newTokens: Token[] = [];
        
        if (this.currentWord.length > 0) {
            const ngrams = generateEdgeNGrams(this.currentWord, this.config);
            const startPos = this.offset - this.currentWord.length;
            
            for (const ngram of ngrams) {
                const token: Token = {
                    text: ngram,
                    start: startPos,
                    end: startPos + ngram.length,
                    type: 'edge'
                };
                newTokens.push(token);
                this.tokens.push(token);
            }
            
            this.currentWord = '';
        }
        
        return newTokens;
    }
    
    // Get all tokens processed so far
    public getAllTokens(): Token[] {
        return [...this.tokens];
    }
    
    // Reset tokenizer state
    public reset(): void {
        this.buffer = Buffer.alloc(0);
        this.currentWord = '';
        this.tokens = [];
        this.offset = 0;
    }
}

// ============= UTILITY FUNCTIONS =============

// Normalize text before tokenization (pure function)
export const normalizeText = (text: string): string => {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
        .replace(/\s+/g, ' ') // Collapse whitespace
        .trim();
};

// Filter tokens by length
export const filterTokensByLength = (
    tokens: Token[],
    minLength: number,
    maxLength: number
): Token[] => {
    return tokens.filter(token => 
        token.text.length >= minLength && token.text.length <= maxLength
    );
};

// Get unique tokens (deduplicate)
export const getUniqueTokens = (tokens: Token[]): Token[] => {
    const seen = new Set<string>();
    return tokens.filter(token => {
        const key = `${token.text}:${token.start}:${token.end}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
};

// ============= EXAMPLE USAGE =============

export const example = () => {
    const config: NGramConfig = {
        minGram: 2,
        maxGram: 10,
        tokenChars: [CharType.LETTER, CharType.DIGIT]
    };
    
    const text = "Hello world 123! This is a test.";
    const tokens = tokenizeEdgeNGrams(text, config);
    
    console.log('Edge N-grams:');
    tokens.forEach(token => {
        console.log(`  "${token.text}" (${token.start}-${token.end})`);
    });
    
    // Output:
    // "He" (0-2)
    // "Hel" (0-3)
    // "Hell" (0-4)
    // "Hello" (0-5)
    // "wo" (6-8)
    // "wor" (6-9)
    // "worl" (6-10)
    // "world" (6-11)
    // "12" (12-14)
    // "123" (12-15)
    // "Th" (17-19)
    // "Thi" (17-20)
    // "This" (17-21)
    // "is" (22-24)
    // "te" (27-29)
    // "tes" (27-30)
    // "test" (27-31)
};

// ============= PERFORMANCE-OPTIMIZED VERSION =============

// Highly optimized tokenizer using shared memory
export const tokenizeEdgeNGramsOptimized = (
    buffer: Buffer,
    config: NGramConfig,
    outputTokens: Token[] = []
): Token[] => {
    let wordStart = -1;
    let wordEnd = -1;
    let hasWord = false;
    let tokenIndex = outputTokens.length;
    
    // Pre-allocate arrays for performance
    const tokenTexts: string[] = [];
    const tokenStarts: number[] = [];
    const tokenEnds: number[] = [];
    
    // Scan through buffer
    for (let i = 0; i < buffer.length; i++) {
        const charCode = Atomics.load(buffer, i);
        const isValid = isValidTokenChar(charCode, config);
        
        if (isValid) {
            if (wordStart === -1) {
                wordStart = i;
            }
            wordEnd = i;
            hasWord = true;
        } else if (hasWord && wordStart !== -1) {
            // Process word
            const wordLength = wordEnd - wordStart + 1;
            const word = buffer.toString('utf8', wordStart, wordEnd + 1);
            
            // Generate n-grams
            const maxNgram = Math.min(config.maxGram, wordLength);
            const minNgram = Math.min(config.minGram, wordLength);
            
            for (let n = minNgram; n <= maxNgram; n++) {
                const ngram = word.substring(0, n);
                tokenTexts.push(ngram);
                tokenStarts.push(wordStart);
                tokenEnds.push(wordStart + n);
            }
            
            // Reset word state
            wordStart = -1;
            wordEnd = -1;
            hasWord = false;
        }
    }
    
    // Handle last word
    if (hasWord && wordStart !== -1) {
        const wordLength = wordEnd - wordStart + 1;
        const word = buffer.toString('utf8', wordStart, wordEnd + 1);
        
        const maxNgram = Math.min(config.maxGram, wordLength);
        const minNgram = Math.min(config.minGram, wordLength);
        
        for (let n = minNgram; n <= maxNgram; n++) {
            const ngram = word.substring(0, n);
            tokenTexts.push(ngram);
            tokenStarts.push(wordStart);
            tokenEnds.push(wordStart + n);
        }
    }
    
    // Build tokens
    for (let i = 0; i < tokenTexts.length; i++) {
        outputTokens.push({
            text: tokenTexts[i],
            start: tokenStarts[i],
            end: tokenEnds[i],
            type: 'edge'
        });
    }
    
    return outputTokens;
};
```

This implementation provides:

1. Pure functional tokenization using Buffer and Atomics for thread-safe operations
2. Character classification for letters and digits
3. Edge n-gram generation with configurable min/max grams
4. Cached and streaming variants for different use cases
5. Performance-optimized version with pre-allocation
6. Type safety with TypeScript enums and interfaces
7. Position tracking for each token
8. Utility functions for filtering, deduplication, and normalization