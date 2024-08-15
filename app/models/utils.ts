export function getShopName(shop?: string) {
  if (shop) {
    var idx = shop.indexOf(".");
    return shop.slice(0, idx);
  }
  return "";
}
