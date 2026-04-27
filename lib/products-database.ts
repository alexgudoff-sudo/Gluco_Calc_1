/**
 * Database of popular products with barcode (EAN/UPC) and carbohydrate content.
 * Carbohydrates are per 100g of product.
 * 
 * Real barcode data should be sourced from:
 * - OpenFoodFacts API (https://world.openfoodfacts.org/api)
 * - USDA FoodData Central
 * - Local databases
 * 
 * For now, this is a curated list of common products.
 */

export interface Product {
  barcode: string;
  name: string;
  carbsPer100g: number;
  brand?: string;
  category?: string;
}

// Common products used in hypoglycemia treatment
const PRODUCTS_DATABASE: Product[] = [
  // Glucose tablets and solutions
  {
    barcode: "5000156001311",
    name: "Glucose Tablets",
    carbsPer100g: 100,
    brand: "Generic",
    category: "Medical",
  },
  {
    barcode: "5010182005131",
    name: "Dextrose Tablets",
    carbsPer100g: 100,
    brand: "Generic",
    category: "Medical",
  },

  // Juices
  {
    barcode: "5449000050127",
    name: "Orange Juice",
    carbsPer100g: 11,
    brand: "Generic",
    category: "Juice",
  },
  {
    barcode: "5449000050134",
    name: "Apple Juice",
    carbsPer100g: 11.4,
    brand: "Generic",
    category: "Juice",
  },
  {
    barcode: "5449000050141",
    name: "Grape Juice",
    carbsPer100g: 15.9,
    brand: "Generic",
    category: "Juice",
  },

  // Soft drinks
  {
    barcode: "5000112109701",
    name: "Coca-Cola",
    carbsPer100g: 10.6,
    brand: "Coca-Cola",
    category: "Soft Drink",
  },
  {
    barcode: "5000112109718",
    name: "Sprite",
    carbsPer100g: 10.6,
    brand: "Sprite",
    category: "Soft Drink",
  },
  {
    barcode: "5000112109725",
    name: "Fanta Orange",
    carbsPer100g: 11.6,
    brand: "Fanta",
    category: "Soft Drink",
  },

  // Sweets and candies
  {
    barcode: "5000159406000",
    name: "Mars Bar",
    carbsPer100g: 66.5,
    brand: "Mars",
    category: "Candy",
  },
  {
    barcode: "5000159406017",
    name: "Snickers",
    carbsPer100g: 52.3,
    brand: "Mars",
    category: "Candy",
  },
  {
    barcode: "5000159406024",
    name: "Milky Way",
    carbsPer100g: 64.5,
    brand: "Mars",
    category: "Candy",
  },

  // Bread and cereals
  {
    barcode: "5010182005148",
    name: "White Bread",
    carbsPer100g: 49,
    brand: "Generic",
    category: "Bread",
  },
  {
    barcode: "5010182005155",
    name: "Whole Wheat Bread",
    carbsPer100g: 41,
    brand: "Generic",
    category: "Bread",
  },

  // Milk and dairy
  {
    barcode: "5000112109732",
    name: "Whole Milk",
    carbsPer100g: 4.8,
    brand: "Generic",
    category: "Dairy",
  },
  {
    barcode: "5000112109739",
    name: "Yogurt",
    carbsPer100g: 3.6,
    brand: "Generic",
    category: "Dairy",
  },

  // Fruits
  {
    barcode: "5010182005162",
    name: "Banana",
    carbsPer100g: 22.8,
    brand: "Generic",
    category: "Fruit",
  },
  {
    barcode: "5010182005169",
    name: "Apple",
    carbsPer100g: 13.8,
    brand: "Generic",
    category: "Fruit",
  },
  {
    barcode: "5010182005176",
    name: "Orange",
    carbsPer100g: 11.8,
    brand: "Generic",
    category: "Fruit",
  },

  // Honey and syrups
  {
    barcode: "5010182005183",
    name: "Honey",
    carbsPer100g: 82,
    brand: "Generic",
    category: "Sweetener",
  },
  {
    barcode: "5010182005190",
    name: "Maple Syrup",
    carbsPer100g: 67,
    brand: "Generic",
    category: "Sweetener",
  },
];

/**
 * Search for a product by barcode.
 * Returns the product if found, null otherwise.
 */
export function findProductByBarcode(barcode: string): Product | null {
  const normalized = barcode.trim().toUpperCase();
  return PRODUCTS_DATABASE.find((p) => p.barcode === normalized) || null;
}

/**
 * Search for products by name (partial match).
 * Returns array of matching products.
 */
export function searchProductsByName(query: string): Product[] {
  const normalized = query.trim().toLowerCase();
  return PRODUCTS_DATABASE.filter((p) =>
    p.name.toLowerCase().includes(normalized)
  );
}

/**
 * Get all products in a specific category.
 */
export function getProductsByCategory(category: string): Product[] {
  return PRODUCTS_DATABASE.filter((p) => p.category === category);
}

/**
 * Get all unique categories.
 */
export function getAllCategories(): string[] {
  const categories = new Set(PRODUCTS_DATABASE.map((p) => p.category).filter(Boolean));
  return Array.from(categories).sort();
}

/**
 * Add a custom product to the database (for user-added products).
 * Note: In production, this would persist to AsyncStorage or a backend.
 */
export function addCustomProduct(product: Product): void {
  // Check if product with same barcode already exists
  const exists = PRODUCTS_DATABASE.some((p) => p.barcode === product.barcode);
  if (!exists) {
    PRODUCTS_DATABASE.push(product);
  }
}
