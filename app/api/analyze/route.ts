import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
    });

    let result;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        result = await model.generateContent([
          {
            inlineData: {
              mimeType: file.type,
              data: base64,
            },
          },
          {
            text: `
Analyze this invoice.

Return ONLY valid JSON with this exact structure:

{
  "supplier_name": "",
  "invoice_number": "",
  "invoice_date": "",
  "currency": "",
  "subtotal": null,
  "tax": null,
  "total": null,
  "confidence": 0
}

The confidence must be a number between 0 and 1.

Do not add markdown.
Do not add explanations.
            `,
          },
        ]);

        break;
      } catch (error) {
        console.error(`Gemini attempt ${attempt} failed:`, error);

        if (attempt === 3) {
          throw error;
        }

        await new Promise((resolve) =>
          setTimeout(resolve, attempt * 3000)
        );
      }
    }

    if (!result) {
      throw new Error("Gemini did not return a result");
    }

    const text = result.response.text();

    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const data = JSON.parse(cleaned);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GEMINI ERROR:", error);

    return NextResponse.json(
      {
        error: "Invoice analysis failed",
      },
      { status: 500 }
    );
  }
}