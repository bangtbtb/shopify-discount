const bundleContainerId = "bundle_12jdj2bvs1abbdf";
// (function buildBundleUI() {

var elmBundle = document.getElementById(bundleContainerId);
var Shopify = Shopify || {};
var currencySymbol = Shopify?.currency?.active || "VND";

// ---------------------------------------------------------------------------
// Money format handler
// Origin: https://gist.github.com/stewartknapman/8d8733ea58d2314c373e94114472d44c
// Format option: https://help.shopify.com/en/manual/international/pricing/currency-formatting#currency-formatting-options
// ---------------------------------------------------------------------------
Shopify.money_format = "${{amount}}";

Shopify.formatMoney = function (cents, format) {
  if (typeof cents == "string") {
    cents = cents.replace(".", "");
  }
  var value = "";
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = format || this.money_format;
  // console.log("Format string: ", formatString);

  function defaultOption(opt, def) {
    return typeof opt == "undefined" ? def : opt;
  }

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultOption(precision, 2);
    thousands = defaultOption(thousands, ",");
    decimal = defaultOption(decimal, ".");

    if (isNaN(number) || number == null) {
      return 0;
    }

    number = (number / 100.0).toFixed(precision);

    var parts = number.split("."),
      dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + thousands),
      cents = parts[1] ? decimal + parts[1] : "";

    return dollars + cents;
  }

  // console.log("Format string match: ", formatString.match(placeholderRegex));

  switch (formatString.match(placeholderRegex)[1]) {
    case "amount":
      value = formatWithDelimiters(cents, 2);
      break;
    case "amount_no_decimals":
      value = formatWithDelimiters(cents, 0);
      break;
    case "amount_with_comma_separator":
      value = formatWithDelimiters(cents, 2, ".", ",");
      break;
    case "amount_no_decimals_with_comma_separator":
      value = formatWithDelimiters(cents, 0, ".", ",");
      break;
  }

  return formatString.replace(placeholderRegex, value);
};

/**
 *
 * @param {number} length
 * @param {import("./extend_type").InitArrayFunc<T>} v
 * @returns {Array<T>}
 */
function initArray(length, v) {
  if (length <= 0) {
    return [];
  }

  var arr = new Array(length);
  for (let idx = 0; idx < arr.length; idx++) {
    arr[idx] = v instanceof Function ? v(idx) : v;
  }
  return arr;
}

/**
 *
 * @param {import("./discount").DiscountValue} dt
 * @param {number} price
 */
function calcDiscount(dt, price) {
  console.log("Discount: ", (dt.value * price) / 100.0);

  return price - (dt.type === "fix" ? dt.value : (dt.value * price) / 100.0);
}

function price2Text(price) {
  // let preffix = Shopify?.currency?.active || "VND";
  let formatCur = `{{ amount }}`;
  if (price > 100000) {
    formatCur = `{{ amount_no_decimals }}`;
  }
  return Shopify.formatMoney(price, formatCur) + currencySymbol;
}

/**
 *
 * @param {import("./types").FrameConfig} frame
 * @param {string[]?} existed
 *
 */
function frameToStyle(frame, existed) {
  let style = [
    `border-color: ${frame.borderColor}`,
    `background-color: ${frame.bgColor}`,
  ];
  return existed ? [...style, ...existed] : style;
}

/**
 *
 * @param {import("./types").FontConfig} font
 * @param {string[]?} existed
 */
function fontToStyle(font, existed) {
  let style = [
    `color: ${font.color}`,
    `font-size: ${font.size}px`,
    `font-weight: ${font.weight}`,
  ];

  return existed ? [...style, ...existed] : style;
}

/**
 *
 * @param {string} id
 * @returns {string}
 */
function splitGqlId(id) {
  let idx = id.lastIndexOf("/");
  return idx >= 0 ? id.slice(idx + 1) : id;
}

/**
 *
 * @param {import("./types").FrameConfig} frame
 * @param {string} xClass
 * @param {string} children
 * @returns
 */
function renderFrame(frame, xClass, children) {
  let cssClass = `class="frame ${xClass ? xClass : ""}"`;
  return `<div ${cssClass} style="${frameToStyle(frame).join(
    ";",
  )}">${children}</div>`;
}

/**
 *
 * @param {*} font
 * @param {*} content
 * @returns
 */
function renderPText(font, content, xClass, style) {
  let cssClass = xClass ? `class="${xClass}"` : "";
  return `<p ${cssClass} style="${fontToStyle(font, style).join(
    ";",
  )}">${content}</p>`;
}

/**
 *
 * @param {import("./types").FontConfig} font
 * @param {string } content
 * @param {string[]?} style
 * @param {string} xClass Extend class
 * @returns
 */
function renderSpanText(font, content, xClass) {
  let cssClass = xClass ? `class="${xClass}"` : "";
  return `<span ${cssClass} style="${fontToStyle(font).join(
    ";",
  )}">${content}</span>`;
}

/**
 *
 * @param {import("./types").FontConfig} font
 * @param {string } content
 * @param {string} xClass Extend class
 * @param {string[]?} style
 * @returns
 */
function renderHText(font, content, xClass, style) {
  let cssClass = xClass ? `class=${xClass}` : "";
  let inlineS = fontToStyle(font, style);
  return `<h3 ${cssClass} style="${inlineS.join(";")}">${content}</h3>`;
}

/**
 *
 * @param {JQuery<HTMLElement>} container
 * @param {import("./types").BundleProductThemeConfig} theme
 * @param {import("./extend_type").ProductInfoBundle} product
 */
function renderProduct(container, theme, product, productIndex) {
  let variantSelects = [];
  for (let idx = 0; idx < product.requireVol; idx++) {
    var pvarText = `<div class="select_ctn">
      <select class="select variant" data-var-index="${idx}" data-pindex="${productIndex}" data-pid="${
        product.id
      }">
      ${product.variants
        .map(
          (pvar, idx) =>
            `<option value=${pvar.id} data-price=${pvar.price || ""}>
          ${pvar.title}
        </option>`,
        )
        .join("\n")}
      </select>
    </div>
    `;
    variantSelects.push(pvarText);
  }

  const pStyle = `class="frame product_bundle flex_row nowrap" style="${frameToStyle(
    theme.frame,
  ).join(";")}"`;
  container.append(
    `<div  ${pStyle} data-pid="${product.id}">
      <div class="img_ctn">
        <img class="fit_img" src="${product.image}" alt="${product.imageAlt}" />
      </div>
      <div class="flex_column remain">
      ${renderPText(theme.name, product.title, "", ["margin: 0"])}
      <div class="flex_row" style="justify-content: start; align-items: center">
        ${renderPText(
          theme.price,
          price2Text(product.variants[0].price * product.requireVol),
          "product_price",
          ["padding: 4px 8px", "margin: 0"],
        )}
        ${
          product.requireVol > 1
            ? `<span class="product_volume">x ${product.requireVol}</span>`
            : ""
        }
      </div>
            <div class="flex_row" style="justify-content: start">
          ${product.variants.length > 1 ? variantSelects.join() : ""}
        </div>
      </div>
    </div>`,
  );
}

/**
 *
 * @param {string} productId
 * @returns {Promise<import("./extend_type").BundleResponse>}
 */
async function getBundle(productId) {
  var host = window.location.origin;
  try {
    var resp = await fetch(`${host}/apps/pickd/bundle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ pid: productId, cids: [] }),
    });

    // console.log("Response of Bundle discount: ", resp);
    if (!resp.ok) {
      console.log("Request failed");
      throw new Error("Request failed: ", resp);
    } else {
      var data = await resp.json();
      console.log("Bundle data: ", data);

      return data;
    }
  } catch (err) {
    console.log("Get Bundle discount error: ", err);
    return null;
  }
}

/**
 *
 * @param {import("./discount").ODBundleConfig} config
 * @param {import("./extend_type").ProductHandle[]} phandles
 * @returns {Promise<import("./extend_type").ProductInfoBundle[]>}
 */
async function getProducts(config, phandles) {
  /**
   * @type {import("./extend_type").MapBundleProduct}
   */
  let mRequires = {};
  config.productIds.forEach((p, idx) => {
    var normalId = splitGqlId(p);
    mRequires[normalId] = {
      id: normalId,
      requireVol: config.numRequires[idx] || 0,
      handle: "",
    };
  });

  phandles.map((v) => {
    var normalId = splitGqlId(v.id);
    mRequires[normalId].handle = v.handle;
  });

  // const ids = config?.productIds;
  // const requireVols = config?.numRequires;

  var host = window.location.origin;
  var products = [];

  var keys = Object.keys(mRequires);

  for (let idx = 0; idx < keys.length; idx++) {
    const pRequire = mRequires[keys[idx]];

    try {
      var resp = await fetch(`${host}/products/${pRequire.handle}.js`, {
        method: "get",
      });

      // console.log("Response of load product: ", resp);
      if (!resp.ok) {
        console.log("Request product info failed ", resp);
        throw new Error("Request failed: ", resp);
      } else {
        var data = await resp.json();
        data = {
          ...data,
          requireVol: pRequire.requireVol,
        };
        if (data?.images?.length) {
          data.image = data?.images[0];
        }
        products.push(data);
      }
    } catch (err) {
      console.log("Get Bundle discount error: ", err);
      return null;
    }
  }
  return products;
}

/**
 *
 * @param {import("./types").Line[]} lines
 */
async function addToCart(lines) {
  var host = window.location.origin;
  let formData = {
    items: lines,
  };
  fetch(host + "/cart/add.js", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => {
      return response.json();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

/**
 *
 * @param {JQuery<HTMLElement>} cd
 * @param {string} endsAt
 */
async function handleCountdown(cd, endsAt) {
  var timeRemaining =
    Math.floor(
      new Date(endsAt).getTime() / 1000 - new Date().getTime() / 1000,
    ) + 100;

  const timerInterval = setInterval(() => {
    if (timeRemaining <= 0) {
      // Handle clear
      clearInterval(timerInterval);
      cd.children().remove();
      cd.append(`<div class="expired">Expire</div>`);

      // Perform actions when the timer reaches zero
      console.log("Countdown complete!", timeRemaining);
      return 0;
    } else {
      var hours = Math.floor(timeRemaining / 3600);
      var minutes = Math.floor((timeRemaining % 3600) / 60);
      var seconds = timeRemaining % 60;
      // console.log(cd.find(".h"));

      cd.find(".h").text(`${hours}h`);
      cd.find(".m").text(`${minutes}m`);
      cd.find(".s").text(`${seconds}s`);
      // console.log(`Update count down ${hours}h ${minutes}m ${seconds}s`);
    }

    return timeRemaining--;
  }, 1000);
}

/**
 *
 * @param {JQuery<HTMLElement>} container
 * @param {*} price
 * @param {*} priceDiscount
 */
function handleUpdateSummary(container, price, discountPrice) {
  container.find(".price").text(price2Text(price));
  container.find(".discount_price").text(price2Text(discountPrice));
}

/**
 *
 * @param {JQuery<HTMLElement>} container
 * @param {*} price
 */
function handleUpdateProductPrice(container, productId, price) {
  container
    .find(`.product_bundle[data-pid="${productId}"] .product_price`)
    .text(price2Text(price));
}

/**
 *
 * @param {JQuery<HTMLElement>} container
 * @param {JQuery<HTMLElement>} diagonal
 */
function handleResizeBanner(container, diagonal) {
  let ctnOW = container.outerWidth();

  let deg = 45;
  if (ctnOW > 700) {
    deg = 35;
  } else if (ctnOW > 500) {
    deg = 40;
  }
  let rad = (deg * Math.PI) / 180;

  let offsetTop = -(
    diagonal.parent().position().top - container.position().top
  );

  let offsetLeft =
    diagonal.parent().position().left - container.position().left;

  let owExpect = ctnOW * 0.2;
  let d = Math.sin(rad) * owExpect; // Đối (y)
  let k = Math.cos(rad) * owExpect; // Kề (x)

  // console.log(`Offset Top:${offsetTop} Offset_left:${offsetLeft}`);
  // console.log(`Calc k:${k} d:${d} h:${owExpect}`, k);
  let translateX = offsetLeft + k / 2;
  let translateY = offsetTop + d / 2;

  diagonal
    .css(
      "transform",
      `translateX(${translateX}px) translateY(${translateY}px) rotate(${deg}deg)`,
    )
    .width(owExpect + 60);
}

(async function () {
  currencySymbol = elmBundle.getAttribute("currency_symbol") || "₫";
  var productId = elmBundle.getAttribute("product");
  var collIds = elmBundle.getAttribute("cols")?.split(",") || [];

  const { theme, config, productHandles, endsAt } = await getBundle(productId);
  var products = await getProducts(config, productHandles);

  // console.log("Bundle loaded", theme, config, productHandles);
  // console.log("Products loaed", products);

  var totalPrice = 0;
  var productsState = products.map((p) => {
    var rs = initArray(p.requireVol, {
      price: p.variants[0].price,
      id: p.variants[0].id,
    });
    totalPrice += Number(p.variants[0].price);
    return rs;
  });

  var totalDiscountPrice = calcDiscount(config.value, totalPrice);
  console.log(
    `Total: ${totalPrice} type:${typeof totalPrice} config:${config.value}`,
  );

  async function handleAddCart() {
    // console.log("Add to cart");
    var lines = [];

    for (let idx = 0; idx < productsState.length; idx++) {
      const pState = productsState[idx];
      console.log("Pstate: ", idx, pState);

      var ids = {};

      for (let i2 = 0; i2 < pState.length; i2++) {
        const pVar = pState[i2];
        if (!ids[pVar.id]) {
          ids[pVar.id] = 1;
        } else {
          ids[pVar.id] = ids[pVar.id] + 1;
        }
      }
      lines = [
        ...lines,
        ...Object.keys(ids).map((id) => ({ id, quantity: ids[id] })),
      ];
      // console.log("Line: ", lines);
    }
    console.log("Line: ", lines);
    await addToCart(lines);
  }

  /**
   *
   * @param {JQuery<HTMLElement>} container
   * @param {JQuery.ChangeEvent<HTMLElement, undefined, HTMLElement, HTMLElement>} ev
   */
  function handleSelectVariant(container, ev) {
    let productIndex = ev.target.getAttribute("data-pindex");
    let varIndex = ev.target.getAttribute("data-var-index");
    let productId = ev.target.getAttribute("data-pid");
    let varId = ev.currentTarget.value;
    let checked = $(ev.target).find(":checked");
    let newPrice = Number(checked.attr("data-price"));
    console.log("Variant id: ", varId);

    let oldVariant = productsState[productIndex][varIndex];
    productsState[productIndex][varIndex] = { price: newPrice, id: varId };
    let newProductPrice = productsState[productIndex].reduce(
      (prev, cur) => prev + cur.price,
      0,
    );

    totalPrice = totalPrice - oldVariant.price + newPrice;
    totalDiscountPrice = calcDiscount(config.value, totalPrice);

    handleUpdateSummary(container, totalPrice, totalDiscountPrice);
    handleUpdateProductPrice(container, productId, newProductPrice);
  }

  $(document).ready(() => {
    $(`#${bundleContainerId}`).append(
      `<div class="flex_column prv_ctn" style="${frameToStyle(theme.container, [
        "min-width: 280px",
      ]).join(";")}"></div>`,
    );

    var bundleCtn = $(`#${bundleContainerId} > .prv_ctn`);

    // Header
    bundleCtn.append(
      `<div class="flex_row space nowrap bundle_header">
        ${renderHText(theme.title, theme.title.content, [
          "text-align: left ",
          "flex-grow: 2",
        ])}
        <div class="diagonal round_sm" style="background-color: ${
          theme.banner.bgColor
        }"> <span>${config.value.value}${
          config.value.type === "percent" ? "%" : "$"
        } OFF</span>
        </div>
      </div>`,
    );

    var diagonal = bundleCtn.find(".diagonal");
    handleResizeBanner(bundleCtn, diagonal);

    $(window).on("resize", () => handleResizeBanner(bundleCtn, diagonal));

    // Countdown
    if (endsAt) {
      bundleCtn.append(`
        <div class="flex_row space nowrap" style="align-items: center">
          <span  style="width: fit-content;font-size: 18px;font-weight: 600;">
                Expires in
          </span>
          <div class="flex_row_center cd" style="width: fit-content; min-width: 180px">
            <span class="time h">0h</span>
            <span class="time_sep">:</span>
            <span class="time m">0m</span>
            <span class="time_sep">:</span>
          <span class="time s">0s</span>
          </div> 
        </div>`);
      handleCountdown(bundleCtn.find(".cd"), endsAt);
    }

    // Products
    for (let idx = 0; idx < products.length; idx++) {
      const p = products[idx];
      renderProduct(bundleCtn, theme.product, p, idx);
    }

    bundleCtn
      .find(".select.variant")
      .on("change", (ev) => handleSelectVariant(bundleCtn, ev));

    // Total
    bundleCtn.append(
      renderFrame(
        theme.summary.frame,
        null,
        ` <div class="frame flex_row space" style="${frameToStyle(
          theme.summary.frame,
          ["padding: 0.75rem"],
        ).join(";")}"> 
          ${renderPText(
            theme.summary.label,
            theme.summary.label.content,
            "",
            [],
          )}
          <div class="flex_row" style="text-align: right;align-items: center;">
          ${renderSpanText(
            theme.summary.comparePrice,
            price2Text(totalPrice),
            "price old_price",
          )}
          ${renderSpanText(
            theme.summary.price,
            price2Text(totalDiscountPrice),
            "discount_price",
          )}
          </div>
        </div>`,
      ),
    );

    // Button
    bundleCtn.append(
      `<button class="btn_add_cart" style="${fontToStyle(
        theme.button.font,
        frameToStyle(theme.button.frame),
      ).join(";")}"> Add To Cart </button>`,
    );
    bundleCtn.children(".btn_add_cart").on("click", handleAddCart);
  });
})();
