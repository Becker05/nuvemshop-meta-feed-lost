import "dotenv/config";
import { fetchProducts } from "./fetch-products.js";
import { mapProductsToFeedItems } from "./map-products.js";
import { buildXml } from "./build-xml.js";

async function main() {
  console.log("Buscando produtos da Nuvemshop...");
  const products = await fetchProducts();
  console.log(`Produtos recebidos: ${products.length}`);

  const debugProduct = products.find((p) => String(p.id) === "354422866");
  if (debugProduct) {
    console.log("DEBUG_PRODUCT_JSON_START");
    console.log(JSON.stringify(debugProduct, null, 2));
    console.log("DEBUG_PRODUCT_JSON_END");
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
