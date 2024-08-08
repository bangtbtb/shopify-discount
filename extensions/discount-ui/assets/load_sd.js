// (function () {

async function loadShippingDiscount() {
  var elmShipping = document.getElementById("sd_aabbdf");

  async function getShippingDiscount(productId, collIds) {
    var host = window.location.host;
    try {
      var resp = await fetch(`https://${host}/apps/pickd/sd`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ pid: productId, cids: collIds }),
      });

      console.log("Response of shipping discount: ", resp);
      if (!resp.ok) {
        console.log("Request failed");
        throw new Error("Request failed");
      } else {
        var data = await resp.json();
        resolve(data);
      }
    } catch (err) {
      console.log("Get shipping discount error: ", err);
      reject(err);
    }
  }

  /**
   *
   * @param {typeof sdConfigTotal} config
   */
  function renderSDTotal(config) {
    var rows = [];
    for (const step of config.steps) {
      rows.push(`          <tr>
            <td>${step.require}+</td>
            <td>${step.value.value} ${step.value.type === "fix" ? "" : " %"}</td>
          </tr>`);
    }

    $(`#${sdContainerId}`).append(`
    <table class="sd_tbl">
        <thead>
          <tr>
            <th>Buy</th>
            <th>Shipping discount</th>
          </tr>
        </thead>

        <tbody>
        ${rows.join("\n")}
        </tbody>
    </table>
        `);
  }

  /**
   *
   * @param {typeof sdConfigContain} config
   */
  function renderSDVolume(config) {
    var rows = [];
    for (const step of config.steps) {
      rows.push(`          <tr>
            <td>${step.require}+</td>
            <td>${step.value.value} ${step.value.type === "fix" ? "" : " %"}</td>
          </tr>`);
    }

    $(`#${sdContainerId}`).append(`
    <table class="sd_tbl">
        <thead>
          <tr>
            <th>Buy more</th>
            <th>Shipping discount</th>
          </tr>
        </thead>

        <tbody>
        ${rows.join("\n")}
        </tbody>
    </table>
        `);
  }

  function renderShippingDiscount(config) {
    if (config.applyType === "total") {
      return renderSDTotal(config);
    }

    if (config.applyType === "volume") {
      return renderSDVolume(config);
    }
  }

  try {
    var productId = elmShipping.getAttribute("product");
    var collIds = elmShipping.getAttribute("cols")?.split(",");

    var config = await getShippingDiscount(productId, collIds);
    console.log("Shipping discount config: ", config);
    if (config) {
      renderShippingDiscount(config);
    }
  } catch (error) {
    console.log("Load shipping discount error: ", error);
  }
}

//   window.document.addEventListener("DOMContentLoaded", () => {
//     console.log("Start load shipping discount");
//     loadShippingDiscount();
//   });
// })();
