// gid://shopify/DiscountAutomaticNode/1095322075209

export function getShopName(name: string) {
  let idx = name.indexOf(".");
  return idx > 0 ? name.slice(0, idx) : name;
}

export function getGraphqlProductId(id: string | number) {
  return "gid://shopify/Product/" + id;
}

export function getGraphqlDiscountId(id: string | number) {
  return `gid://shopify/DiscountAutomaticNode/${id}`;
}

export function splitGQLId(id: string) {
  var idx = id.lastIndexOf("/");
  if (idx >= 0) {
    return id.slice(idx + 1);
  }
  return id;
}
