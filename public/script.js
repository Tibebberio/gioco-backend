const regions = document.querySelectorAll(".region");
const regionName = document.getElementById("regionName");
const regionOil = document.getElementById("regionOil");
const regionGold = document.getElementById("regionGold");
const regionOwner = document.getElementById("regionOwner");
const conquerBtn = document.getElementById("conquerBtn");
const buildMineBtn = document.getElementById("buildMineBtn");
const buildRefineryBtn = document.getElementById("buildRefineryBtn");
const totalOilEl = document.getElementById("totalOil");
const totalGoldEl = document.getElementById("totalGold");

let selectedRegion = null;
let totalOil = 0;
let totalGold = 0;

function aggiornaGiocatore() {
  const conquered = Array.from(document.querySelectorAll('.region[data-owner="Giocatore 1"]')).map(region => ({
    id: region.id,
    oil: parseInt(region.dataset.oil),
    gold: parseInt(region.dataset.gold),
    owner: region.dataset.owner
  }));
  const xp = 1250 + conquered.length * 100;
  const level = 1 + Math.floor(conquered.length / 5);

  const data = {
    playerName: "Giocatore 1",
    playerXP: xp,
    playerLevel: level,
    totalOil,
    totalGold,
    conqueredRegions: conquered
  };

  fetch("https://gioco-backend.onrender.com/profilo/Giocatore%201", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (document.getElementById("playerLevel")) document.getElementById("playerLevel").textContent = level;
  if (document.getElementById("playerXP")) document.getElementById("playerXP").textContent = xp;
  if (document.getElementById("playerRegions")) document.getElementById("playerRegions").textContent = conquered.length;
  if (document.getElementById("playerOil")) document.getElementById("playerOil").textContent = totalOil;
  if (document.getElementById("playerGold")) document.getElementById("playerGold").textContent = totalGold;
}

function aggiornaRisorse() {
  totalOil = 0;
  totalGold = 0;
  document.querySelectorAll('.region[data-owner="Giocatore 1"]').forEach(region => {
    totalOil += parseInt(region.dataset.oil);
    totalGold += parseInt(region.dataset.gold);
  });
  totalOilEl.textContent = totalOil;
  totalGoldEl.textContent = totalGold;
}

regions.forEach(region => {
  region.addEventListener("click", () => {
    selectedRegion = region;
    regionName.textContent = region.dataset.name;
    regionOil.textContent = region.dataset.oil;
    regionGold.textContent = region.dataset.gold;
    regionOwner.textContent = region.dataset.owner;
  });
});

conquerBtn.addEventListener("click", () => {
  if (selectedRegion && selectedRegion.dataset.owner !== "Giocatore 1") {
    selectedRegion.dataset.owner = "Giocatore 1";
    selectedRegion.setAttribute("fill", "#ffc107");
    regionOwner.textContent = "Giocatore 1";
    aggiornaRisorse();
    aggiornaGiocatore();
    alert(`${selectedRegion.dataset.name} conquistata!`);
  } else if (selectedRegion) {
    alert(`${selectedRegion.dataset.name} è già tua!`);
  }
});

buildMineBtn.addEventListener("click", () => {
  if (selectedRegion && selectedRegion.dataset.owner === "Giocatore 1" && totalOil >= 50) {
    selectedRegion.dataset.gold = parseInt(selectedRegion.dataset.gold) + 5;
    totalOil -= 50;
    aggiornaRisorse();
    aggiornaGiocatore();
    alert(`Miniera costruita in ${selectedRegion.dataset.name}. Produzione oro +5`);
  } else {
    alert("Non puoi costruire qui o non hai abbastanza petrolio!");
  }
});

buildRefineryBtn.addEventListener("click", () => {
  if (selectedRegion && selectedRegion.dataset.owner === "Giocatore 1" && totalGold >= 50) {
    selectedRegion.dataset.oil = parseInt(selectedRegion.dataset.oil) + 5;
    totalGold -= 50;
    aggiornaRisorse();
    aggiornaGiocatore();
    alert(`Raffineria costruita in ${selectedRegion.dataset.name}. Produzione petrolio +5`);
  } else {
    alert("Non puoi costruire qui o non hai abbastanza oro!");
  }
});

setInterval(() => {
  document.querySelectorAll('.region[data-owner="Giocatore 1"]').forEach(region => {
    totalOil += parseInt(region.dataset.oil);
    totalGold += parseInt(region.dataset.gold);
  });
  totalOilEl.textContent = totalOil;
  totalGoldEl.textContent = totalGold;
  aggiornaGiocatore();
}, 5000);

window.addEventListener("DOMContentLoaded", () => {
  fetch("https://gioco-backend.onrender.com/profilo/Giocatore%201")
    .then(res => res.json())
    .then(saved => {
      if (saved && saved.conqueredRegions) {
        saved.conqueredRegions.forEach(data => {
          const region = document.getElementById(data.id);
          if (region) {
            region.dataset.owner = data.owner;
            region.dataset.oil = data.oil;
            region.dataset.gold = data.gold;
            region.setAttribute("fill", "#ffc107");
          }
        });
        totalOil = saved.totalOil || 0;
        totalGold = saved.totalGold || 0;
        totalOilEl.textContent = totalOil;
        totalGoldEl.textContent = totalGold;
        aggiornaGiocatore();
      }
    });
});
