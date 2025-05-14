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

function salvaRegioniConquistate() {
  const regioniConquistate = Array.from(document.querySelectorAll('.region[data-owner="Giocatore 1"]')).map(region => ({
    id: region.id,
    oil: region.dataset.oil,
    gold: region.dataset.gold,
    owner: region.dataset.owner
  }));
  localStorage.setItem("regioniConquistate", JSON.stringify(regioniConquistate));
}

function caricaRegioniConquistate() {
  const salvate = JSON.parse(localStorage.getItem("regioniConquistate"));
  if (!salvate) return;
  salvate.forEach(regionData => {
    const region = document.getElementById(regionData.id);
    if (region) {
      region.dataset.owner = regionData.owner;
      region.dataset.oil = regionData.oil;
      region.dataset.gold = regionData.gold;
      region.setAttribute("fill", "#ffc107");
    }
  });
}

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
    salvaRegioniConquistate();
    alert(`${selectedRegion.dataset.name} conquistata!`);
  } else if (selectedRegion) {
    alert(`${selectedRegion.dataset.name} è già tua!`);
  }
});

// Carica dati salvati all'avvio
caricaRegioniConquistate();
aggiornaRisorse();
aggiornaGiocatore();
