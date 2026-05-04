
```javascript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

interface PasswordAnalysis {
  password: string;
  length: number;
  entropy: number;
  entropyBits: number;
  complexity: {
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumbers: boolean;
    hasSpecialChars: boolean;
  };
  strength: "very weak" | "weak" | "moderate" | "strong" | "very strong";
}

function calculateEntropy(password: string): {
  entropy: number;
  entropyBits: number;
} {
  // Determine character set size
  let charsetSize = 0;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  if (hasLower) charsetSize += 26;
  if (hasUpper) charsetSize += 26;
  if (hasNumbers) charsetSize += 10;
  if (hasSpecial) charsetSize += 32;

  // Calculate entropy in bits: log2(charset_size^password_length)
  const entropyBits = password.length * Math.log2(charsetSize);
  const entropy = Math.pow(charsetSize, password.length);

  return { entropy, entropyBits };
}

function getPasswordStrength(
  entropyBits: number
): "very weak" | "weak" | "moderate" | "strong" | "very strong" {
  if (entropyBits < 20) return "very weak";
  if (entropyBits < 40) return "weak";
  if (entropyBits < 60) return "moderate";
  if (entropyBits < 80) return "strong";
  return "very strong";
}

function analyzePassword(password: string): PasswordAnalysis {
  const { entropy, entropyBits } = calculateEntropy(password);

  const complexity = {
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumbers: /[0-9]/.test(password),
    hasSpecialChars: /[^a-zA-Z0-9]/.test(password),
  };

  const strength = getPasswordStrength(entropyBits);

  return {
    password,
    length: password.length,
    entropy,
    entropyBits,
    complexity,
    strength,
  };
}

function generatePassword(
  length: number = 16,
  options: {
    useUppercase?: boolean;
    useLowercase?: boolean;
    useNumbers?: boolean;
    useSpecial?: boolean;
  } = {}
): string {
  const {
    useUppercase = true,
    useLowercase = true,
    useNumbers = true,
    useSpecial = true,
  } = options;

  let charset = "";
  if (useLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
  if (useUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (useNumbers) charset += "0123456789";
  if (useSpecial)
    charset += "!@#$%^&*()_+-=[]{}|;:,.<>?~`";

  if (!charset) charset = "abcdefghijklmnopqrstuvwxyz";

  let password = "";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }

  return password;
}

function formatAnalysis(analysis: PasswordAnalysis): string {
  return `
Password Analysis:
─────────────────
Password: ${analysis.password}
Length: ${analysis.length} characters
Entropy: 2^${analysis.entropyBits.toFixed(2)} possible combinations
Complexity:
  • Uppercase letters: ${analysis.complexity.hasUppercase ? "Yes" : "No"}
  • Lowercase letters: ${analysis.complexity.hasLowercase ? "Yes" : "No"}
  • Numbers: ${analysis.complexity.hasNumbers ? "Yes" : "No"}
  • Special characters: ${analysis.complexity.hasSpecialChars ? "Yes" : "No"}
Strength: ${analysis.strength.toUpperCase()}
  `;
}

async function main() {
  console.log("🔐 Secure Password Generator with Entropy Meter");
  console.log("=".repeat(50));
  console.log(
    "\nThis tool generates secure passwords and analyzes entropy."
  );
  console.log(
    "It uses Claude AI to provide insights about password security.\n"
  );

  const conversationHistory: ConversationMessage[] = [];

  // First, demonstrate the password generator
  console.log("1️⃣ Generating a 16-character secure password...\n");
  const generatedPassword = generatePassword(16);
  const analysis = analyzePassword(generatedPassword);
  console.log(formatAnalysis(analysis));

  // Now demonstrate multi-turn conversation with Claude
  console.log("2️⃣ Using Claude to provide security recommendations...\n");

  // First turn
  const userMessage1 = `I just generated this password: ${generatedPassword}

Analysis shows:
- Entropy bits: ${analysis.entropyBits.toFixed(2)}
- Strength: ${analysis.strength}
- Character types: ${Object.entries(analysis.complexity)
    .filter(([_, value]) => value)
    .map(([key]) => key.replace("has", "").toLowerCase())
    .join(", "