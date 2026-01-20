// ui-events.js
document.addEventListener("DOMContentLoaded", () => {

  // Hamburger toggle
  const toggle = document.getElementById("hamburger-toggle");
  const panel = document.getElementById("hamburger-panel");
  toggle.addEventListener("click", () => {
    panel.classList.toggle("hidden");
  });

  // Guide toggle
  const guideBtn = document.getElementById("guide-button");
  const guide = document.getElementById("guide-container");
  const guideClose = document.getElementById("guide-close");

  guideBtn.onclick = () => guide.classList.toggle("hidden");
  guideClose.onclick = () => guide.classList.add("hidden");

  const guideTable = document.getElementById("guide-table");

  guideTable.addEventListener("contextmenu", (e) => {
    e.preventDefault(); // stop browser right-click menu

    const confirmDelete = confirm("Delete this help table?");
    if (confirmDelete) {
      guideTable.remove();
    }
  });

});
