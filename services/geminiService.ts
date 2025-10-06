import { GoogleGenAI } from "@google/genai";
import type { UploadedImage } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}
  
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = "gemini-2.5-flash";

const cleanHtmlResponse = (text: string): string => {
    const cleaned = text.trim();
    if (cleaned.startsWith('```html')) {
        return cleaned.substring(7, cleaned.length - 3).trim();
    }
    if(cleaned.startsWith('<!DOCTYPE html>')) {
        return cleaned;
    }
    // Fallback for cases where the model might forget the doctype
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <title>Generated Website</title>
</head>
<body>${cleaned}</body>
</html>`;
}

export const generateWebsite = async (prompt: string, image: UploadedImage | null): Promise<string> => {
    const systemInstruction = `You are an expert front-end developer and UI/UX designer specializing in creating beautiful, modern websites with Tailwind CSS.
Your task is to create a complete, single-file HTML website based on the user's request.
The HTML file must be fully self-contained.

**CRITICAL INSTRUCTIONS:**
1.  **Tailwind CSS:** You MUST use Tailwind CSS for all styling. Include the CDN script: <script src="https://cdn.tailwindcss.com"></script> in the <head>.
2.  **Modern Design:** Employ modern design principles. This includes clean layouts, balanced typography, sufficient whitespace, and a harmonious color palette. If the user doesn't specify colors, choose a professional and aesthetically pleasing palette.
3.  **Responsiveness:** The website must be fully responsive and look great on all screen sizes, from mobile phones to desktops. Use Tailwind's responsive prefixes (sm:, md:, lg:, xl:) extensively.
4.  **Content:** If the user's prompt is generic, create rich, plausible content. For example, if they ask for a portfolio, invent some projects. Use high-quality, royalty-free placeholder images from a service like \`https://picsum.photos/\` if no image is provided by the user. Make the placeholders relevant, e.g., \`https://picsum.photos/seed/tech/600/400\` for a tech company.
5.  **Interactivity:** Add subtle hover effects and transitions to interactive elements like buttons and links to make the site feel more dynamic.
6.  **Accessibility:** Ensure the website is accessible. Use semantic HTML5 tags (header, nav, main, section, footer), provide meaningful \`alt\` attributes for all images, and ensure good color contrast.
7.  **No External Files:** Do not use any external CSS files or inline style attributes (\`style="..."\`).
8.  **Fonts:** Consider using a modern, clean font from Google Fonts to enhance the typography.
9.  **Output Format:** Your response must be ONLY the raw HTML code, starting with <!DOCTYPE html>. Do not include any explanations, markdown formatting, or any text other than the HTML code itself.`;

    const fullPrompt = `The user has provided the following description: "${prompt}"
${image ? "The user has also provided an image. You MUST incorporate this image into the website. Use the provided inline data URI for the image source." : ""}`;

    const parts: ({ text: string } | { inlineData: { mimeType: string, data: string } })[] = [{ text: fullPrompt }];

    if (image) {
        parts.push({
            inlineData: {
                mimeType: image.type,
                data: image.base64
            }
        });
    }

    try {
        const response = await ai.models.generateContent({
            model,
            contents: [{ parts: parts }],
            config: {
                systemInstruction,
            },
        });

        const text = response.text;
        if (!text) {
            throw new Error("API returned an empty response.");
        }
        return cleanHtmlResponse(text);
    } catch (error) {
        console.error("Error generating website:", error);
        throw new Error("Failed to generate website from AI. Please check your API key and try again.");
    }
};

export const refineWebsite = async (currentHtml: string, prompt: string, image: UploadedImage | null): Promise<string> => {
    const systemInstruction = `You are an expert front-end developer and UI/UX designer specializing in Tailwind CSS.
Your task is to modify an existing HTML website based on the user's instructions, maintaining high design standards.
You must return the complete, full, updated HTML code for the entire website.

**CRITICAL INSTRUCTIONS:**
1.  **Analyze and Modify:** Carefully analyze the provided HTML and apply the user's changes. The goal is to seamlessly integrate the refinements while improving the overall design if possible.
2.  **Maintain Quality:** Ensure all changes adhere to modern design principles, responsiveness, and accessibility standards as described in the original creation guidelines.
3.  **Self-Contained:** The final HTML file must remain self-contained and use the Tailwind CSS CDN.
4.  **Output Format:** Your response must be ONLY the raw HTML code, starting with <!DOCTYPE html>. Do not include any explanations, markdown formatting, or any text other than the HTML code itself.`;

    const fullPrompt = `Here is the current HTML code of the website:
---
${currentHtml}
---

The user wants you to make the following changes: "${prompt}"

${image ? "The user has also provided a new image. You should use it as instructed, or replace an existing image if it makes sense. Use the provided inline data URI for the image source." : ""}`;
    
    const parts: ({ text: string } | { inlineData: { mimeType: string, data: string } })[] = [{ text: fullPrompt }];
    
    if (image) {
        parts.push({
            inlineData: {
                mimeType: image.type,
                data: image.base64
            }
        });
    }

    try {
        const response = await ai.models.generateContent({
            model,
            contents: [{ parts: parts }],
            config: {
                systemInstruction,
            },
        });
        
        const text = response.text;
        if (!text) {
            throw new Error("API returned an empty response for refinement.");
        }
        return cleanHtmlResponse(text);
    } catch (error) {
        console.error("Error refining website:", error);
        throw new Error("Failed to refine website from AI. Please check your prompt and try again.");
    }
};