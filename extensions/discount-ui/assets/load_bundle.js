(function buildBundleUI() {
  const bundleContainerId = "bundle_12jdj2bvs1abbdf";
  // (function buildBundleUI() {

  var elmBundle = document.getElementById(bundleContainerId);

  async function getOD(productId, collIds) {
    var host = window.location.host;
    try {
      var resp = await fetch(`https://${host}/apps/pickd/od`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ pid: productId, cids: collIds }),
      });

      console.log("Response of Bundle discount: ", resp);
      if (!resp.ok) {
        console.log("Request failed");
        throw new Error("Request failed: ", resp);
      } else {
        var data = await resp.json();
        return data;
      }
    } catch (err) {
      console.log("Get Bundle discount error: ", err);
      return null;
    }
  }

  function renderOD(config) {
    if (config.applyType === "total") {
      renderODTotal();
      return;
    }
    if (config.applyType === "contain") {
      renderODContain();
      return;
    }
  }

  function renderODTotal(config) {
    console.log("Render od total ", config);
    var rows = [];
    // // Body
    for (const step of config.total.steps) {
      var row = `<tr><td>${step.total}+</td> <td>${step.value.value} ${step.value.type === "percent" ? "%" : ""}</td></tr>`;
      rows.push(row);
    }
    $(`#${bundleContainerId}`).append(`
    <table class="od_table">
        <thead>
            <tr>
            <th>Totol order</th>
            <th>Discount</th>
            </tr>
        </thead>

        <tbody>
        ${rows.join("\n")}
        </tbody>
    </table>
    `);
  }

  function renderODContain(config) {
    var uiProducts = [];
    var total = 0;
    var remain = 0;
    const vType = config.contain.value.type;
    const dVal = config.contain.value.value;
    const dAvg = dVal / config.contain.productIds.length;

    console.log("Product object: ", config.products);

    for (const p of config.products) {
      console.log("Product: ", p);
      const remain = vType;
      total += Number.parseInt(p.minPrice.amount);

      var newPrice =
        p.minPrice.amount -
        (vType === "fix" ? dAvg : (dVal * p.minPrice.amount) / 100.0);
      uiProducts.push(` <div class="od_ctn_p">
      <img  src="${p.image}" />
      <span class="product-name">${p.title}</span>
      <div>
        <span class="od_price_old">${p.minPrice.amount}</span>
        <span class="od_price_new">${newPrice}</span>
      </div>
    </div>`);
    }
    remain = total - (vType == "fix" ? dVal : (dVal * total) / 100.0);

    $(`#${bundleContainerId}`).append(`
    <div class="od_contain">
        <p class="od_contain_head">${config.title}</p>
        <div class="od_contain_content">
        ${uiProducts.join("\n")}
        </div>
        <div class="od_total">
            <span>=</span>
            <div>
                <span class="od_price_old" style="flex-grow: 1">${total}</span>
                <span class="od_price_new" style="flex-grow: 1">${remain}</span>
            </div>
        </div>
    </div>
    `);
  }
  function renderOD(config) {
    if (config.applyType === "total") {
      return renderODTotal(config);
    }
    if (config.applyType === "contain") {
      return renderODContain(config);
    }
  }

  async function loadOD() {
    try {
      var productId = elmBundle.getAttribute("product");
      var collIds = elmBundle.getAttribute("cols")?.split(",");

      var config = await getOD(productId, collIds);
      console.log("Bundle discount config: ", config);
      if (config) {
        renderOD(config);
      }
    } catch (error) {
      console.log("Load Bundle discount error: ", error);
    }
  }
  const itId = setInterval(() => {
    if ($) {
      loadOD();
      clearInterval(itId);
    }
  }, 50);
})();
