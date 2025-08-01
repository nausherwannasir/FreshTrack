// @ts-nocheck
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

async function sleepTillEndOfMinute(): Promise<void> {
  return new Promise((resolve) => {
    const now = new Date();
    const delay = (60 - now.getSeconds()) * 1000;
    console.log("Seconds waiting EoM: ", { delay });
    setTimeout(resolve, delay);
  });
}

async function sleepRandomly(): Promise<void> {
  return new Promise(resolve => {
    const delay = Math.floor(Math.random() * 10000) + 1000;
    setTimeout(resolve, delay);
  });
}

async function generateWithRetries(prompt: string, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { text } = await generateText({
        model: openai("gpt-4.1-nano"),
        prompt,
      });
      return text;
    } catch (error) {
      console.error(`Error on AI generation attempt ${attempt}`, error);
      if (attempt < retries) {
        console.log("Retrying AI generation...");
        await sleepTillEndOfMinute();
        await sleepRandomly();
      } else {
        console.error("Failed AI generation after multiple attempts. No more retries.");
      }
    }
  }
  return null;
}

export interface RecognizedItem {
  name: string;
  confidence: number;
  category: string;
  estimatedExpiry?: string;
  quantity?: number;
  unit?: string;
}

export interface RecipeMatch {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  matchScore: number;
  availableIngredients: string[];
  missingIngredients: string[];
}

export class AIService {
  async recognizeGroceryItems(imageDescription: string): Promise<RecognizedItem[]> {
    try {
      const prompt = `
        Analyze this grocery item image description and identify the food items present.
        Image description: "${imageDescription}"
        
        Return a JSON array of recognized items with this exact structure:
        [
          {
            "name": "item name",
            "confidence": 0.95,
            "category": "Fruits|Vegetables|Dairy|Meat|Bakery|Pantry|Frozen|Other",
            "estimatedExpiry": "2024-02-15",
            "quantity": 1,
            "unit": "pieces|kg|g|lbs|oz|liters|ml|containers|packages"
          }
        ]
        
        Guidelines:
        - Confidence should be 0.0 to 1.0
        - Estimate expiry dates based on typical shelf life
        - Use common grocery categories
        - Estimate reasonable quantities
        - Return only valid JSON, no additional text
      `;

      const result = await generateWithRetries(prompt);
      if (!result) {
        throw new Error("AI service failed after retries");
      }

      try {
        const items = JSON.parse(result);
        return Array.isArray(items) ? items : [];
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        return [];
      }
    } catch (error) {
      console.error("Error recognizing grocery items:", error);
      return [];
    }
  }

  async generateRecipeSuggestions(availableIngredients: string[]): Promise<RecipeMatch[]> {
    try {
      const prompt = `
        Generate recipe suggestions based on these available ingredients: ${availableIngredients.join(', ')}
        
        Return a JSON array of 3-5 recipes with this exact structure:
        [
          {
            "name": "Recipe Name",
            "description": "Brief description",
            "ingredients": ["ingredient 1", "ingredient 2"],
            "instructions": ["step 1", "step 2"],
            "prepTime": 15,
            "cookTime": 30,
            "servings": 4,
            "difficulty": "Easy",
            "matchScore": 85,
            "availableIngredients": ["available ingredient 1"],
            "missingIngredients": ["missing ingredient 1"]
          }
        ]
        
        Guidelines:
        - Prioritize recipes using the most available ingredients
        - Include common pantry staples (salt, pepper, oil) as assumed available
        - Match score should be 0-100 based on ingredient availability
        - Difficulty: Easy, Medium, or Hard
        - Return only valid JSON, no additional text
      `;

      const result = await generateWithRetries(prompt);
      if (!result) {
        throw new Error("AI service failed after retries");
      }

      try {
        const recipes = JSON.parse(result);
        return Array.isArray(recipes) ? recipes : [];
      } catch (parseError) {
        console.error("Failed to parse AI recipe response:", parseError);
        return [];
      }
    } catch (error) {
      console.error("Error generating recipe suggestions:", error);
      return [];
    }
  }

  async analyzeNutritionalInfo(itemName: string): Promise<any> {
    try {
      const prompt = `
        Provide nutritional information for: ${itemName}
        
        Return JSON with this structure:
        {
          "calories": 100,
          "protein": 5,
          "carbs": 20,
          "fat": 2,
          "fiber": 3,
          "sugar": 15,
          "sodium": 50
        }
        
        Values should be per 100g serving. Return only valid JSON.
      `;

      const result = await generateWithRetries(prompt);
      if (!result) {
        return null;
      }

      try {
        return JSON.parse(result);
      } catch (parseError) {
        console.error("Failed to parse nutrition response:", parseError);
        return null;
      }
    } catch (error) {
      console.error("Error analyzing nutrition:", error);
      return null;
    }
  }

  async generateExpiryNotification(itemName: string, daysUntilExpiry: number): Promise<string> {
    try {
      const prompt = `
        Generate a helpful notification message for a grocery item that's expiring.
        Item: ${itemName}
        Days until expiry: ${daysUntilExpiry}
        
        Create a friendly, actionable message that:
        - Mentions the item and timeframe
        - Suggests what to do (use it, cook it, etc.)
        - Keeps it under 100 characters
        
        Return only the message text, no quotes or additional formatting.
      `;

      const result = await generateWithRetries(prompt);
      return result || `Your ${itemName} expires in ${daysUntilExpiry} days. Consider using it soon!`;
    } catch (error) {
      console.error("Error generating notification:", error);
      return `Your ${itemName} expires in ${daysUntilExpiry} days. Consider using it soon!`;
    }
  }
}

export const aiService = new AIService();
