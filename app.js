(function () {
  "use strict";

  var ALL = window.PITANJA || [];
  var LETTERS = ["A", "B", "C", "D", "E"];
  var EXAM_COUNT = 42;
  var EXAM_PASS = 28;
  var EXAM_SECONDS = 60 * 60;
  var STORE_KEY = "kviz-ioz-fbih-v1";
  var SKRIPTA_OBLAST = "Pitanja s ispita (skripta 2025)";
  var SEARCH_LIMIT = 30;

  // Dokazi iz skripti i s weba (data/izvori-skripte.js): ključ je tekst pitanja.
  var DOKUMENTI = window.SKRIPTE_DOKUMENTI || [];
  var IZVORI = window.IZVORI_SKRIPTE || {};
  var WEB_DOK = window.WEB_DOKUMENT || null;
  var IZVORI_WEB = window.IZVORI_WEB || {};
  ALL.forEach(function (q) {
    q.izvori = IZVORI[q.pitanje] || [];
    q.web = IZVORI_WEB[q.pitanje] || null;
  });

  var $ = function (id) { return document.getElementById(id); };
  var session = null;
  var timerHandle = null;
  var reviewOnlyWrong = false;
  var searchIzvor = "sve";
  var lastFocus = null;

  // ---------- pohrana (per-browser, opcionalno) ----------
  function loadStore() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveStore(patch) {
    try {
      var s = loadStore();
      Object.keys(patch).forEach(function (k) { s[k] = patch[k]; });
      localStorage.setItem(STORE_KEY, JSON.stringify(s));
    } catch (e) { /* bez pohrane */ }
  }

  // ---------- pomoćne ----------
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function fmt(n) { return n.toLocaleString("de-DE"); }
  function radioValue(name) {
    var el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : null;
  }
  function setRadio(name, value) {
    var el = document.querySelector('input[name="' + name + '"][value="' + value + '"]');
    if (el) el.checked = true;
  }
  function isWeb(q) { return q.oblast !== SKRIPTA_OBLAST; }
  function izvorOk(q, izvor) {
    if (izvor === "web") return isWeb(q);
    if (izvor === "skripta") return q.izvori.length > 0;
    return true;
  }
  var ICON_CHECK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  var ICON_X = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg>';
  var ICON_OK = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

  function verifiedChip(q) {
    return q.provjereno
      ? '<span class="chip chip-ok" title="Odgovor je provjeren prema tekstu propisa">provjereno</span>'
      : '<span class="chip chip-warn" title="Odgovor nije provjeren prema tekstu propisa – provjerite ga sami">nije provjereno</span>';
  }
  function sourceChips(q) {
    return (isWeb(q) ? '<span class="chip chip-web">Web</span>' : "") +
      (q.izvori.length ? '<span class="chip chip-skripta">Skripta</span>' : "");
  }
  function evidenceCount(q) { return (q.web && WEB_DOK ? 1 : 0) + q.izvori.length; }

  // ---------- dokazi ----------
  function webCard(q) {
    if (!q.web || !WEB_DOK) return "";
    var page = q.web[0];
    return '<section class="ev-card"><div class="ev-body">' +
      '<div class="ev-head"><span class="badge badge-web">WEB</span><span class="ev-title">Katalog pitanja ADS FBiH · str. ' + page + "</span></div>" +
      "<p>Pitanje u katalogu: „" + esc(q.web[1]) + "“" +
      (q.oblast.indexOf("Primjer testa") === 0 ? "" : " Agencija objavljuje samo pitanja, bez odgovora.") + "</p>" +
      '<div class="ev-actions">' +
      '<a class="btn" href="' + encodeURI(WEB_DOK.pdf) + "#page=" + page + '" target="_blank" rel="noopener">Otvori PDF</a>' +
      '<a class="btn" href="' + WEB_DOK.url + '" target="_blank" rel="noopener">Sajt Agencije</a>' +
      "</div></div></section>";
  }
  function scriptCards(q) {
    return q.izvori.map(function (e) {
      var d = DOKUMENTI[e[0]];
      var img = encodeURI(d.slike + e[1] + ".jpg");
      var cap = d.naziv + ", str. " + e[1];
      return '<section class="ev-card">' +
        '<button type="button" class="ev-thumb" data-zoom="' + img + '" data-cap="' + esc(cap) + '" aria-label="Uvećaj stranicu: ' + esc(cap) + '">' +
        '<img loading="lazy" src="' + img + '" alt=""></button>' +
        '<div class="ev-body">' +
        '<div class="ev-head"><span class="badge badge-skripta">SKRIPTA</span><span class="ev-title">' + esc(d.naziv) + " · str. " + e[1] + "</span></div>" +
        (e[2] !== q.pitanje ? "<p>Pitanje u skripti: " + esc(e[2]) + "</p>" : "") +
        '<p class="ev-answer">Odgovor u skripti: <strong>' + esc(e[3]) + "</strong></p>" +
        '<div class="ev-actions">' +
        '<button type="button" class="btn" data-zoom="' + img + '" data-cap="' + esc(cap) + '">Uvećaj stranicu</button>' +
        '<a class="btn" href="' + encodeURI(d.pdf) + "#page=" + e[1] + '" target="_blank" rel="noopener">Otvori PDF</a>' +
        "</div></div></section>";
    }).join("");
  }
  function evidenceDetails(q, open) {
    var n = evidenceCount(q);
    if (!n) return "";
    return '<details class="ev-details"' + (open ? " open" : "") + "><summary>Dokazi (" + n + ")</summary>" +
      '<div class="ev-grid">' + webCard(q) + scriptCards(q) + "</div></details>";
  }

  // ---------- uvećana stranica ----------
  function openZoom(src, cap) {
    lastFocus = document.activeElement;
    $("lb-img").src = src;
    $("lb-img").alt = cap;
    $("lb-cap").textContent = cap;
    $("lb-open").href = src;
    $("lightbox").hidden = false;
    $("lb-close").focus();
  }
  function closeZoom() {
    $("lightbox").hidden = true;
    $("lb-img").src = "";
    if (lastFocus) lastFocus.focus();
  }

  // ---------- ekrani ----------
  function show(screen) {
    ["setup", "search", "quiz", "result"].forEach(function (n) { $("screen-" + n).hidden = n !== screen; });
    $("topbar").hidden = screen === "quiz";
    updateNav(screen);
    window.scrollTo(0, 0);
  }
  function updateNav(screen) {
    var active = screen === "setup" && radioValue("mode") === "exam" ? "exam" : screen;
    document.querySelectorAll(".mainnav button").forEach(function (b) {
      if (b.getAttribute("data-nav") === active) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
  }

  // ---------- oblasti ----------
  function areas() {
    var map = {};
    var order = [];
    ALL.forEach(function (q) {
      if (!map[q.oblast]) { map[q.oblast] = { name: q.oblast, min: q.id, max: q.id, n: 0 }; order.push(q.oblast); }
      var a = map[q.oblast];
      a.n++; a.max = q.id;
    });
    return order.map(function (n) { return map[n]; });
  }
  function selectedAreas() {
    return Array.prototype.map.call(
      document.querySelectorAll("#area-list input:checked"),
      function (el) { return el.value; }
    );
  }

  // ---------- postavke ----------
  function renderSetup() {
    var count = function (iz) { return ALL.filter(function (q) { return izvorOk(q, iz); }).length; };
    $("total-count").textContent = fmt(ALL.length);
    $("verified-count").textContent = fmt(ALL.filter(function (q) { return q.provjereno; }).length);
    $("stat-skripta").textContent = fmt(count("skripta"));
    $("stat-web").textContent = fmt(count("web"));
    ["sve", "web", "skripta"].forEach(function (iz) { $("cnt-" + iz).textContent = fmt(count(iz)); });

    var store = loadStore();
    var saved = store.settings || {};
    $("area-list").innerHTML = areas().map(function (a) {
      var checked = saved.areas ? saved.areas.indexOf(a.name) !== -1 : true;
      return '<label class="area-card"><input type="checkbox" value="' + esc(a.name) + '"' + (checked ? " checked" : "") + ">" +
        '<span><span class="area-name">' + esc(a.name) + '</span><span class="area-meta">' + fmt(a.n) +
        " pitanja · #" + a.min + "–#" + a.max + "</span></span></label>";
    }).join("");

    $("to").max = $("from").max = ALL.length;
    if (saved.mode) setRadio("mode", saved.mode);
    if (saved.izvor) setRadio("izvor", saved.izvor);
    if (saved.feedback) setRadio("feedback", saved.feedback);
    if (saved.from) $("from").value = saved.from;
    if (saved.to) $("to").value = Math.min(saved.to, ALL.length);
    if (saved.count) $("count").value = saved.count;
    $("shuffle-answers").checked = !!saved.shuffle;
    $("only-verified").checked = !!saved.onlyVerified;

    var cont = $("continue-btn");
    if (store.lastTo && store.lastTo < ALL.length) {
      var span = Math.max(1, (saved.to || 20) - (saved.from || 1) + 1);
      var nf = store.lastTo + 1;
      var nt = Math.min(ALL.length, nf + span - 1);
      cont.hidden = false;
      $("cont-range").textContent = "Pitanja #" + nf + " – #" + nt;
      $("cont-area").textContent = ALL[nf - 1].oblast;
      cont.onclick = function () {
        setRadio("mode", "range");
        $("from").value = nf; $("to").value = nt;
        updateModeFields();
        startFromSetup();
      };
    } else {
      cont.hidden = true;
    }
    updateModeFields();
  }

  function updateModeFields() {
    var mode = radioValue("mode");
    $("range-fields").hidden = mode === "exam";
    $("count-field").hidden = mode !== "random";
    var pool = buildPool(mode === "exam");
    var info, n;
    if (mode === "exam") {
      n = Math.min(EXAM_COUNT, pool.length);
      info = "Test: " + EXAM_COUNT + " nasumičnih pitanja iz označenih oblasti, " +
        EXAM_SECONDS / 60 + " minuta, prolaz " + EXAM_PASS + "/" + EXAM_COUNT + ".";
    } else {
      n = mode === "random" ? Math.min(parseInt($("count").value, 10) || 0, pool.length) : pool.length;
      info = "U odabranom rasponu i oblastima ima " + fmt(pool.length) + " pitanja.";
    }
    $("range-info").textContent = info;

    var from = $("from").value, to = $("to").value;
    var izvorNames = { sve: "Sve", web: "Web", skripta: "Skripta" };
    $("sum-count").textContent = fmt(n);
    $("sum-izvor").textContent = izvorNames[radioValue("izvor") || "sve"];
    $("sum-oblasti").textContent = selectedAreas().length + " od " + areas().length;
    $("sum-nacin").textContent = mode === "exam" ? "Simulacija ispita, 60 min"
      : mode === "random" ? "Nasumično iz #" + from + "–#" + to
      : "Redom, #" + from + "–#" + to;
    $("sum-odgovori").textContent = mode === "exam" ? "Na kraju (kao na ispitu)"
      : radioValue("feedback") === "instant" ? "Odmah, s dokazom" : "Na kraju testa";
    $("setup-error").textContent = "";
    if (!$("screen-setup").hidden) updateNav("setup");
  }

  function buildPool(ignoreRange) {
    var sel = selectedAreas();
    var from = parseInt($("from").value, 10) || 1;
    var to = parseInt($("to").value, 10) || ALL.length;
    var onlyVerified = $("only-verified").checked;
    var izvor = radioValue("izvor") || "sve";
    return ALL.filter(function (q) {
      if (sel.indexOf(q.oblast) === -1) return false;
      if (!izvorOk(q, izvor)) return false;
      if (onlyVerified && !q.provjereno) return false;
      if (ignoreRange) return true;
      return q.id >= from && q.id <= to;
    });
  }

  function startFromSetup() {
    var err = $("setup-error");
    err.textContent = "";
    var mode = radioValue("mode");
    var from = parseInt($("from").value, 10);
    var to = parseInt($("to").value, 10);
    var count = parseInt($("count").value, 10);

    if (!selectedAreas().length) { err.textContent = "Označite barem jednu oblast."; return; }
    if (mode !== "exam") {
      if (!(from >= 1 && to >= from && from <= ALL.length)) {
        err.textContent = "Neispravan raspon. Unesite od 1 do " + ALL.length + ", s tim da 'od' ne bude veće od 'do'.";
        return;
      }
    }

    var questions;
    if (mode === "range") {
      questions = buildPool(false);
    } else if (mode === "random") {
      if (!(count >= 1)) { err.textContent = "Unesite broj pitanja."; return; }
      questions = shuffle(buildPool(false)).slice(0, count);
    } else {
      questions = shuffle(buildPool(true)).slice(0, EXAM_COUNT);
    }
    if (!questions.length) { err.textContent = "Nema pitanja za zadane uslove."; return; }

    var settings = {
      areas: selectedAreas(), mode: mode, izvor: radioValue("izvor"), from: from, to: to, count: count,
      feedback: radioValue("feedback"), shuffle: $("shuffle-answers").checked,
      onlyVerified: $("only-verified").checked
    };
    saveStore({ settings: settings });

    startSession(questions, {
      mode: mode,
      feedback: mode === "exam" ? "end" : settings.feedback,
      shuffle: settings.shuffle,
      rangeTo: mode === "range" ? to : null,
      span: to - from + 1
    });
  }

  // ---------- kviz ----------
  function startSession(questions, opts) {
    session = {
      opts: opts,
      idx: 0,
      finished: false,
      startedAt: Date.now(),
      items: questions.map(function (q) {
        var order = q.odgovori.map(function (_, i) { return i; });
        return { q: q, order: opts.shuffle ? shuffle(order) : order, chosen: null };
      })
    };
    stopTimer();
    if (opts.mode === "exam") startTimer(EXAM_SECONDS);
    else $("q-timer").hidden = true;
    renderGrid();
    show("quiz");
    renderQuestion();
  }

  function startTimer(seconds) {
    var end = Date.now() + seconds * 1000;
    var el = $("q-timer");
    el.hidden = false;
    function tick() {
      var left = Math.max(0, Math.round((end - Date.now()) / 1000));
      var m = Math.floor(left / 60), s = left % 60;
      el.textContent = "⏱ " + m + ":" + (s < 10 ? "0" : "") + s;
      el.classList.toggle("low", left <= 300);
      if (left === 0) { stopTimer(); alert("Vrijeme je isteklo."); finish(); }
    }
    tick();
    timerHandle = setInterval(tick, 1000);
  }
  function stopTimer() {
    if (timerHandle) { clearInterval(timerHandle); timerHandle = null; }
  }

  function isCorrect(item) {
    return item.chosen !== null && item.chosen === item.q.tacan;
  }

  function renderQuestion() {
    var it = session.items[session.idx];
    var q = it.q;
    var total = session.items.length;
    var instant = session.opts.feedback === "instant";
    var locked = instant && it.chosen !== null;

    $("q-progress").textContent = "Pitanje " + (session.idx + 1) + " od " + total;
    $("q-bar").style.width = ((session.idx + 1) / total * 100) + "%";
    $("q-barwrap").setAttribute("aria-valuenow", session.idx + 1);
    $("q-barwrap").setAttribute("aria-valuemax", total);
    var answered = session.items.filter(function (x) { return x.chosen !== null; });
    var ok = answered.filter(isCorrect).length;
    $("q-stats").textContent = instant
      ? ok + " tačno · " + (answered.length - ok) + " netačno"
      : "Odgovoreno " + answered.length + " od " + total;

    $("q-number").textContent = "#" + q.id;
    $("q-area").textContent = q.oblast;
    $("q-src").innerHTML = verifiedChip(q) + sourceChips(q);
    $("q-text").textContent = q.pitanje;

    $("q-answers").innerHTML = it.order.map(function (origIdx, pos) {
      var cls = "answer", note = "";
      if (locked) {
        if (origIdx === q.tacan) { cls += " correct"; note = ICON_OK; }
        else if (origIdx === it.chosen) { cls += " wrong"; note = '<span class="a-note">Vaš odgovor</span>'; }
      } else if (origIdx === it.chosen) {
        cls += " chosen";
      }
      return '<button type="button" class="' + cls + '" data-orig="' + origIdx + '"' + (locked ? " disabled" : "") + ">" +
        '<span class="letter">' + LETTERS[pos] + '</span><span class="a-text">' + esc(q.odgovori[origIdx]) + "</span>" + note + "</button>";
    }).join("");

    var ex = $("q-explain");
    if (locked) {
      var good = isCorrect(it);
      var correctPos = it.order.indexOf(q.tacan);
      ex.hidden = false;
      ex.className = "feedback " + (good ? "ok" : "bad");
      ex.innerHTML = (good ? ICON_OK : ICON_X) + "<div><strong>" +
        (good ? "Tačno!" : "Netačno – tačan odgovor je " + LETTERS[correctPos]) + "</strong>" +
        (q.objasnjenje ? "<span>" + esc(q.objasnjenje) + "</span>" : "") + "</div>";
    } else {
      ex.hidden = true;
    }

    var n = evidenceCount(q);
    $("ev-count").textContent = n ? n + (n === 1 ? " izvor" : " izvora") : "";
    var ev = $("q-evidence");
    if (locked) {
      ev.innerHTML = webCard(q) + scriptCards(q) ||
        '<div class="ev-placeholder">Za ovo pitanje nema dokaza iz kataloga ni iz skripti.</div>';
    } else if (instant) {
      ev.innerHTML = '<div class="ev-placeholder">' + (n
        ? "Dokazi (" + n + ") pojavit će se čim odgovorite – stranica kataloga i/ili skripte sa slikom."
        : "Za ovo pitanje nema dokaza iz kataloga ni iz skripti.") + "</div>";
    } else {
      ev.innerHTML = '<div class="ev-placeholder">Dokazi se prikazuju u pregledu odgovora, na kraju testa.</div>';
    }

    $("prev-btn").disabled = session.idx === 0;
    $("next-btn").textContent = session.idx === total - 1 ? "Završi test" : "Sljedeće";
    updateGrid();
  }

  function choose(origIdx) {
    var it = session.items[session.idx];
    if (session.opts.feedback === "instant" && it.chosen !== null) return;
    it.chosen = origIdx;
    renderQuestion();
  }

  function renderGrid() {
    $("q-grid").innerHTML = session.items.map(function (_, i) {
      return '<button type="button" data-idx="' + i + '">' + (i + 1) + "</button>";
    }).join("");
  }
  function updateGrid() {
    var instant = session.opts.feedback === "instant";
    Array.prototype.forEach.call($("q-grid").children, function (b, i) {
      var it = session.items[i];
      var state = "bez odgovora";
      b.className = "";
      if (it.chosen !== null) {
        if (instant) { b.classList.add(isCorrect(it) ? "g-ok" : "g-bad"); state = isCorrect(it) ? "tačno" : "netačno"; }
        else { b.classList.add("answered"); state = "odgovoreno"; }
      }
      if (i === session.idx) { b.classList.add("current"); b.setAttribute("aria-current", "step"); }
      else b.removeAttribute("aria-current");
      b.setAttribute("aria-label", "Pitanje " + (i + 1) + ", " + state);
    });
  }

  function next() {
    if (session.idx < session.items.length - 1) { session.idx++; renderQuestion(); }
    else confirmFinish();
  }
  function confirmFinish() {
    var unanswered = session.items.filter(function (it) { return it.chosen === null; }).length;
    var msg = unanswered ? "Neodgovorenih pitanja: " + unanswered + " (računaju se kao netačna). Završiti test?" : "Završiti test?";
    if (confirm(msg)) finish();
  }

  // ---------- rezultati ----------
  function finish() {
    stopTimer();
    session.finished = true;
    var items = session.items;
    var correct = items.filter(isCorrect).length;
    var total = items.length;
    var pct = Math.round(correct / total * 100);
    var exam = session.opts.mode === "exam";
    var passNeeded = exam ? EXAM_PASS : Math.ceil(total * 2 / 3);
    var passed = correct >= passNeeded;
    var minutes = Math.max(1, Math.round((Date.now() - session.startedAt) / 60000));

    var ring = $("r-ring");
    ring.style.background = "conic-gradient(var(" + (passed ? "--ok" : "--bad") + ") 0 " + pct + "%, var(--track) " + pct + "% 100%)";
    ring.setAttribute("aria-label", correct + " od " + total + " tačno, " + pct + " posto");
    $("r-score").textContent = correct + "/" + total;
    $("r-pct").textContent = pct + "% tačno";
    $("r-status").textContent = passed ? "POLOŽENO" : "NIJE POLOŽENO";
    $("r-status").className = "status-pill " + (passed ? "pass" : "fail");
    $("r-headline").textContent = exam
      ? (passed ? "Prošli biste na stručni ispit" : "Još malo vježbe do prolaza")
      : (passed ? "Odlično, ovaj krug je savladan" : "Ponovite netačna pitanja");
    var diff = correct - passNeeded;
    $("r-detail").textContent = "Za prolaz je potrebno " + passNeeded + " tačnih od " + total + ". " +
      (diff >= 0 ? "Imali ste " + diff + " više od granice" : "Nedostaje vam još " + (-diff)) +
      (exam ? ", za " + minutes + " min." : ".");

    if (session.opts.rangeTo) {
      saveStore({ lastTo: session.opts.rangeTo });
      var nf = session.opts.rangeTo + 1;
      var nb = $("next-range-btn");
      if (nf <= ALL.length) {
        var nt = Math.min(ALL.length, nf + session.opts.span - 1);
        nb.hidden = false;
        nb.textContent = "Sljedeći raspon #" + nf + "–#" + nt;
        nb.onclick = function () {
          $("from").value = nf; $("to").value = nt;
          setRadio("mode", "range");
          startFromSetup();
        };
      } else nb.hidden = true;
    } else {
      $("next-range-btn").hidden = true;
    }

    var wrong = items.filter(function (it) { return !isCorrect(it); });
    var rb = $("retry-wrong-btn");
    rb.disabled = !wrong.length;
    rb.textContent = wrong.length ? "Ponovi " + wrong.length + " netačnih" : "Sve tačno!";
    rb.onclick = function () {
      startSession(wrong.map(function (it) { return it.q; }), {
        mode: "retry", feedback: session.opts.feedback === "end" && session.opts.mode === "exam" ? "instant" : session.opts.feedback,
        shuffle: session.opts.shuffle, rangeTo: null
      });
    };

    // po oblastima
    var by = {}, order = [];
    items.forEach(function (it) {
      if (!by[it.q.oblast]) { by[it.q.oblast] = { ok: 0, n: 0 }; order.push(it.q.oblast); }
      by[it.q.oblast].n++;
      if (isCorrect(it)) by[it.q.oblast].ok++;
    });
    $("r-areas").innerHTML = order.map(function (name) {
      var a = by[name], p = Math.round(a.ok / a.n * 100);
      return '<div class="area-bar"><span class="name">' + esc(name) + "</span>" +
        '<div class="track"><div class="fill' + (a.ok / a.n < 2 / 3 ? " low" : "") + '" style="width:' + p + '%"></div></div>' +
        '<span class="score">' + a.ok + "/" + a.n + "</span></div>";
    }).join("");

    $("rv-all").textContent = "Sva · " + total;
    $("rv-wrong").textContent = "Netačna · " + wrong.length;
    reviewOnlyWrong = wrong.length > 0;
    renderReview();
    show("result");
  }

  function renderReview() {
    $("rv-all").setAttribute("aria-pressed", String(!reviewOnlyWrong));
    $("rv-wrong").setAttribute("aria-pressed", String(reviewOnlyWrong));
    var html = "";
    session.items.forEach(function (it, i) {
      var ok = isCorrect(it);
      if (reviewOnlyWrong && ok) return;
      var q = it.q;
      html += '<article class="result-card">' +
        '<div class="result-meta"><strong style="color:var(' + (ok ? "--ok" : "--bad") + ')">' + (ok ? "✓" : "✗") + "</strong>" +
        "<span>Pitanje " + (i + 1) + " · #" + q.id + " · " + esc(q.oblast) + "</span>" + verifiedChip(q) + sourceChips(q) + "</div>" +
        "<h3>" + esc(q.pitanje) + "</h3><div class=\"rv-answers\">";
      it.order.forEach(function (origIdx, pos) {
        var cls = origIdx === q.tacan ? "correct" : (origIdx === it.chosen ? "wrong" : "");
        var mark = origIdx === q.tacan ? " – tačno" : (origIdx === it.chosen ? " – vaš odgovor" : "");
        html += '<span class="' + cls + '">' + LETTERS[pos] + ") " + esc(q.odgovori[origIdx]) + mark + "</span>";
      });
      if (it.chosen === null) html += '<span class="wrong">Bez odgovora</span>';
      html += "</div>" + (q.objasnjenje ? '<p class="rv-expl">' + esc(q.objasnjenje) + "</p>" : "") +
        evidenceDetails(q, false) + "</article>";
    });
    $("r-review").innerHTML = html || '<p class="muted">Sve tačno – nema netačnih odgovora.</p>';
  }

  // ---------- pretraga ----------
  function norm(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");
  }
  // Odsijeca padežne nastavke da "lisabonski" pronađe i "Lisabonskog", "probni rad" i "probnog rada".
  function stem(w) {
    return w.length > 4 ? w.replace(/(ama|ima|om|og|em|ih|im|oj|a|e|i|o|u)$/, "") : w;
  }
  ALL.forEach(function (q) {
    q.traziPitanje = norm(q.pitanje);
    q.trazi = norm(q.pitanje + " " + q.odgovori.join(" ") + " " + q.izvori.map(function (e) { return e[2]; }).join(" "));
  });
  // Označava pronađene riječi u tekstu, bez obzira na kvačice (normalizacija znak po znak).
  function highlight(text, stems) {
    var n = "";
    for (var i = 0; i < text.length; i++) n += norm(text[i]).charAt(0) || " ";
    var hit = new Array(text.length);
    stems.forEach(function (s) {
      var at = n.indexOf(s);
      while (at !== -1) {
        for (var k = at; k < at + s.length; k++) hit[k] = true;
        at = n.indexOf(s, at + s.length);
      }
    });
    var out = "", open = false;
    for (var j = 0; j < text.length; j++) {
      if (hit[j] && !open) { out += "<mark>"; open = true; }
      if (!hit[j] && open) { out += "</mark>"; open = false; }
      out += esc(text[j]);
    }
    return out + (open ? "</mark>" : "");
  }
  function runSearch() {
    var words = norm($("search").value).split(/[^a-z0-9]+/).filter(function (w) { return w.length >= 2; }).map(stem);
    var info = $("search-info"), box = $("search-results");
    var oblast = $("search-oblast").value;
    var pills = document.querySelectorAll("#search-pills .pill");
    if (!words.length) {
      info.textContent = "";
      box.innerHTML = "";
      pills.forEach(function (p) { p.textContent = { sve: "Sve", web: "Web", skripta: "Skripta" }[p.getAttribute("data-sizvor")]; });
      return;
    }
    var base = ALL.filter(function (q) {
      if (oblast && q.oblast !== oblast) return false;
      return words.every(function (w) { return q.trazi.indexOf(w) !== -1; });
    });
    pills.forEach(function (p) {
      var iz = p.getAttribute("data-sizvor");
      p.textContent = { sve: "Sve", web: "Web", skripta: "Skripta" }[iz] + " · " +
        base.filter(function (q) { return izvorOk(q, iz); }).length;
      p.setAttribute("aria-pressed", String(iz === searchIzvor));
    });
    var hits = base.filter(function (q) { return izvorOk(q, searchIzvor); });
    function score(q) {
      return words.filter(function (w) { return q.traziPitanje.indexOf(w) !== -1; }).length;
    }
    hits.sort(function (a, b) { return score(b) - score(a) || a.id - b.id; });
    info.innerHTML = hits.length
      ? "Pronađeno <strong>" + hits.length + "</strong> pitanja" + (hits.length > SEARCH_LIMIT ? " (prikazano prvih " + SEARCH_LIMIT + " – suzite pretragu)" : "")
      : "Nema pitanja s tim riječima.";
    box.innerHTML = hits.slice(0, SEARCH_LIMIT).map(function (q, i) {
      return '<article class="result-card">' +
        '<div class="result-meta"><strong class="q-number">#' + q.id + "</strong><span>" + esc(q.oblast) + "</span>" + verifiedChip(q) +
        '<span class="spacer"></span>' +
        (isWeb(q) ? '<span class="chip chip-web">' + ICON_CHECK + "Na webu</span>" : '<span class="chip chip-off">Nije na webu</span>') +
        (q.izvori.length ? '<span class="chip chip-skripta">' + ICON_CHECK + "U skripti</span>" : '<span class="chip chip-off">Nije u skripti</span>') +
        "</div>" +
        "<h2>" + highlight(q.pitanje, words) + "</h2>" +
        '<div class="answer-box">' + ICON_OK + "<div><small>Tačan odgovor</small><strong>" + esc(q.odgovori[q.tacan]) + "</strong>" +
        (q.objasnjenje ? '<span class="expl">' + esc(q.objasnjenje) + "</span>" : "") + "</div></div>" +
        evidenceDetails(q, i === 0) +
        "</article>";
    }).join("");
  }
  function openSearch(text) {
    if (typeof text === "string") $("search").value = text;
    show("search");
    runSearch();
    $("search").focus();
  }

  // ---------- događaji ----------
  document.querySelectorAll('input[name="mode"], input[name="izvor"], input[name="feedback"]').forEach(function (el) {
    el.addEventListener("change", updateModeFields);
  });
  ["from", "to", "count"].forEach(function (id) { $(id).addEventListener("input", updateModeFields); });
  $("area-list").addEventListener("change", updateModeFields);
  $("only-verified").addEventListener("change", updateModeFields);
  $("areas-all").onclick = function () {
    document.querySelectorAll("#area-list input").forEach(function (el) { el.checked = true; });
    updateModeFields();
  };
  $("areas-none").onclick = function () {
    document.querySelectorAll("#area-list input").forEach(function (el) { el.checked = false; });
    updateModeFields();
  };
  $("start-btn").onclick = startFromSetup;

  document.querySelectorAll("[data-nav]").forEach(function (b) {
    b.addEventListener("click", function () {
      var to = b.getAttribute("data-nav");
      if (to === "search") { openSearch(); return; }
      if (to === "exam") { setRadio("mode", "exam"); updateModeFields(); }
      show("setup");
      if (to === "exam") document.querySelector(".summary").scrollIntoView({ block: "start" });
    });
  });
  $("quick-search").addEventListener("keydown", function (e) {
    if (e.key === "Enter") { openSearch(this.value); this.value = ""; }
  });

  $("q-answers").addEventListener("click", function (e) {
    var b = e.target.closest(".answer");
    if (b && !b.disabled) choose(parseInt(b.getAttribute("data-orig"), 10));
  });
  $("q-grid").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (b) { session.idx = parseInt(b.getAttribute("data-idx"), 10); renderQuestion(); }
  });
  $("prev-btn").onclick = function () { if (session.idx > 0) { session.idx--; renderQuestion(); } };
  $("next-btn").onclick = next;
  $("finish-btn").onclick = confirmFinish;
  $("quit-btn").onclick = function () {
    if (confirm("Prekinuti kviz bez rezultata?")) { stopTimer(); renderSetup(); show("setup"); }
  };
  $("home-btn").onclick = function () { renderSetup(); show("setup"); };
  $("new-exam-btn").onclick = function () { renderSetup(); setRadio("mode", "exam"); updateModeFields(); startFromSetup(); };
  $("rv-all").onclick = function () { reviewOnlyWrong = false; renderReview(); };
  $("rv-wrong").onclick = function () { reviewOnlyWrong = true; renderReview(); };

  var searchTimer = null;
  $("search").addEventListener("input", function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(runSearch, 200);
  });
  $("search-clear").onclick = function () { $("search").value = ""; runSearch(); $("search").focus(); };
  $("search-oblast").innerHTML += areas().map(function (a) {
    return '<option value="' + esc(a.name) + '">' + esc(a.name) + "</option>";
  }).join("");
  $("search-oblast").addEventListener("change", runSearch);
  $("search-pills").addEventListener("click", function (e) {
    var p = e.target.closest(".pill");
    if (p) { searchIzvor = p.getAttribute("data-sizvor"); runSearch(); }
  });

  document.addEventListener("click", function (e) {
    var z = e.target.closest("[data-zoom]");
    if (z) openZoom(z.getAttribute("data-zoom"), z.getAttribute("data-cap"));
  });
  $("lb-close").onclick = closeZoom;
  $("lightbox").addEventListener("click", function (e) { if (e.target === this || e.target.classList.contains("lb-body")) closeZoom(); });

  document.addEventListener("keydown", function (e) {
    if (!$("lightbox").hidden) { if (e.key === "Escape") closeZoom(); return; }
    var tag = e.target.tagName;
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
    if ($("screen-quiz").hidden) {
      if (e.key === "/") { e.preventDefault(); if ($("screen-search").hidden) $("quick-search").focus(); else $("search").focus(); }
      return;
    }
    var k = e.key.toUpperCase();
    var pos = LETTERS.indexOf(k);
    if (pos === -1 && /^[1-5]$/.test(k)) pos = parseInt(k, 10) - 1;
    var it = session.items[session.idx];
    if (pos >= 0 && pos < it.order.length) choose(it.order[pos]);
    else if (e.key === "ArrowRight" || (e.key === "Enter" && tag !== "BUTTON")) next();
    else if (e.key === "ArrowLeft" && session.idx > 0) { session.idx--; renderQuestion(); }
  });

  if (!ALL.length) {
    $("setup-error").textContent = "Baza pitanja nije učitana (provjerite folder data/).";
  }
  renderSetup();
  show("setup");
})();
