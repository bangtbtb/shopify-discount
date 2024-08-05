(function () {
  var elmReaction = document.getElementById("vd_09123hnf");

  function getVolumeDiscount() {
    var host = window.location.host;

    return new Promise(async (resolve, reject) => {
      try {
        var productId = elmReaction.getAttribute("product");
        var colIds = elmReaction.getAttribute("cols")?.split(",");

        var resp = await fetch(`https://${host}/apps/pickd/vd`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({ pid: productId, cids: colIds }),
        });

        console.log("Response of volume discount: ", resp);
        if (!resp.ok) {
          console.log("Request failed");
          throw new Error("Request failed");
        } else {
          var data = await resp.json();
          resolve(data);
        }
      } catch (err) {
        console.log("Get volume discount error: ", err);
        reject(err);
      }
    });
  }

  function renderVolumeDiscount(config) {
    try {
      console.log("Render volume discount");
      var tbl = document.createElement("ul");
      for (var i = config.minQuantity; i <= config.maxQuantity; i++) {
        var row = document.createElement("li");
        row.innerHTML = `Buy ${i}, discount ${config.percent * i}`;
        tbl.appendChild(row);
      }
      elmReaction.appendChild(tbl);
      console.log("Render volume discount success");
    } catch (error) {
      console.log("Render error: ", error);
    }
  }

  async function loadData() {
    try {
      var config = await getVolumeDiscount();
      console.log("Volume Discount Config: ", config);
      if (config) {
        renderVolumeDiscount(config);
      }
    } catch (error) {
      console.log("Load volume discount error: ", error);
    }
  }

  window.document.addEventListener("DOMContentLoaded", () => {
    console.log("Start load volume discount");
    loadData();
  });
})();
