
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Safely evaluate a JavaScript function string
export function safeEval(code: string, input: any): any {
  try {
    // Create a sandbox function that takes the input
    // eslint-disable-next-line no-new-func
    const sandboxFn = new Function('input', `
      "use strict";
      ${code}
      
      // Find the function name by parsing the code
      const functionMatch = ${JSON.stringify(code)}.match(/function\\s+([\\w_$]+)\\s*\\(/);
      if (!functionMatch) {
        // If no named function found, assume it's an anonymous function
        return (${code})(input);
      }
      
      // Call the named function with the input
      const functionName = functionMatch[1];
      return eval(functionName)(input);
    `);
    
    return sandboxFn(input);
  } catch (error) {
    console.error('Error evaluating code:', error);
    return `Error: ${(error as Error).message}`;
  }
}
