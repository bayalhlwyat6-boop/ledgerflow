import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not configured");
}

const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    apiVersion: "v1",
  },
});

const invoiceSchema = {
  type: "object",
  properties: {
    supplier_name: {
      type: "string",
    },
    invoice_number: {
      type: "string",
    },
    invoice_date: {
      type: "string",
    },
    currency: {
      type: "string",
    },
    subtotal: {
      type: ["number", "null"],
    },
    tax: {
      type: ["number", "null"],
    },
    total: {
      type: ["number", "null"],
    },
    confidence: {
      type: "number",
    },
  },
  required: [
    "supplier_name",
    "invoice_number",
    "invoice_date",
    "currency",
    "subtotal",
    "tax",
    "total",
    "confidence",
  ],
};

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

    const mimeType =
      file.type || "application/octet-stream";

    const interaction = await ai.interactions.create({
      model: "gemini-3.6-flash",
      store: false,

      input: [
        {
          type: "text",
          text: `
Analyze this invoice carefully.

Extract the accounting information from the invoice.

Rules:
- Do not invent missing values.
- Use an empty string when text information is unavailable.
- Use null when a numeric value is unavailable.
- confidence must be between 0 and 1.
- Return only the requested JSON structure.
          `,
        },
        {
          type: "image",
          mime_type: mimeType,
          data: base64,
        },
      ],

      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: invoiceSchema,
      },
    });

    const text =
      interaction.output_text?.trim();

    if (!text) {
      throw new Error(
        "Gemini returned an empty response"
      );
    }

    const data = JSON.parse(text);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "GEMINI ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invoice analysis failed",
      },
      { status: 500 }
    );
  }
}