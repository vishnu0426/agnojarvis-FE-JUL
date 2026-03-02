/**
 * parseAgentOptions.ts - COMPLETE FIXED VERSION
 * 
 * Save this file as: src/lib/parseAgentOptions.ts (or wherever your current file is)
 * 
 * CRITICAL: Make sure you:
 * 1. COMPLETELY REPLACE your existing parseAgentOptions.ts with this file
 * 2. Restart your dev server after replacing
 * 3. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
 */

export interface ParsedOption {
  text: string;        // Full display text for the button
  value: string;       // Value to send back to agent - ALWAYS JUST THE NUMBER
}

/**
 * Parse agent response text to extract interactive options
 * Handles the telecom agent's numbered list format
 */
export function parseAgentOptions(text: string): ParsedOption[] | undefined {
  const options: ParsedOption[] = [];

  // Split text into lines for processing
  const lines = text.split('\n');

  // Find numbered items with their details
  let currentOption: {
    number: string;
    name: string;
    price: string;
    benefits: string;
    validity: string;
  } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check for numbered package (1., 2., 3., etc.)
    const numberedMatch = line.match(/^(\d+)\.\s*(.+?)$/);

    if (numberedMatch) {
      // Save previous option if exists
      if (currentOption) {
        options.push(formatOption(currentOption));
      }

      // Start new option
      currentOption = {
        number: numberedMatch[1],  // "1", "2", "3", etc.
        name: numberedMatch[2].trim(),
        price: '',
        benefits: '',
        validity: ''
      };
    } else if (currentOption) {
      // Look for bullet point details
      if (line.match(/^[*\-•]\s*Price:/i)) {
        currentOption.price = line.replace(/^[*\-•]\s*Price:\s*/i, '').trim();
      } else if (line.match(/^[*\-•]\s*Benefits:/i)) {
        currentOption.benefits = line.replace(/^[*\-•]\s*Benefits:\s*/i, '').trim();
      } else if (line.match(/^[*\-•]\s*Validity:/i)) {
        currentOption.validity = line.replace(/^[*\-•]\s*Validity:\s*/i, '').trim();
      }
    }
  }

  // Don't forget the last option
  if (currentOption) {
    options.push(formatOption(currentOption));
  }

  // Fallback: Try simple comma-separated list
  if (options.length === 0) {
    const simpleListMatch = text.match(/(?:packages?|options?):\s*(.+?)(?:\.|$)/i);
    if (simpleListMatch) {
      const items = simpleListMatch[1]
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);

      if (items.length >= 2) {
        return items.map((item, index) => ({
          text: item,
          value: String(index + 1)
        }));
      }
    }
  }

  // Only return options if we found at least 2 (indicating a list)
  return options.length >= 2 ? options : undefined;
}

/**
 * Format a parsed option into a user-friendly button text
 * 
 * CRITICAL BEHAVIOR:
 * - text: Full descriptive text for display (e.g., "Umrah Package - 2,430 Birr (500 MB data)")
 * - value: ONLY THE NUMBER (e.g., "1", "2", "3")
 * 
 * The agent must accept the number and map it internally to the offer_id
 */
function formatOption(option: {
  number: string;
  name: string;
  price: string;
  benefits: string;
  validity: string;
}): ParsedOption {
  let displayText = option.name;

  // Add price if available
  if (option.price) {
    displayText += ` - ${option.price}`;
  }

  // Add benefits if available
  if (option.benefits) {
    displayText += ` (${option.benefits})`;
  }

  // Add validity if meaningful
  if (option.validity && option.validity !== 'No specific validity') {
    displayText += ` - Valid: ${option.validity}`;
  }

  // ⚠️ CRITICAL: Always return just the number as the value
  const result = {
    text: displayText,
    value: option.number  // "1", "2", "3", etc. - NOT the full text!
  };

  // Debug logging (remove in production if desired)
  console.log(`[parseAgentOptions] Formatted option ${option.number}:`, {
    displayText: result.text.substring(0, 50) + '...',
    value: result.value,
    valueType: typeof result.value
  });

  return result;
}

/**
 * Alternative helper: Extract just the option numbers
 */
export function extractOptionNumbers(text: string): string[] | undefined {
  const numbers: string[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const match = line.match(/^(\d+)\.\s*/);
    if (match) {
      numbers.push(match[1]);
    }
  }

  return numbers.length >= 2 ? numbers : undefined;
}