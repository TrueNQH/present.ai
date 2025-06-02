import { LangChainAdapter } from "ai";
import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import axios from "axios";

import { Readable } from "stream";
interface OutlineRequest {
  prompt: string;
  numberOfCards: number;
  language: string;
}
interface ApiResponse {
  data: {
    choices: { text: string }[];
  };
}
const outlineTemplate = `
Generate a structured presentation outline based on the following details:

- **Topic**: {prompt}
- **Number of Main Topics**: {numberOfCards}
- **Language**: {language}

### Requirements:
1. Create exactly {numberOfCards} main topics.
2. Each topic must include 2-3 bullet points.
3. Use clear and concise language.
4. Ensure the outline flows logically and is engaging for the audience.

### Example Format:
# Main Topic 1
- Key point 1
- Key point 2
- Key point 3

# Main Topic 2
- Key point 1
- Key point 2
- Key point 3

Now generate the outline.
`;



export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, numberOfCards, language } =
      (await req.json()) as OutlineRequest;

    if (!prompt || !numberOfCards || !language) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Thay thế các placeholder trong template
    const formattedPrompt = outlineTemplate
      .replace("{prompt}", prompt)
      .replace("{numberOfCards}", numberOfCards.toString())
      .replace("{language}", language);

    // Gửi request đến API bên thứ 3
    const response = await axios.post<ApiResponse>(
  "https://aiscanner.tech/api/server/chat",
  { model: "gpt-4o-mini", prompt: formattedPrompt },
  {
    timeout: 60000,
    family: 4,
    headers: { Authorization: "Bearer ff22ee3e-908c-4237-a14b-b9ba56b6769c" },
  }
);

console.log(response.data.data.choices[0]?.text ?? "No text available");

const stream = Readable.from([response.data.data.choices[0]?.text ?? ""]);
        const readableStream = new ReadableStream({
          start(controller) {
            stream.on("data", (chunk) => controller.enqueue(chunk));
            stream.on("end", () => controller.close());
            stream.on("error", (err) => controller.error(err));
          },
        });
        return LangChainAdapter.toDataStreamResponse(readableStream);
  } catch (error) {
    console.error("Error in outline generation:", error);
    return NextResponse.json(
      { error: "Failed to generate outline" },
      { status: 500 },
    );
  }
}