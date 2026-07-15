import "dotenv/config";
import { fetchProducts } from "./fetch-products.js";
import { mapProductsToFeedItems } from "./map-products.js";
import { buildXml } from "./build-xml.js";

async function main() {
  console.log("Buscando produtos da Nuvemshop...");
  const products = await fetchProducts();
  console.log(`Produtos recebidos: ${products.length}`);

  console.log("[DEBUG] Produtos com variantes mas nenhum preço definido:");
  for (const p of products) {
    const variants = Array.isArray(p.variants) ? p.variants : [];
    if (variants.length === 0) continue;
    const hasAnyPrice = variants.some((v) => v.price !== null && v.price !== undefined && v.price !== "");
    if (!hasAnyPrice) {
      const name = typeof p.name === "object" ? p.name.pt || Object.values(p.name)[0] : p.name;
      console.log(`[DEBUG]  - id=${p.id} published=${p.published} visible=${p.visible} name="${name}"`);
    }
  }

  console.log("Mapeando produtos para o feed...");
  const items = mapProductsToFeedItems(products);
  console.log(`Itens válidos para o feed: ${items.length}`);

  console.log("Gerando XML...");
  const outputFile = await buildXml(items);

  console.log(`Feed gerado com sucesso em: ${outputFile}`);
}

main().catch((error) => {
  console.error("Erro ao gerar feed:", error);
  process.exit(1);
});
