(function () {
  "use strict";

  var EVENTS = [
    {
      id: "1804",
      year: "1804",
      text: "основание Казанского университета"
    },
    {
      id: "1812",
      year: "1812",
      text: "открытие Педагогического института при КГУ"
    },
    {
      id: "1835",
      year: "1835",
      text: "новый университетский устав и изменение организации подготовки"
    },
    {
      id: "1851",
      year: "1851",
      text: "создание кафедры педагогики"
    },
    {
      id: "1876",
      year: "1876",
      text: "отдельный Учительский институт в Казани"
    },
    {
      id: "1918-1919",
      year: "1918–1919",
      text: "преобразование в Казанский педагогический институт и Высший институт народного образования"
    },
    {
      id: "1922",
      year: "1922",
      text: "Восточный педагогический институт"
    },
    {
      id: "1934",
      year: "1934",
      text: "Казанский государственный педагогический институт"
    },
    {
      id: "1941-1945",
      year: "1941–1945",
      text: "работа в условиях Великой Отечественной войны"
    }
  ];

  var timelineEl = document.getElementById("timeline");
  var yearsEl = document.getElementById("years");
  var poolEl = document.getElementById("pool");
  var hintEl = document.getElementById("hint");
  var btnCheck = document.getElementById("btn-check");
  var btnReset = document.getElementById("btn-reset");
  var pageTitle = document.getElementById("page-title");
  var page = document.querySelector(".page");
  var ghost = document.getElementById("drag-ghost");

  var checked = false;
  var revealing = false;
  var dragState = null;
  var revealTimer = null;

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

  function createSticker(item) {
    var el = document.createElement("div");
    el.className = "sticker";
    el.dataset.eventId = item.id;
    el.textContent = item.text;
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("aria-grabbed", "false");
    return el;
  }

  function buildTimeline() {
    timelineEl.innerHTML = "";
    yearsEl.innerHTML = "";

    EVENTS.forEach(function (item, index) {
      var year = document.createElement("div");
      year.className = "year-label";
      year.dataset.slot = String(index);
      year.textContent = item.year;
      yearsEl.appendChild(year);

      var point = document.createElement("div");
      point.className = "point";
      point.dataset.slot = String(index);
      point.dataset.correctId = item.id;

      var dot = document.createElement("div");
      dot.className = "point-dot";
      dot.setAttribute("aria-hidden", "true");

      var slot = document.createElement("div");
      slot.className = "drop-slot is-empty";
      slot.dataset.slot = String(index);

      point.appendChild(dot);
      point.appendChild(slot);
      timelineEl.appendChild(point);
    });
  }

  function buildPool() {
    poolEl.innerHTML = "";
    shuffle(EVENTS).forEach(function (item) {
      poolEl.appendChild(createSticker(item));
    });
  }

  function clearSlotState(slot) {
    slot.classList.remove("is-correct", "is-wrong", "is-over");
    if (!slot.querySelector(".sticker")) {
      slot.classList.add("is-empty");
    } else {
      slot.classList.remove("is-empty");
    }
  }

  function placeSticker(sticker, slot) {
    var previousSlot = sticker.closest(".drop-slot");
    if (previousSlot && previousSlot !== slot) {
      clearSlotState(previousSlot);
    }

    var existing = slot.querySelector(".sticker");
    if (existing && existing !== sticker) {
      poolEl.appendChild(existing);
    }

    slot.appendChild(sticker);
    clearSlotState(slot);
    updateUI();
  }

  function returnToPool(sticker) {
    var previousSlot = sticker.closest(".drop-slot");
    poolEl.appendChild(sticker);
    if (previousSlot) clearSlotState(previousSlot);
    updateUI();
  }

  function allPlaced() {
    return timelineEl.querySelectorAll(".drop-slot .sticker").length === EVENTS.length;
  }

  function updateUI() {
    btnCheck.disabled = !allPlaced() || checked || revealing;
    hintEl.hidden = poolEl.children.length === 0 || checked || revealing;
  }

  function checkAnswers() {
    if (!allPlaced() || checked || revealing) return;

    checked = true;
    page.classList.add("is-locked");
    btnCheck.disabled = true;
    hintEl.hidden = true;

    var allCorrect = true;
    timelineEl.querySelectorAll(".drop-slot").forEach(function (slot) {
      var sticker = slot.querySelector(".sticker");
      var ok = sticker && sticker.dataset.eventId === slot.closest(".point").dataset.correctId;
      slot.classList.toggle("is-correct", !!ok);
      slot.classList.toggle("is-wrong", !ok);
      if (sticker) sticker.classList.toggle("is-wrong", !ok);
      if (!ok) allCorrect = false;
    });

    if (allCorrect) {
      pageTitle.textContent = "Верно!";
      revealYears();
      btnReset.hidden = false;
      return;
    }

    pageTitle.textContent = "Есть ошибки";
    revealTimer = window.setTimeout(function () {
      revealCorrectOrder();
    }, 2200);
  }

  function revealYears() {
    yearsEl.hidden = false;
    yearsEl.classList.add("is-visible");
  }

  function revealCorrectOrder() {
    revealing = true;
    pageTitle.textContent = "Правильный порядок";

    timelineEl.querySelectorAll(".drop-slot").forEach(function (slot) {
      slot.classList.remove("is-wrong", "is-correct");
      var sticker = slot.querySelector(".sticker");
      if (sticker) {
        sticker.classList.remove("is-wrong");
        poolEl.appendChild(sticker);
      }
      clearSlotState(slot);
    });

    EVENTS.forEach(function (item, index) {
      var slot = timelineEl.querySelector('.drop-slot[data-slot="' + index + '"]');
      var sticker = poolEl.querySelector('.sticker[data-event-id="' + item.id + '"]');
      if (!sticker) {
        sticker = timelineEl.querySelector('.sticker[data-event-id="' + item.id + '"]');
      }
      if (slot && sticker) {
        slot.appendChild(sticker);
        clearSlotState(slot);
        slot.classList.add("is-correct");
        sticker.classList.add("is-placed-correct");
      }
    });

    revealYears();
    btnReset.hidden = false;
    revealing = false;
    updateUI();
  }

  function resetAll() {
    if (revealTimer) {
      window.clearTimeout(revealTimer);
      revealTimer = null;
    }

    checked = false;
    revealing = false;
    page.classList.remove("is-locked");
    pageTitle.textContent = "Хронологический конструктор";
    btnCheck.textContent = "Проверить";
    btnReset.hidden = true;
    yearsEl.hidden = true;
    yearsEl.classList.remove("is-visible");

    buildTimeline();
    buildPool();
    bindStickerEvents();
    updateUI();
  }

  function slotFromPoint(x, y) {
    var el = document.elementFromPoint(x, y);
    if (!el) return null;
    return el.closest(".drop-slot");
  }

  function startDrag(sticker, clientX, clientY) {
    if (checked || revealing) return;

    dragState = {
      sticker: sticker,
      fromPool: sticker.parentElement === poolEl
    };

    sticker.classList.add("is-dragging");
    sticker.setAttribute("aria-grabbed", "true");

    ghost.hidden = false;
    ghost.textContent = sticker.textContent;
    moveGhost(clientX, clientY);
  }

  function moveGhost(x, y) {
    ghost.style.left = x + "px";
    ghost.style.top = y + "px";
  }

  function highlightSlot(slot) {
    timelineEl.querySelectorAll(".drop-slot.is-over").forEach(function (s) {
      s.classList.remove("is-over");
    });
    if (slot && !checked && !revealing) slot.classList.add("is-over");
  }

  function endDrag(clientX, clientY) {
    if (!dragState) return;

    var sticker = dragState.sticker;
    var slot = slotFromPoint(clientX, clientY);
    var el = document.elementFromPoint(clientX, clientY);
    var overPool =
      el &&
      (el === poolEl ||
        poolEl.contains(el) ||
        (el.closest && el.closest(".pool-section")));

    sticker.classList.remove("is-dragging");
    sticker.setAttribute("aria-grabbed", "false");
    ghost.hidden = true;
    highlightSlot(null);

    if (slot) {
      placeSticker(sticker, slot);
    } else if (overPool || dragState.fromPool === false) {
      if (!slot) returnToPool(sticker);
    }

    dragState = null;
  }

  function onPointerDown(e) {
    var sticker = e.target.closest(".sticker");
    if (!sticker || checked || revealing) return;
    if (e.button != null && e.button !== 0) return;

    e.preventDefault();
    sticker.setPointerCapture(e.pointerId);
    startDrag(sticker, e.clientX, e.clientY);
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

  function bindStickerEvents() {
    document.querySelectorAll(".sticker").forEach(function (sticker) {
      sticker.addEventListener("pointerdown", onPointerDown);
    });
  }

  document.addEventListener("pointermove", onPointerMove, { passive: false });
  document.addEventListener("pointerup", onPointerUp);
  document.addEventListener("pointercancel", onPointerUp);

  btnCheck.addEventListener("click", checkAnswers);
  btnReset.addEventListener("click", resetAll);

  buildTimeline();
  buildPool();
  bindStickerEvents();
  updateUI();
})();
