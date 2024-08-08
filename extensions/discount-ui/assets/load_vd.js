(function () {
  var elmVD = document.getElementById("vd_09123hnf");

  function getVolumeDiscount() {
    var host = window.location.host;

    return new Promise(async (resolve, reject) => {
      try {
        var productId = elmVD.getAttribute("product");
        var colIds = elmVD.getAttribute("cols")?.split(",");

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
    if (!config.steps?.length) {
      return;
    }
    try {
      console.log("Render volume discount");
      var tbl = document.createElement("table");
      var thead = document.createElement("thead");

      var tbody = document.createElement("thead");
      // Head
      var th1 = document.createElement("th");
      var th2 = document.createElement("th");
      th1.innerHTML = "Buy";
      th2.innerHTML = "Discount";
      thead.appendChild(th1);
      thead.appendChild(th2);

      // Body
      for (const step of config.steps) {
        var row = document.createElement("tr");
        var td1 = document.createElement("td");
        var td2 = document.createElement("td");

        td1.innerHTML = `${step.require}+`;
        td2.innerHTML = `${step.value.value} ${step.value.type === "percent" ? "%" : ""}`;

        row.appendChild(td1);
        row.appendChild(td2);
        tbody.appendChild(row);
      }

      tbl.setAttribute("class", "vd_table");
      tbl.appendChild(thead);
      tbl.appendChild(tbody);

      elmVD.appendChild(tbl);
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
