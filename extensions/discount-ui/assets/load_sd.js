(function () {
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

  function renderShippingDiscount() {}

  async function loadShippingDiscount() {
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

  window.document.addEventListener("DOMContentLoaded", () => {
    console.log("Start load shipping discount");
    loadShippingDiscount();
  });
})();
