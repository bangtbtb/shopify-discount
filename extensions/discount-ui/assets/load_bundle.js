(function () {
  var elmBundle = document.getElementById("bundle_asdf1abbdf");

  async function getBundleDiscount(productId, collIds) {
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
        throw new Error("Request failed");
      } else {
        var data = await resp.json();
        resolve(data);
      }
    } catch (err) {
      console.log("Get Bundle discount error: ", err);
      reject(err);
    }
  }

  function renderBundleDiscount() {}

  async function loadBundleDiscount() {
    try {
      var productId = elmBundle.getAttribute("product");
      var collIds = elmBundle.getAttribute("cols")?.split(",");

      var config = await getBundleDiscount(productId, collIds);
      console.log("Bundle discount config: ", config);
      if (config) {
        renderBundleDiscount(config);
      }
    } catch (error) {
      console.log("Load Bundle discount error: ", error);
    }
  }

  window.document.addEventListener("DOMContentLoaded", () => {
    console.log("Start load Bundle discount");
    loadBundleDiscount();
  });
})();
