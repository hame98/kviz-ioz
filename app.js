(function () {
  "use strict";

  var ALL = window.PITANJA || [];
  var LETTERS = ["A", "B", "C", "D", "E"];
  var EXAM_COUNT = 42;
  var EXAM_PASS = 28;
  var EXAM_SECONDS = 60 * 60;
  var STORE_KEY = "kviz-ioz-fbih-v1";
  var SKRIPTA_OBLAST = "Pitanja s ispita (skripta 2025)";

  // Dokazi iz skripti (data/izvori-skripte.js): ključ je tekst pitanja.
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
  function srcBadge(q) {
    return q.provjereno
      ? '<span class="src src-ok" title="Odgovor je provjeren prema tekstu propisa">✓ provjereno u izvoru</span>'
      : '<span class="src src-no" title="Odgovor nije provjeren prema tekstu propisa – provjerite ga sami">⚠ nije provjereno</span>';
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function evidenceHtml(q) {
    if (!q.izvori.length) return "";
    var html = '<div class="evidence"><strong>📄 Dokaz iz skripte</strong>';
    q.izvori.forEach(function (e) {
      var d = DOKUMENTI[e[0]];
      var img = encodeURI(d.slike + e[1] + ".jpg");
      html += '<div class="ev-item">' +
        "<div><strong>" + esc(d.naziv) + "</strong>, str. " + e[1] +
        ' · <a href="' + encodeURI(d.pdf) + "#page=" + e[1] + '" target="_blank" rel="noopener">otvori PDF</a>' +
        ' · <a href="' + img + '" target="_blank" rel="noopener">slika u novom prozoru</a></div>' +
        (e[2] !== q.pitanje ? '<div class="muted">Pitanje u skripti: ' + esc(e[2]) + "</div>" : "") +
        "<div>Odgovor u skripti: <em>" + esc(e[3]) + "</em></div>" +
        '<details><summary>Prikaži stranicu</summary><img loading="lazy" src="' + img + '" alt="' +
        esc(d.naziv) + ", str. " + e[1] + '"></details>' +
        "</div>";
    });
    return html + "</div>";
  }
  function webEvidenceHtml(q) {
    if (!q.web || !WEB_DOK) return "";
    var page = q.web[0];
    return '<div class="evidence"><strong>🌐 Dokaz s weba</strong><div class="ev-item">' +
      "<div><strong>" + esc(WEB_DOK.naziv) + "</strong>, str. " + page +
      ' · <a href="' + encodeURI(WEB_DOK.pdf) + "#page=" + page + '" target="_blank" rel="noopener">otvori PDF</a>' +
      ' · <a href="' + WEB_DOK.url + '" target="_blank" rel="noopener">sajt Agencije</a></div>' +
      '<div class="muted">Pitanje u katalogu: ' + esc(q.web[1]) + "</div>" +
      (q.oblast.indexOf("Primjer testa") === 0 ? "" :
        '<div class="muted">Agencija objavljuje samo pitanja, bez odgovora. Odgovor je iz kviza (vidi objašnjenje).</div>') +
      "</div></div>";
  }
  function izvorOk(q, izvor) {
    if (izvor === "web") return q.oblast !== SKRIPTA_OBLAST;
    if (izvor === "skripta") return q.izvori.length > 0;
    return true;
  }
  function show(screen) {
    ["setup", "quiz", "result"].forEach(function (n) { $("screen-" + n).hidden = n !== screen; });
    window.scrollTo(0, 0);
  }
  function radioValue(name) {
    var el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : null;
  }
  function setRadio(name, value) {
    var el = document.querySelector('input[name="' + name + '"][value="' + value + '"]');
    if (el) el.checked = true;
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
      document.querySelectorAll('#area-list input:checked'),
      function (el) { return el.value; }
    );
  }

  // ---------- postavke ----------
  function renderSetup() {
    $("total-count").textContent = ALL.length;
    $("verified-count").textContent = ALL.filter(function (q) { return q.provjereno; }).length;
    ["sve", "web", "skripta"].forEach(function (iz) {
      $("cnt-" + iz).textContent = ALL.filter(function (q) { return izvorOk(q, iz); }).length;
    });
    var store = loadStore();
    var saved = store.settings || {};
    var list = $("area-list");
    list.innerHTML = "";
    areas().forEach(function (a) {
      var checked = saved.areas ? saved.areas.indexOf(a.name) !== -1 : true;
      var label = document.createElement("label");
      label.innerHTML =
        '<span><input type="checkbox" value="' + esc(a.name) + '"' + (checked ? " checked" : "") + "> " +
        esc(a.name) + " (" + a.n + ")</span>" +
        '<span class="ids">#' + a.min + "–#" + a.max + "</span>";
      list.appendChild(label);
    });

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
      cont.textContent = "Nastavi učenje: pitanja #" + nf + "–#" + nt;
      cont.onclick = function () {
        setRadio("mode", "range");
        $("from").value = nf; $("to").value = nt;
        updateModeFields();
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
    var info = "";
    if (mode === "exam") {
      info = "Test: " + EXAM_COUNT + " nasumičnih pitanja iz označenih oblasti, " +
        EXAM_SECONDS / 60 + " minuta, prolaz " + EXAM_PASS + "/" + EXAM_COUNT + ".";
    } else {
      var n = buildPool(false).length;
      info = "U odabranom rasponu i oblastima ima " + n + " pitanja.";
    }
    $("range-info").textContent = info;
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
      items: questions.map(function (q) {
        var order = q.odgovori.map(function (_, i) { return i; });
        return { q: q, order: opts.shuffle ? shuffle(order) : order, chosen: null };
      })
    };
    stopTimer();
    if (opts.mode === "exam") startTimer(EXAM_SECONDS);
    else $("q-timer").hidden = true;
    renderGrid();
    renderQuestion();
    show("quiz");
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

    $("q-progress").textContent = "Pitanje " + (session.idx + 1) + " / " + total;
    $("q-bar").style.width = ((session.idx + 1) / total * 100) + "%";
    $("q-number").textContent = "#" + q.id;
    $("q-area").textContent = q.oblast;
    $("q-src").innerHTML = srcBadge(q);
    $("q-text").textContent = q.pitanje;

    var box = $("q-answers");
    box.innerHTML = "";
    it.order.forEach(function (origIdx, pos) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "answer";
      b.innerHTML = '<span class="letter">' + LETTERS[pos] + ")</span><span>" + esc(q.odgovori[origIdx]) + "</span>";
      if (locked) {
        b.disabled = true;
        if (origIdx === q.tacan) b.classList.add("correct");
        else if (origIdx === it.chosen) b.classList.add("wrong");
      } else if (origIdx === it.chosen) {
        b.classList.add("chosen");
      }
      b.onclick = function () { choose(origIdx); };
      box.appendChild(b);
    });

    var ex = $("q-explain");
    if (locked) {
      var ok = isCorrect(it);
      ex.hidden = false;
      ex.className = "explain " + (ok ? "ok" : "bad");
      var correctPos = it.order.indexOf(q.tacan);
      ex.innerHTML = "<strong>" + (ok ? "✓ Tačno." : "✗ Netačno. Tačan odgovor: " + LETTERS[correctPos] + ")") +
        "</strong>" + (q.objasnjenje ? "<br>" + esc(q.objasnjenje) : "");
    } else {
      ex.hidden = true;
    }
    var ev = $("q-evidence");
    ev.innerHTML = locked ? webEvidenceHtml(q) + evidenceHtml(q) : "";
    ev.hidden = !ev.innerHTML;

    $("prev-btn").disabled = session.idx === 0;
    $("next-btn").textContent = session.idx === total - 1 ? "Završi →" : "Sljedeće →";
    updateGrid();
  }

  function choose(origIdx) {
    var it = session.items[session.idx];
    if (session.opts.feedback === "instant" && it.chosen !== null) return;
    it.chosen = origIdx;
    renderQuestion();
  }

  function renderGrid() {
    var g = $("q-grid");
    g.innerHTML = "";
    session.items.forEach(function (_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = i + 1;
      b.onclick = function () { session.idx = i; renderQuestion(); };
      g.appendChild(b);
    });
  }
  function updateGrid() {
    var instant = session.opts.feedback === "instant";
    Array.prototype.forEach.call($("q-grid").children, function (b, i) {
      var it = session.items[i];
      b.className = "";
      if (it.chosen !== null) {
        if (instant) b.classList.add(isCorrect(it) ? "g-ok" : "g-bad");
        else b.classList.add("answered");
      }
      if (i === session.idx) b.classList.add("current");
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
    var passNeeded = session.opts.mode === "exam" ? EXAM_PASS : Math.ceil(total * 2 / 3);
    var passed = correct >= passNeeded;

    $("r-status").textContent = passed ? "POLOŽENO" : "NIJE POLOŽENO";
    $("r-status").className = "r-status " + (passed ? "pass" : "fail");
    $("r-score").textContent = correct + " / " + total;
    $("r-detail").textContent = pct + "% tačnih · potrebno za prolaz (2/3): " + passNeeded;

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
    $("retry-wrong-btn").disabled = !wrong.length;
    $("retry-wrong-btn").onclick = function () {
      startSession(wrong.map(function (it) { return it.q; }), {
        mode: "retry", feedback: session.opts.feedback === "end" && session.opts.mode === "exam" ? "instant" : session.opts.feedback,
        shuffle: session.opts.shuffle, rangeTo: null
      });
    };

    renderReview();
    show("result");
  }

  function renderReview() {
    var onlyWrong = $("only-wrong").checked;
    var html = "";
    session.items.forEach(function (it, i) {
      var ok = isCorrect(it);
      if (onlyWrong && ok) return;
      var q = it.q;
      html += '<div class="review-item' + (ok ? "" : " bad") + '">' +
        '<div class="muted">' + (i + 1) + ". · #" + q.id + " · " + esc(q.oblast) + " " + srcBadge(q) + "</div>" +
        '<div class="q">' + esc(q.pitanje) + "</div>";
      it.order.forEach(function (origIdx, pos) {
        var cls = origIdx === q.tacan ? "correct" : (origIdx === it.chosen ? "wrong" : "");
        var mark = origIdx === it.chosen ? " ← vaš odgovor" : "";
        html += '<div class="a ' + cls + '">' + LETTERS[pos] + ") " + esc(q.odgovori[origIdx]) + mark + "</div>";
      });
      if (it.chosen === null) html += '<div class="a wrong">Bez odgovora</div>';
      if (q.objasnjenje) html += '<div class="e">' + esc(q.objasnjenje) + "</div>";
      html += webEvidenceHtml(q) + evidenceHtml(q) + "</div>";
    });
    $("r-review").innerHTML = html || '<p class="muted">Sve tačno!</p>';
  }

  // ---------- pretraga ----------
  var SEARCH_LIMIT = 30;
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
  function yesNo(yes, label) {
    return '<span class="tag ' + (yes ? "tag-yes" : "tag-no") + '">' + label + ": " + (yes ? "DA" : "NE") + "</span>";
  }
  function runSearch() {
    var words = norm($("search").value).split(/[^a-z0-9]+/).filter(function (w) { return w.length >= 2; }).map(stem);
    var info = $("search-info"), box = $("search-results");
    if (!words.length) { info.textContent = ""; box.innerHTML = ""; return; }
    var hits = ALL.filter(function (q) {
      return words.every(function (w) { return q.trazi.indexOf(w) !== -1; });
    });
    // prvo pitanja u kojima su sve riječi u samom tekstu pitanja
    function score(q) {
      return words.filter(function (w) { return q.traziPitanje.indexOf(w) !== -1; }).length;
    }
    hits.sort(function (a, b) { return score(b) - score(a) || a.id - b.id; });
    info.textContent = hits.length
      ? "Pronađeno pitanja: " + hits.length + (hits.length > SEARCH_LIMIT ? " (prikazano prvih " + SEARCH_LIMIT + " – suzite pretragu)" : "")
      : "Nema pitanja s tim riječima.";
    box.innerHTML = hits.slice(0, SEARCH_LIMIT).map(function (q) {
      var naWebu = q.oblast !== SKRIPTA_OBLAST;
      return '<div class="review-item">' +
        '<div class="muted">#' + q.id + " · " + esc(q.oblast) + " " + srcBadge(q) + "</div>" +
        '<div class="tags">' + yesNo(naWebu, "Na webu") + yesNo(q.izvori.length > 0, "U skripti") + "</div>" +
        '<div class="q">' + esc(q.pitanje) + "</div>" +
        '<div class="a correct">✓ Tačan odgovor: ' + esc(q.odgovori[q.tacan]) + "</div>" +
        (q.objasnjenje ? '<div class="e">' + esc(q.objasnjenje) + "</div>" : "") +
        webEvidenceHtml(q) + evidenceHtml(q) +
        "</div>";
    }).join("");
  }
  var searchTimer = null;
  $("search").addEventListener("input", function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(runSearch, 200);
  });

  // ---------- događaji ----------
  document.querySelectorAll('input[name="mode"], input[name="izvor"]').forEach(function (el) { el.addEventListener("change", updateModeFields); });
  ["from", "to"].forEach(function (id) { $(id).addEventListener("input", updateModeFields); });
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
  $("prev-btn").onclick = function () { if (session.idx > 0) { session.idx--; renderQuestion(); } };
  $("next-btn").onclick = next;
  $("finish-btn").onclick = confirmFinish;
  $("quit-btn").onclick = function () {
    if (confirm("Prekinuti kviz bez rezultata?")) { stopTimer(); renderSetup(); show("setup"); }
  };
  $("home-btn").onclick = function () { renderSetup(); show("setup"); };
  $("only-wrong").onchange = renderReview;
  document.addEventListener("keydown", function (e) {
    if ($("screen-quiz").hidden || e.target.tagName === "INPUT") return;
    var k = e.key.toUpperCase();
    var pos = LETTERS.indexOf(k);
    if (pos === -1 && /^[1-5]$/.test(k)) pos = parseInt(k, 10) - 1;
    var it = session.items[session.idx];
    if (pos >= 0 && pos < it.order.length) choose(it.order[pos]);
    else if (e.key === "ArrowRight" || e.key === "Enter") next();
    else if (e.key === "ArrowLeft" && session.idx > 0) { session.idx--; renderQuestion(); }
  });

  if (!ALL.length) {
    $("setup-error").textContent = "Baza pitanja nije učitana (provjerite folder data/).";
  }
  renderSetup();
})();
