(function () {
  "use strict";

  var CARDS = [
    {
      id: 1,
      statement:
        "Педагогический институт при Казанском университете открыли в 1804 году.",
      truth: false,
      explanation:
        "В 1804 году был подписан Устав и открыт сам Казанский императорский университет. А специальное подразделение — Педагогический институт при университете — было создано только в 1812 году."
    },
    {
      id: 2,
      statement:
        "В 1812 году директором Педагогического института стал Фёдор Карлович Броннер.",
      truth: true,
      explanation:
        "Именно он был назначен директором и спроектировал новаторский для того времени учебный план."
    },
    {
      id: 3,
      statement: "В XIX веке будущие учителя изучали только свой предмет.",
      truth: false,
      explanation:
        "Простого владения предметом было недостаточно. Уже тогда закладывались требования гармоничного сочетания знаний с нравственностью и педагогическим тактом, а будущие учителя обязаны были проходить педагогическую практику (пробные уроки) в гимназиях."
    },
    {
      id: 4,
      statement:
        "В 1851 году в Казанском университете открывается первая специализированная кафедра педагогики.",
      truth: true,
      explanation:
        "С этого момента педагогика окончательно признается самостоятельной академической дисциплиной, и на кафедре начинают изучать дидактику и методы воспитания."
    },
    {
      id: 5,
      statement:
        "В августе 1922 года был создан Восточный педагогический институт (ВПИ), который готовил учителей только для русских школ.",
      truth: false,
      explanation:
        "Уникальность ВПИ заключалась в том, что он готовил национальные педагогические кадры для многоязычного региона. Здесь разрабатывались методики преподавания на национальных языках для школ Поволжья."
    },
    {
      id: 6,
      statement:
        "В годы Великой Отечественной войны занятия в педагогическом институте полностью прекратились, так как все корпуса были отданы под госпитали.",
      truth: false,
      explanation:
        "Занятия не прекращались ни на один день, хотя и проходили в тяжелейших условиях: вечером, в неприспособленных помещениях, при свете коптилок. Сроки обучения были сокращены до 3 лет."
    },
    {
      id: 7,
      statement:
        "После Победы в 1945 году директором Казанского государственного педагогического института был назначен Иосиф Ахметжанович Туишев.",
      truth: true,
      explanation:
        "Под его руководством началась работа по освобождению корпусов от госпиталей, капитальному ремонту и восстановлению учебного процесса."
    },
    {
      id: 8,
      statement:
        "В 1876 году в Казани открывается самостоятельный Казанский учительский институт, готовивший преподавателей для городских и уездных училищ.",
      truth: true,
      explanation:
        "Потребность в учительских кадрах росла так стремительно, что после упразднения Педагогического института в 1855 году, в 1876 году пришлось открывать отдельное учебное заведение."
    },
    {
      id: 9,
      statement:
        "Сегодня в КФУ педагогика «заперта» в стенах одного института, а студенты изучают только теорию без привязки к современным лабораториям.",
      truth: false,
      explanation:
        "Сегодня в КФУ действует уникальная сетевая (распределенная) модель. Будущие учителя получают знания в профильных институтах (физики, химии, филологии и др.) прямо в современных научных лабораториях, осваивая 6 обязательных модулей."
    }
  ];

  var cardsEl = document.getElementById("cards");

  function padNum(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function createCard(item) {
    var answerLabel = item.truth ? "Правда" : "Ложь";
    var answerClass = item.truth ? "is-truth" : "is-lie";
    var num = padNum(item.id);

    var article = document.createElement("article");
    article.className = "card";
    article.setAttribute("role", "listitem");

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "card-flip";
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute(
      "aria-label",
      "Карточка " + num + ". " + item.statement + " Нажмите, чтобы узнать ответ."
    );

    btn.innerHTML =
      '<span class="card-inner">' +
      '<span class="card-face card-front">' +
      '<span class="card-num">Карточка ' +
      num +
      "</span>" +
      '<span class="card-statement">' +
      escapeHtml(item.statement) +
      "</span>" +
      '<span class="card-tap" aria-hidden="true">Нажмите, чтобы перевернуть</span>' +
      "</span>" +
      '<span class="card-face card-back ' +
      answerClass +
      '">' +
      '<span class="card-answer">' +
      answerLabel +
      "</span>" +
      '<span class="card-explanation">' +
      escapeHtml(item.explanation) +
      "</span>" +
      "</span>" +
      "</span>";

    btn.addEventListener("click", function () {
      var open = btn.classList.toggle("is-flipped");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    article.appendChild(btn);
    return article;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  CARDS.forEach(function (item) {
    cardsEl.appendChild(createCard(item));
  });
})();
