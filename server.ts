import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in the server environment.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const receiptResponseSchema = {
  type: Type.OBJECT,
  properties: {
    merchantName: {
      type: Type.STRING,
      description: "The store, restaurant, or cafe name on the receipt.",
    },
    date: {
      type: Type.STRING,
      description: "Receipt date in YYYY-MM-DD format if visible, otherwise today's date or empty string.",
    },
    currency: {
      type: Type.STRING,
      description: "3-letter currency code such as PHP, MXN, USD, JPY, EUR, GBP. Default to PHP if ambiguous.",
    },
    items: {
      type: Type.ARRAY,
      description: "Individual purchased line items. Exclude subtotal, tax, tip, or total summary rows.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "Clean human-readable item name.",
          },
          quantity: {
            type: Type.INTEGER,
            description: "Quantity purchased (minimum 1).",
          },
          totalPrice: {
            type: Type.NUMBER,
            description: "Total line price for this item (quantity * unit price).",
          },
        },
        required: ["name", "quantity", "totalPrice"],
      },
    },
    tax: {
      type: Type.NUMBER,
      description: "Total tax amount on the receipt, or 0 if none.",
    },
    tip: {
      type: Type.NUMBER,
      description: "Tip or service charge amount on the receipt, or 0 if none.",
    },
    discount: {
      type: Type.NUMBER,
      description: "Total discount or coupon savings as a positive number, or 0 if none.",
    },
  },
  required: ["merchantName", "currency", "items", "tax", "tip", "discount"],
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "15mb" }));

  app.post("/api/scan-receipt", async (req, res) => {
    try {
      const { imageBase64, mimeType } = req.body as {
        imageBase64?: string;
        mimeType?: string;
      };

      if (!imageBase64 || typeof imageBase64 !== "string") {
        res.status(400).json({ error: "Please provide a valid receipt image." });
        return;
      }

      const safeMime =
        typeof mimeType === "string" && mimeType.startsWith("image/")
          ? mimeType
          : "image/jpeg";

      const cleanBase64 = imageBase64.includes(",")
        ? imageBase64.split(",")[1]
        : imageBase64;

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: safeMime,
                data: cleanBase64,
              },
            },
            {
              text: "Extract every purchased line item, quantity, line total price, merchant name, date, currency code, tax, tip/service charge, and discount from this receipt image. Exclude subtotal/total summary lines from the items array.",
            },
          ],
        },
        config: {
          systemInstruction:
            "You are an accurate receipt parser. Return clean item names without noisy SKU codes when possible, positive prices for items, and 0 for missing tax, tip, or discount.",
          responseMimeType: "application/json",
          responseSchema: receiptResponseSchema,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const rawText = (response.text ?? "{}").trim();
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to scan receipt image.";
      console.error("Receipt scan error:", error);
      res.status(500).json({ error: message });
    }
  });

  app.post("/api/parse-receipt-text", async (req, res) => {
    try {
      const { receiptText } = req.body as { receiptText?: string };

      if (!receiptText || typeof receiptText !== "string" || !receiptText.trim()) {
        res.status(400).json({ error: "Please paste some receipt text to parse." });
        return;
      }

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: `Parse the following receipt or order text into structured items, tax, tip, discount, merchant name, date, and currency:\n\n${receiptText.trim()}`,
        config: {
          systemInstruction:
            "You are an accurate receipt text parser. Extract individual line items and exclude subtotal/total summary rows from items.",
          responseMimeType: "application/json",
          responseSchema: receiptResponseSchema,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const rawText = (response.text ?? "{}").trim();
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to parse receipt text.";
      console.error("Receipt text parse error:", error);
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`KittySplit server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
