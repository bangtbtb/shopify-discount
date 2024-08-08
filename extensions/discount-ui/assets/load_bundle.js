function buildBundleUI() {
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
      reject(err);
    }
  }

  /**
   *
   * @param {{
   * label: string;
   * applyType: "total" | "contain";
   * total?: ODTotalConfig | undefined;
   * contain?: ODContainConfig | undefined;
   * }} config
   */
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

  /**
   *
   * @param {{
   * label: string;
   * applyType: "total" | "contain";
   * total?: ODTotalConfig | undefined;
   * contain?: ODContainConfig | undefined;
   * }} config
   */
  function renderODTotal(config) {
    if (!config.total) {
      return;
    }

    // var tbl = document.createElement("table");
    // var thead = document.createElement("thead");

    // var tbody = document.createElement("thead");
    // // Head
    // var th1 = document.createElement("th");
    // var th2 = document.createElement("th");
    // th1.innerHTML = "Total order";
    // th2.innerHTML = "Discount";
    // thead.appendChild(th1);
    // thead.appendChild(th2);

    // // Body
    // for (const step of config.total.steps) {
    //   var row = document.createElement("tr");
    //   var td1 = document.createElement("td");
    //   var td2 = document.createElement("td");

    //   td1.innerHTML = `${step.require}+`;
    //   td2.innerHTML = `${step.value.value} ${step.value.type === "percent" ? "%" : ""}`;

    //   row.appendChild(td1);
    //   row.appendChild(td2);
    //   tbody.appendChild(row);
    // }

    // tbl.setAttribute("class", "od_table");
    // tbl.appendChild(thead);
    // tbl.appendChild(tbody);
    // elmBundle.appendChild(tbl);

    var rows = [];
    // // Body
    for (const step of config.total.steps) {
      var row = `<tr><td>${step.require}+</td> <td>${step.value.value} ${step.value.type === "percent" ? "%" : ""}</td></tr>`;
      rows.push(row);
    }
    $(`#${bundleContainerId}`).a;
  }

  /**
   *
   * @param {{
   * label: string;
   * applyType: "total" | "contain";
   * total?: ODTotalConfig | undefined;
   * contain?: ODContainConfig | undefined;
   * }} config
   */
  function renderODContain(config) {
    var divContain = $(`<div class="od_contain_content"></div>`);
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
  loadOD();

  // window.document.addEventListener("DOMContentLoaded", () => {
  //   console.log("Start load Bundle discount");
  //   loadOD();
  // });

  // })();
}
