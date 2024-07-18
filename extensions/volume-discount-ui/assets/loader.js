(function (params) {
  function getVolumeDiscount() {
    var host = window.location.host;
    return new Promise(async (resolve, reject) => {
      try {
        var resp = await fetch(`https://${host}/apps/pick-vd`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
        console.log("Response of volume discount: ", resp);
        if (!resp.ok) {
          console.log("Request failed");
        } else {
          var data = await resp.json();
          console.log("Discount: ", data);
          resolve(data);
        }
      } catch (err) {
        console.log("Get volume discount error: ", err);
      }
    });
  }
  async function loadData() {
    try {
      await getVolumeDiscount();
    } catch (error) {
      console.log("Call discount error: ", error);
    }

    console.log("On log data");
    var elmReaction = document.getElementById("reaction");
    var p1 = document.createElement("p");

    p1.innerHTML = "p1";

    var p2 = document.createElement("p");
    p2.innerHTML = "p2";

    elmReaction.appendChild(p1);
    elmReaction.appendChild(p2);
  }
  console.log("Run script of reaction 1");
  window.document.addEventListener("DOMContentLoaded", () => {
    console.log("Load document done");
    loadData();
  });
  window.document.addEventListener("loadeddata", () => {
    console.log("loadeddata document done");
  });
})();
