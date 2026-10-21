(function () {
  "use strict";

  var PAIRS = [
    { id: "1804", date: "1804", event: "основание Казанского университета" },
    { id: "1812", date: "1812", event: "открытие Педагогического института" },
    { id: "1851", date: "1851", event: "создание кафедры педагогики" },
    { id: "1876", date: "1876", event: "отдельный Учительский институт" },
    { id: "1922", date: "1922", event: "Восточный педагогический институт" },
    { id: "1934", date: "1934", event: "преобразование в КГПИ" },
    { id: "1941-1945", date: "1941–1945", event: "работа в условиях Великой Отечественной войны" }
  ];

  var rowsEl = document.getElementById("rows");
  var poolEl = document.getElementById("pool");
  var poolHint = document.getElementById("pool-hint");
  var btnCheck = document.getElementById("btn-check");
  var btnReset = document.getElementById("btn-reset");
  var pageTitle = document.getElementById("page-title");
  var page = document.querySelector(".page");
  var ghost = document.getElementById("drag-ghost");

  var checked = false;
  var dragState = null;

  function getPlacements() {
    var map = Object.create(null);
    rowsEl.querySelectorAll(".drop-slot").forEach(function (slot) {
      var chip = slot.querySelector(".event-chip");
      if (chip) map[slot.dataset.dateId] = chip.dataset.eventId;
    });
    return map;
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function createChip(pair) {
    var chip = document.createElement("div");
    chip.className = "event-chip";
    chip.dataset.eventId = pair.id;
    chip.textContent = pair.event;
    chip.setAttribute("role", "button");
    chip.setAttribute("tabindex", "0");
    chip.setAttribute("aria-grabbed", "false");
    return chip;
  }

  function buildRows() {
    rowsEl.innerHTML = "";
    PAIRS.forEach(function (pair) {
      var row = document.createElement("div");
      row.className = "row";
      row.dataset.dateId = pair.id;
      row.setAttribute("role", "row");

      var dateCell = document.createElement("div");
      dateCell.className = "cell-date";
      dateCell.setAttribute("role", "cell");
      dateCell.textContent = pair.date;

      var eventCell = document.createElement("div");
      eventCell.className = "cell-event";
      eventCell.setAttribute("role", "cell");

      var slot = document.createElement("div");
      slot.className = "drop-slot is-empty";
      slot.dataset.dateId = pair.id;

      eventCell.appendChild(slot);
      row.appendChild(dateCell);
      row.appendChild(eventCell);
      rowsEl.appendChild(row);
    });
  }

  function buildPool() {
    poolEl.innerHTML = "";
    shuffle(PAIRS).forEach(function (pair) {
      poolEl.appendChild(createChip(pair));
    });
  }

  function getSlot(dateId) {
    return rowsEl.querySelector('.drop-slot[data-date-id="' + dateId + '"]');
  }

  function clearSlotState(slot) {
    slot.classList.remove("is-correct", "is-wrong", "is-over");
    if (!slot.querySelector(".event-chip")) {
      slot.classList.add("is-empty");
    } else {
      slot.classList.remove("is-empty");
    }
  }

  function placeChip(chip, slot) {
    var previousSlot = chip.closest(".drop-slot");
    if (previousSlot && previousSlot !== slot) {
      clearSlotState(previousSlot);
    }

    var existing = slot.querySelector(".event-chip");
    if (existing && existing !== chip) {
      poolEl.appendChild(existing);
    }

    slot.appendChild(chip);
    clearSlotState(slot);
    updateUI();
  }

  function returnToPool(chip) {
    var previousSlot = chip.closest(".drop-slot");
    poolEl.appendChild(chip);
    if (previousSlot) clearSlotState(previousSlot);
    updateUI();
  }

  function allPlaced() {
    return Object.keys(getPlacements()).length === PAIRS.length;
  }

  function updateUI() {
    var filled = allPlaced();
    var poolEmpty = poolEl.children.length === 0;
    btnCheck.disabled = !filled || checked;
    poolHint.hidden = poolEmpty || checked;
    poolHint.classList.toggle("is-hidden", poolEmpty || checked);
  }

  function resetCheckStyles() {
    rowsEl.querySelectorAll(".drop-slot").forEach(function (slot) {
      slot.classList.remove("is-correct", "is-wrong");
    });
  }

  function checkAnswers() {
    if (!allPlaced() || checked) return;

    checked = true;
    page.classList.add("is-locked");
    pageTitle.textContent = "Проверка";
    btnCheck.disabled = true;
    btnReset.hidden = false;

    var placements = getPlacements();
    var allCorrect = true;
    PAIRS.forEach(function (pair) {
      var slot = getSlot(pair.id);
      var placedId = placements[pair.id];
      var ok = placedId === pair.id;
      slot.classList.toggle("is-correct", ok);
      slot.classList.toggle("is-wrong", !ok);
      if (!ok) allCorrect = false;
    });

    if (allCorrect) {
      btnCheck.textContent = "Верно!";
    } else {
      btnCheck.textContent = "Есть ошибки";
    }
    updateUI();
  }

  function resetAll() {
    checked = false;
    page.classList.remove("is-locked");
    pageTitle.textContent = "Сопоставь события";
    btnCheck.textContent = "Проверить";
    btnReset.hidden = true;
    resetCheckStyles();
    buildRows();
    buildPool();
    bindChipEvents();
    updateUI();
  }

  function slotFromPoint(x, y) {
    var el = document.elementFromPoint(x, y);
    if (!el) return null;
    return el.closest(".drop-slot");
  }

  function startDrag(chip, clientX, clientY) {
    if (checked) return;

    dragState = {
      chip: chip,
      offsetX: 0,
      offsetY: 0,
      fromPool: chip.parentElement === poolEl,
      originParent: chip.parentElement
    };

    chip.classList.add("is-dragging");
    chip.setAttribute("aria-grabbed", "true");

    ghost.hidden = false;
    ghost.textContent = chip.textContent;
    moveGhost(clientX, clientY);
  }

  function moveGhost(x, y) {
    ghost.style.left = x + "px";
    ghost.style.top = y + "px";
  }

  function highlightSlot(slot) {
    rowsEl.querySelectorAll(".drop-slot.is-over").forEach(function (s) {
      s.classList.remove("is-over");
    });
    if (slot && !checked) slot.classList.add("is-over");
  }

  function endDrag(clientX, clientY) {
    if (!dragState) return;

    var chip = dragState.chip;
    var slot = slotFromPoint(clientX, clientY);
    var overPool = false;
    var el = document.elementFromPoint(clientX, clientY);
    if (el && (el === poolEl || poolEl.contains(el) || el === poolHint || (el.closest && el.closest(".pool-section")))) {
      overPool = true;
    }

    chip.classList.remove("is-dragging");
    chip.setAttribute("aria-grabbed", "false");
    ghost.hidden = true;
    highlightSlot(null);

    if (slot) {
      placeChip(chip, slot);
    } else if (overPool || dragState.fromPool === false) {
      if (!slot) returnToPool(chip);
    }

    dragState = null;
  }

  function onPointerDown(e) {
    var chip = e.target.closest(".event-chip");
    if (!chip || checked) return;
    if (e.button != null && e.button !== 0) return;

    e.preventDefault();
    chip.setPointerCapture(e.pointerId);
    startDrag(chip, e.clientX, e.clientY);
  }

  function onPointerMove(e) {
    if (!dragState) return;
    e.preventDefault();
    moveGhost(e.clientX, e.clientY);
    highlightSlot(slotFromPoint(e.clientX, e.clientY));
  }

  function onPointerUp(e) {
    if (!dragState) return;
    endDrag(e.clientX, e.clientY);
  }

  function bindChipEvents() {
    document.querySelectorAll(".event-chip").forEach(function (chip) {
      chip.addEventListener("pointerdown", onPointerDown);
    });
  }

  document.addEventListener("pointermove", onPointerMove, { passive: false });
  document.addEventListener("pointerup", onPointerUp);
  document.addEventListener("pointercancel", onPointerUp);

  btnCheck.addEventListener("click", checkAnswers);
  btnReset.addEventListener("click", resetAll);

  buildRows();
  buildPool();
  bindChipEvents();
  updateUI();
})();
