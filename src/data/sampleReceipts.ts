import type { ReceiptData } from "../types/receipt";

export interface SampleReceiptPreset {
  id: string;
  label: string;
  receipt: ReceiptData;
}

export const SAMPLE_RECEIPTS: SampleReceiptPreset[] = [
  {
    id: "strawberry-cafe",
    label: "Strawberry Cafe Brunch",
    receipt: {
      id: "sample-strawberry-cafe",
      merchantName: "Ribbon & Berry Patisserie",
      date: "2026-11-20",
      currency: "PHP",
      allocationMode: "proportional",
      payerId: "p-kitty",
      tax: 145.0,
      tip: 220.0,
      discount: 0,
      items: [
        {
          id: "item-1",
          name: "Strawberry Ribbon Crepe",
          quantity: 1,
          totalPrice: 320.0,
          assignedTo: ["p-kitty"],
        },
        {
          id: "item-2",
          name: "Iced Matcha Cloud Latte",
          quantity: 1,
          totalPrice: 185.0,
          assignedTo: ["p-cinnamon"],
        },
        {
          id: "item-3",
          name: "Sakura Berry Parfait (Shared)",
          quantity: 1,
          totalPrice: 440.0,
          assignedTo: ["p-kitty", "p-melody", "p-cinnamon", "p-kuromi"],
        },
        {
          id: "item-4",
          name: "Rose Lychee Soda",
          quantity: 1,
          totalPrice: 155.0,
          assignedTo: ["p-melody"],
        },
        {
          id: "item-5",
          name: "Black Sesame Croissant",
          quantity: 1,
          totalPrice: 195.0,
          assignedTo: ["p-kuromi"],
        },
        {
          id: "item-6",
          name: "Honey Toast Box (Shared)",
          quantity: 1,
          totalPrice: 360.0,
          assignedTo: ["p-melody", "p-kuromi"],
        },
      ],
    },
  },
  {
    id: "harajuku-ramen",
    label: "Harajuku Ramen Night",
    receipt: {
      id: "sample-harajuku-ramen",
      merchantName: "Kawaii Ramen & Gyoza House",
      date: "2026-11-19",
      currency: "PHP",
      allocationMode: "proportional",
      payerId: "p-cinnamon",
      tax: 210.0,
      tip: 280.0,
      discount: 150.0,
      items: [
        {
          id: "r-1",
          name: "Tonkotsu Ramen + Ajitama",
          quantity: 1,
          totalPrice: 450.0,
          assignedTo: ["p-kitty"],
        },
        {
          id: "r-2",
          name: "Yuzu Shio Ramen",
          quantity: 1,
          totalPrice: 420.0,
          assignedTo: ["p-cinnamon"],
        },
        {
          id: "r-3",
          name: "Spicy Black Garlic Ramen",
          quantity: 1,
          totalPrice: 465.0,
          assignedTo: ["p-kuromi"],
        },
        {
          id: "r-4",
          name: "Crispy Pork Gyoza (12pc)",
          quantity: 2,
          totalPrice: 390.0,
          assignedTo: ["p-kitty", "p-melody", "p-cinnamon", "p-kuromi"],
        },
        {
          id: "r-5",
          name: "Truffle Edamame",
          quantity: 1,
          totalPrice: 210.0,
          assignedTo: ["p-melody", "p-cinnamon"],
        },
        {
          id: "r-6",
          name: "Melon Cream Soda",
          quantity: 1,
          totalPrice: 160.0,
          assignedTo: ["p-melody"],
        },
      ],
    },
  },
  {
    id: "tokyo-bakery",
    label: "Bento & Bakery Haul",
    receipt: {
      id: "sample-tokyo-bakery",
      merchantName: "Pompom Corner Bakery",
      date: "2026-11-18",
      currency: "PHP",
      allocationMode: "equal",
      payerId: "p-melody",
      tax: 96.0,
      tip: 120.0,
      discount: 0,
      items: [
        {
          id: "b-1",
          name: "Teriyaki Salmon Bento",
          quantity: 1,
          totalPrice: 365.0,
          assignedTo: ["p-kitty"],
        },
        {
          id: "b-2",
          name: "Custard Melonpan (2pc)",
          quantity: 2,
          totalPrice: 220.0,
          assignedTo: ["p-melody", "p-cinnamon"],
        },
        {
          id: "b-3",
          name: "Tamago Sando",
          quantity: 1,
          totalPrice: 245.0,
          assignedTo: ["p-kuromi"],
        },
        {
          id: "b-4",
          name: "Roasted Hojicha Latte",
          quantity: 1,
          totalPrice: 175.0,
          assignedTo: [],
        },
      ],
    },
  },
];
