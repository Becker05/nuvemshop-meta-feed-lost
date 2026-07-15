import "dotenv/config";
import { fetchProducts } from "./fetch-products.js";
import { mapProductsToFeedItems } from "./map-products.js";
import { buildXml } from "./build-xml.js";

async function main() {
  console.log("Buscando produtos da Nuvemshop...");
  const products = await fetchProducts();
  console.log(`Produtos recebidos: ${products.length}`);

  const visibleProducts = products.filter(
    (p) => p.published !== false && p.visible !== false && p.active !== false
  );
  console.log(`[DEBUG] Produtos visíveis (published/visible/active !== false): ${visibleProducts.length}`);

  let totalVariants = 0;
  let variantsWithStockPositive = 0;
  let variantsStockNullOrUndefined = 0;
  let productsWithAnyStock = 0;
  let productsMissingImageOrPrice = 0;

  for (const p of products) {
    const variants = Array.isArray(p.variants) ? p.variants : [];
    if (variants.length > 0) {
      let anyStock = false;
      let anyImageOrPriceOk = false;
      for (const v of variants) {
        totalVariants++;
        if (v.stock === null || v.stock === undefined) variantsStockNullOrUndefined++;
        if (Number(v.stock || 0) > 0) {
          variantsWithStockPositive++;
          anyStock = true;
        }
        if (v.price !== null && v.price !== undefined) anyImageOrPriceOk = true;
      }
      if (anyStock) productsWithAnyStock++;
      if (!anyImageOrPriceOk) productsMissingImageOrPrice++;
    } else {
      totalVariants++;
      if (p.stock === null || p.stock === undefined) variantsStockNullOrUndefined++;
      if (Number(p.stock || 0) > 0) {
        variantsWithStockPositive++;
        productsWithAnyStock++;
      }
    }
  }

  console.log(`[DEBUG] Total de variantes/SKUs (todos os produtos, sem filtro de visibilidade): ${totalVariants}`);
  console.log(`[DEBUG] Variantes com stock numérico > 0: ${variantsWithStockPositive}`);
  console.log(`[DEBUG] Variantes com stock null/undefined (sem controle de estoque?): ${variantsStockNullOrUndefined}`);
  console.log(`[DEBUG] Produtos (de todos os ${products.length}) com pelo menos 1 variante/stock > 0: ${productsWithAnyStock}`);
  console.log(`[DEBUG] Produtos com variantes mas nenhuma com price definido: ${productsMissingImageOrPrice}`);

  console.log("Mapeando produtos para o feed...");
  const items = mapProductsToFeedItems(products);
  console.log(`Itens válidos para o feed: ${items.length}`);

  const distinctGroupsInFeed = new Set(items.map((i) => i.itemGroupId || i.id)).size;
  console.log(`[DEBUG] Produtos distintos com ao menos 1 item no feed: ${distinctGroupsInFeed}`);

  console.log("Gerando XML...");
  const outputFile = await buildXml(items);

  console.log(`Feed gerado com sucesso em: ${outputFile}`);
}

main().catch((error) => {
  console.error("Erro ao gerar feed:", error);
  process.exit(1);
});
