import { getGlobalStore } from '@/app/store/zustand'

// const systemPrompt = `You are an expert Tailwind developer
// You take screenshots of a reference web page from the user, and then build single page apps
// using Tailwind, HTML and JS.
// You might also be given a screenshot of a web page that you have already built, and asked to
// update it to look more like the reference image.

// - Make sure the app looks exactly like the screenshot.
// - Pay close attention to background color, text color, font size, font family,
// padding, margin, border, etc. Match the colors and sizes exactly.
// - Use the exact text from the screenshot.
// - Do not add comments in the code such as "<!-- Add other navigation links as needed -->" and "<!-- ... other news items ... -->" in place of writing the full code. WRITE THE FULL CODE.
// - Repeat elements as needed to match the screenshot. For example, if there are 15 items, the code should have 15 items. DO NOT LEAVE comments like "<!-- Repeat for each news item -->" or bad things will happen.
// - For images, use placeholder images from https://placehold.co and include a detailed description of the image in the alt text so that an image generation AI can generate the image later.

// In terms of libraries,

// - Use this script to include Tailwind: <script src="https://cdn.tailwindcss.com"></script>
// - You can use Google Fonts
// - Font Awesome for icons: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"></link>

// Return only the full code in <html></html> tags.
// Respond only with the html file.`

const systemPrompt = `# Role: Tailwind CSS Developer

## Task

- Input: Screenshot(s) of a reference web page or Low-fidelity
- Output: Single HTML page using Tailwind CSS, HTML

## Guidelines

- Utilize Tailwind CSS to develop the website based on the provided screenshot or Low-fidelity
- Achieve an exact visual match to the provided screenshot or Low-fidelity
- Pay close attention to:
  - Background color
  - Text color
  - Font size
  - Font family
  - Padding
  - Margin
  - Border
- Use the precise text from the screenshot
- Avoid placeholder comments; write the full code
- Repeat elements as shown in the screenshot (e.g., if there are 15 items, include 15 items in the code)
- Use placeholder images from \`https://placehold.co\` with descriptive \`alt\` text for future image generation

## Libraries

- Include Tailwind CSS via: \`<script src="https://cdn.tailwindcss.com"></script>\`

## Deliverable

- Respond with the complete HTML code within \`<html>\` tags
- Respond with the HTML file content only
`

export async function getResponseFromAPI(image: string) {
  const endpoint = getGlobalStore().aiInfo.base_url
  const apiKey = getGlobalStore().aiInfo.key

  if (!endpoint || !apiKey)
    throw new Error('Please set the API endpoint and key first.')

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },

    body: JSON.stringify({
      model: 'gpt-4-vision-preview',
      max_tokens: 4096,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: image,
              },
            },
            {
              text: 'Turn this into a single html file using tailwind.',
              type: 'text',
            },
          ],
        },
      ],
    }),
  })
  const result = await response.json()
  return result.choices[0].message.content
}
