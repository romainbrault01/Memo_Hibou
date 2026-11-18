(() => {
  const SUBJECTS = [
    { id: "francais", name: "Français", ico: "📘" },
    { id: "maths", name: "Maths", ico: "🔢" },
    { id: "anglais", name: "Anglais", ico: "🇬🇧" },
    { id: "histoire", name: "Histoire", ico: "🏰" },
    { id: "geo", name: "Géographie", ico: "🗺️" },
    { id: "sciences", name: "Sciences", ico: "🔬" },
    { id: "emc", name: "EMC", ico: "🤝" },
    { id: "arts", name: "Arts", ico: "🎨" },
    { id: "musique", name: "Musique", ico: "🎵" },
    { id: "sport", name: "Sport", ico: "⚽" },
    { id: "autre", name: "Autre", ico: "⭐" },
  ];
  const TYPES = [
    { id: "exercice", name: "Exercice", ico: "✏️" },
    { id: "lecon", name: "Leçon à apprendre", ico: "🧠" },
    { id: "lecture", name: "Lecture", ico: "📖" },
    { id: "poesie", name: "Poésie", ico: "🎭" },
    { id: "controle", name: "Contrôle", ico: "⚠️" },
    { id: "apporter", name: "À apporter", ico: "🎒" },
    { id: "signer", name: "À faire signer", ico: "✍️" },
  ];
  const subj = id => SUBJECTS.find(s => s.id === id) || SUBJECTS[SUBJECTS.length - 1];
  const typ = id => TYPES.find(t => t.id === id) || TYPES[0];
  const $ = id => document.getElementById(id);

  // ---------- Dates ----------
  const DAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const parse = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const todayD = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  // Prochain jour d'école : on saute le week-end (le mercredi reste possible).
  const nextSchoolDays = (n) => {
    const out = []; let d = todayD();
    while (out.length < n) { d = addDays(d, 1); if (d.getDay() !== 0 && d.getDay() !== 6) out.push(d); }
    return out;
  };
  const longDate = d => `${cap(DAYS[d.getDay()])} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  const relLabel = (s) => {
    const d = parse(s), t = todayD(), diff = Math.round((d - t) / 86400000);
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return "Demain";
    if (diff < 0) return "En retard · " + longDate(d);
    return longDate(d);
  };

  // ---------- Réglages d'affichage (propres à cet appareil) ----------
  const store = {
    get(k, def) { try { const v = localStorage.getItem(k); return v === null ? def : JSON.parse(v); } catch (e) { return def; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };
  const SIZES = [["Normal", 1], ["Grand", 1.15], ["Très grand", 1.3]];
  const SPACES = [["Normal", 1.6], ["Aéré", 1.9], ["Très aéré", 2.2]];
  let prefs = store.get("agenda-prefs", { scale: 1.15, lh: 1.9 });
  function applyPrefs() {
    document.documentElement.style.setProperty("--scale", prefs.scale);
    document.documentElement.style.setProperty("--lh", prefs.lh);
    renderChips($("set-size"), SIZES, prefs.scale, v => { prefs.scale = v; store.set("agenda-prefs", prefs); applyPrefs(); });
    renderChips($("set-space"), SPACES, prefs.lh, v => { prefs.lh = v; store.set("agenda-prefs", prefs); applyPrefs(); });
  }
  function renderChips(el, list, current, onPick) {
    el.replaceChildren(...list.map(([label, v]) => {
      const b = document.createElement("button");
      b.className = "chip"; b.textContent = label; b.setAttribute("aria-pressed", String(v === current));
      b.onclick = () => onPick(v);
      return b;
    }));
  }

  // ---------- Données (enregistrées sur l'appareil) ----------
  let items = [];        // {id, matiere, type, texte, pour, fait, exemple}
  let loaded = false;
  const DATA_KEY = "agenda-devoirs-v1";

  function setStatus(t) { $("status").textContent = t; }
  function save() {
    try { localStorage.setItem(DATA_KEY, JSON.stringify(items)); }
    catch (e) { setStatus("Attention : les devoirs n'ont pas pu être enregistrés sur cet appareil (mémoire pleine ou navigation privée)."); }
  }
  function exampleItems() {
    const d = nextSchoolDays(3).map(iso);
    const now = new Date().toISOString();
    return [
      { id: "ex1", matiere: "maths", type: "exercice", pour: d[0], texte: "Exercices 3 et 4 page 52", fait: false, exemple: true, cree: now },
      { id: "ex2", matiere: "francais", type: "poesie", pour: d[0], texte: "Apprendre les 2 premières strophes", fait: true, exemple: true, cree: now },
      { id: "ex3", matiere: "anglais", type: "controle", pour: d[1], texte: "Les jours de la semaine", fait: false, exemple: true, cree: now },
      { id: "ex4", matiere: "sciences", type: "apporter", pour: d[2], texte: "Une bouteille en plastique vide", fait: false, exemple: true, cree: now },
    ];
  }
  function load() {
    let raw = null;
    try { raw = localStorage.getItem(DATA_KEY); } catch (e) {}
    if (raw === null) { items = exampleItems(); save(); }
    else { try { items = JSON.parse(raw) || []; } catch (e) { items = []; } }
    loaded = true;
    setStatus("Les devoirs sont enregistrés sur cet appareil. Ils restent là même sans Internet.");
    // Demande au navigateur de ne pas effacer les données de l'appli.
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
  }
  // Si l'appli est ouverte dans deux fenêtres, on garde les deux à jour.
  window.addEventListener("storage", e => { if (e.key === DATA_KEY) { try { items = JSON.parse(e.newValue) || []; } catch (x) {} render(); } });

  const newId = () => "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  function addItem(data) { items.push({ id: newId(), ...data }); save(); render(); }
  function updateItem(id, patch) { const it = items.find(i => i.id === id); if (it) Object.assign(it, patch); save(); render(); }
  function deleteItem(id) { items = items.filter(i => i.id !== id); save(); render(); }

  // ---------- Sauvegarde dans un fichier (pour changer d'appareil) ----------
  function exportFile() {
    const blob = new Blob([JSON.stringify({ app: "agenda-devoirs", version: 1, exporte: new Date().toISOString(), devoirs: items }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `devoirs-${iso(todayD())}.json`;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    setStatus("Fichier de sauvegarde créé.");
  }
  function importFile(file) {
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        const list = Array.isArray(data) ? data : data.devoirs;
        if (!Array.isArray(list)) throw new Error();
        const known = new Set(items.map(i => i.id));
        let added = 0;
        list.forEach(i => { if (i && i.matiere && i.type && i.pour && !known.has(i.id)) { items.push({ ...i, id: i.id || newId() }); added++; } });
        save(); render();
        setStatus(added ? `${added} devoir${added > 1 ? "s" : ""} récupéré${added > 1 ? "s" : ""}.` : "Aucun nouveau devoir dans ce fichier.");
      } catch (e) { setStatus("Ce fichier n'est pas une sauvegarde de l'agenda."); }
    };
    r.readAsText(file);
  }

  // ---------- Lecture à voix haute ----------
  let frVoice = null;
  function pickVoice() {
    try {
      const vs = speechSynthesis.getVoices().filter(v => /^fr/i.test(v.lang));
      frVoice = vs.find(v => /fr-FR/i.test(v.lang) && /(Google|Amélie|Thomas|Audrey|Microsoft)/i.test(v.name)) || vs.find(v => /fr-FR/i.test(v.lang)) || vs[0] || null;
    } catch (e) {}
  }
  if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.addEventListener?.("voiceschanged", pickVoice); }
  else { $("btn-read-all").hidden = true; }
  function speak(text) {
    try {
      if (!("speechSynthesis" in window)) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text); u.lang = "fr-FR"; u.rate = 0.9;
      if (frVoice) u.voice = frVoice;
      speechSynthesis.speak(u);
    } catch (e) {}
  }
  const sentence = it => {
    const s = subj(it.matiere), t = typ(it.type);
    return `${s.name}. ${t.name}.${it.texte ? " " + it.texte + "." : ""}`;
  };

  // ---------- Affichage ----------
  let openMore = null;
  let confirmDel = null;
  let tab = "week";

  function card(it) {
    const s = subj(it.matiere), t = typ(it.type);
    const el = document.createElement("article");
    el.className = "card" + (it.fait ? " is-done" : "");
    el.style.setProperty("--mc", `var(--m-${s.id})`);

    const badge = document.createElement("div");
    badge.className = "badge"; badge.textContent = s.ico; badge.setAttribute("aria-hidden", "true");

    const body = document.createElement("div"); body.className = "body";
    const line = document.createElement("div"); line.className = "subject";
    const name = document.createElement("span"); name.textContent = s.name;
    const tag = document.createElement("span"); tag.className = "tag" + (it.type === "controle" ? " test" : "");
    tag.textContent = `${t.ico} ${t.name}`;
    line.append(name, tag);
    if (it.exemple) { const ex = document.createElement("span"); ex.className = "tag example"; ex.textContent = "exemple"; line.append(ex); }
    const what = document.createElement("div"); what.className = "what";
    what.textContent = it.texte || t.name;
    body.append(line, what);

    const actions = document.createElement("div"); actions.className = "actions";
    const listen = document.createElement("button"); listen.className = "small-btn"; listen.textContent = "🔊";
    listen.title = "Écouter"; listen.setAttribute("aria-label", "Écouter ce devoir");
    listen.onclick = () => speak(sentence(it));
    const more = document.createElement("button"); more.className = "small-btn"; more.textContent = "⋯";
    more.title = "Plus"; more.setAttribute("aria-label", "Plus d'options");
    more.onclick = () => { openMore = openMore === it.id ? null : it.id; confirmDel = null; render(); };
    const check = document.createElement("button"); check.className = "check";
    check.setAttribute("aria-pressed", String(!!it.fait));
    check.setAttribute("aria-label", it.fait ? "Marquer comme pas fait" : "J'ai fini ce devoir");
    check.title = it.fait ? "Pas encore fait" : "C'est fait !";
    check.textContent = it.fait ? "✓" : "";
    check.onclick = () => { updateItem(it.id, { fait: !it.fait }); };
    actions.append(listen, more, check);

    el.append(badge, body, actions);

    if (openMore === it.id) {
      const row = document.createElement("div"); row.className = "more-row";
      if (confirmDel === it.id) {
        const q = document.createElement("span"); q.textContent = "Supprimer ce devoir ?";
        const yes = document.createElement("button"); yes.className = "danger"; yes.textContent = "Oui, supprimer";
        yes.onclick = () => { openMore = null; confirmDel = null; deleteItem(it.id); };
        const no = document.createElement("button"); no.textContent = "Non";
        no.onclick = () => { confirmDel = null; render(); };
        row.append(q, no, yes);
      } else {
        const later = document.createElement("button"); later.textContent = "Repousser d'un jour";
        later.onclick = () => { openMore = null; const d = parse(it.pour); let n = addDays(d, 1); while (n.getDay() === 0 || n.getDay() === 6) n = addDays(n, 1); updateItem(it.id, { pour: iso(n) }); };
        const del = document.createElement("button"); del.className = "danger"; del.textContent = "Supprimer";
        del.onclick = () => { confirmDel = it.id; render(); };
        row.append(later, del);
      }
      el.append(row);
    }
    return el;
  }

  function sorted(list) {
    return [...list].sort((a, b) => a.pour.localeCompare(b.pour) || (a.type === "controle" ? -1 : 0) - (b.type === "controle" ? -1 : 0));
  }

  function render() {
    const tomorrow = iso(nextSchoolDays(1)[0]);
    const tLabel = relLabel(tomorrow);
    $("focus-title").textContent = tLabel === "Demain" ? "Pour demain" : "Pour " + tLabel.toLowerCase();

    const todayIso = iso(todayD());
    // "Pour demain" : ce qui est dû le prochain jour d'école + ce qui est en retard et pas fait.
    const focus = sorted(items.filter(i => i.pour === tomorrow || (i.pour <= todayIso && !i.fait && i.pour < tomorrow)));
    const fl = $("focus-list");
    if (!loaded) {
      fl.replaceChildren(Object.assign(document.createElement("div"), { className: "empty", textContent: "Chargement de tes devoirs…" }));
    } else if (!focus.length) {
      fl.replaceChildren(Object.assign(document.createElement("div"), { className: "empty", textContent: "Rien de prévu pour l'instant. Appuie sur « + Ajouter un devoir » pour noter ce que la maîtresse ou le maître a donné." }));
    } else {
      fl.replaceChildren(...focus.map(card));
    }
    const dots = $("focus-dots");
    if (focus.length) {
      const done = focus.filter(i => i.fait).length;
      const parts = focus.map(i => { const d = document.createElement("span"); d.className = "dot" + (i.fait ? " on" : ""); return d; });
      const c = document.createElement("span");
      if (done === focus.length) { c.className = "bravo pop"; c.textContent = "Bravo, tout est fait !"; }
      else { c.className = "count"; c.textContent = `${done} sur ${focus.length}`; }
      dots.replaceChildren(...parts, c);
    } else dots.replaceChildren();

    // Onglets
    $("tab-week").setAttribute("aria-selected", String(tab === "week"));
    $("tab-done").setAttribute("aria-selected", String(tab === "done"));
    const focusIds = new Set(focus.map(i => i.id));
    const rest = tab === "week"
      ? sorted(items.filter(i => !focusIds.has(i.id) && i.pour > tomorrow))
      : sorted(items.filter(i => !focusIds.has(i.id) && i.pour <= tomorrow && i.fait)).reverse();
    const week = $("week");
    const blocks = [];
    if (items.some(i => i.exemple)) {
      const n = document.createElement("div"); n.className = "notice";
      n.append(Object.assign(document.createElement("span"), { textContent: "Les devoirs marqués « exemple » sont là pour montrer comment ça marche." }));
      const b = document.createElement("button"); b.textContent = "Effacer les exemples";
      b.onclick = () => items.filter(i => i.exemple).forEach(i => deleteItem(i.id));
      n.append(b); blocks.push(n);
    }
    if (loaded && !rest.length) {
      blocks.push(Object.assign(document.createElement("div"), { className: "empty", textContent: tab === "week" ? "Rien de noté pour les jours suivants." : "Les devoirs finis apparaîtront ici." }));
    }
    const groups = new Map();
    rest.forEach(i => { if (!groups.has(i.pour)) groups.set(i.pour, []); groups.get(i.pour).push(i); });
    for (const [day, list] of groups) {
      const sec = document.createElement("div"); sec.className = "day";
      const h = document.createElement("h3"); h.className = "day-title"; h.textContent = relLabel(day);
      const left = list.filter(i => !i.fait).length;
      if (tab === "week") { const sm = document.createElement("small"); sm.textContent = left ? `${left} à faire` : "tout est fait"; h.append(sm); }
      const l = document.createElement("div"); l.className = "list"; l.append(...list.map(card));
      sec.append(h, l); blocks.push(sec);
    }
    week.replaceChildren(...blocks);
    week.style.display = "flex"; week.style.flexDirection = "column"; week.style.gap = "22px";
  }

  // ---------- Panneau d'ajout ----------
  const draft = { matiere: null, type: null, pour: null };
  function renderPicker() {
    $("pick-subject").replaceChildren(...SUBJECTS.map(s => {
      const b = document.createElement("button"); b.className = "pick";
      b.style.setProperty("--pc", `var(--m-${s.id})`);
      b.setAttribute("aria-pressed", String(draft.matiere === s.id));
      b.innerHTML = `<span class="ico" aria-hidden="true"></span><span></span>`;
      b.children[0].textContent = s.ico; b.children[1].textContent = s.name;
      b.onclick = () => { draft.matiere = s.id; renderPicker(); };
      return b;
    }));
    $("pick-type").replaceChildren(...TYPES.map(t => {
      const b = document.createElement("button"); b.className = "pick";
      b.setAttribute("aria-pressed", String(draft.type === t.id));
      b.innerHTML = `<span class="ico" aria-hidden="true"></span><span></span>`;
      b.children[0].textContent = t.ico; b.children[1].textContent = t.name;
      b.onclick = () => { draft.type = t.id; renderPicker(); };
      return b;
    }));
    const days = nextSchoolDays(5);
    $("pick-date").replaceChildren(...days.map((d, i) => {
      const v = iso(d);
      const b = document.createElement("button"); b.className = "chip";
      b.textContent = i === 0 && relLabel(v) === "Demain" ? `Demain (${DAYS[d.getDay()]})` : `${cap(DAYS[d.getDay()])} ${d.getDate()}`;
      b.setAttribute("aria-pressed", String(draft.pour === v));
      b.onclick = () => { draft.pour = v; $("other-date").value = ""; renderPicker(); };
      return b;
    }));
    $("btn-save").disabled = !(draft.matiere && draft.type && draft.pour);
  }
  function openSheet() {
    draft.matiere = null; draft.type = null; draft.pour = iso(nextSchoolDays(1)[0]);
    $("details").value = ""; $("other-date").value = "";
    renderPicker(); $("sheet-bg").hidden = false;
    setTimeout(() => { const f = $("pick-subject").querySelector("button"); if (f) f.focus(); }, 30);
  }
  function closeSheet() { stopDictation(); $("sheet-bg").hidden = true; $("btn-add").focus(); }
  $("btn-add").onclick = openSheet;
  $("btn-cancel").onclick = closeSheet;
  $("sheet-bg").addEventListener("click", e => { if (e.target === $("sheet-bg")) closeSheet(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("sheet-bg").hidden) closeSheet(); });
  $("other-date").addEventListener("change", e => { if (e.target.value) { draft.pour = e.target.value; renderPicker(); } });
  $("btn-save").onclick = async () => {
    if (!(draft.matiere && draft.type && draft.pour)) return;
    const data = { matiere: draft.matiere, type: draft.type, pour: draft.pour, texte: $("details").value.trim(), fait: false, cree: new Date().toISOString() };
    closeSheet();
    await addItem(data);
  };

  // ---------- Dictée (pour éviter d'écrire) ----------
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null, listening = false, base = "";
  if (SR) {
    $("btn-mic").hidden = false; $("mic-hint").hidden = false;
  }
  function setListening(on) {
    listening = on;
    $("btn-mic").classList.toggle("listening", on);
    $("btn-mic").textContent = on ? "⏹" : "🎤";
    $("btn-mic").setAttribute("aria-label", on ? "Arrêter la dictée" : "Dicter au lieu d'écrire");
  }
  $("btn-mic").onclick = () => {
    if (!SR) return;
    if (listening) { stopDictation(); return; }
    base = $("details").value.trim();
    rec = new SR(); rec.lang = "fr-FR"; rec.interimResults = true; rec.continuous = true;
    rec.onresult = e => {
      let finalText = "", partial = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t; else partial += t;
      }
      if (finalText) base = (base ? base + " " : "") + finalText.trim();
      $("details").value = (base + (partial ? " " + partial : "")).trim();
    };
    rec.onerror = e => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") { $("mic-hint").textContent = "Le micro n'est pas autorisé. Tu peux l'activer dans les réglages du navigateur."; }
      setListening(false);
    };
    rec.onend = () => setListening(false);
    try { rec.start(); setListening(true); } catch (e) { setListening(false); }
  };
  function stopDictation() { if (rec && listening) { try { rec.stop(); } catch (e) {} } }

  // ---------- Installation ----------
  let installEvt = null;
  const standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEvt = e; if (!standalone) $("btn-install").hidden = false; });
  window.addEventListener("appinstalled", () => { $("btn-install").hidden = true; $("install-help").hidden = true; });
  $("btn-install").onclick = async () => {
    if (installEvt) { installEvt.prompt(); try { await installEvt.userChoice; } catch (e) {} installEvt = null; $("btn-install").hidden = true; return; }
    $("install-help").hidden = !$("install-help").hidden;
  };
  // iPad / iPhone : pas de bouton automatique, on montre la marche à suivre.
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIOS && !standalone) { $("btn-install").hidden = false; }

  // ---------- Mode hors ligne ----------
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => { navigator.serviceWorker.register("sw.js").catch(() => {}); });
  }

  // ---------- Divers ----------
  $("btn-settings").onclick = () => { const s = $("settings"); s.hidden = !s.hidden; $("btn-settings").setAttribute("aria-expanded", String(!s.hidden)); };
  $("tab-week").onclick = () => { tab = "week"; render(); };
  $("tab-done").onclick = () => { tab = "done"; render(); };
  $("btn-read-all").onclick = () => {
    const tomorrow = iso(nextSchoolDays(1)[0]);
    const list = sorted(items.filter(i => i.pour === tomorrow && !i.fait));
    if (!list.length) { speak("Tu n'as plus rien à faire pour demain. Bravo !"); return; }
    speak(`Pour demain, tu as ${list.length} devoir${list.length > 1 ? "s" : ""}. ` + list.map(sentence).join(" "));
  };

  $("today").textContent = "Aujourd'hui : " + longDate(todayD());
  $("btn-export").onclick = exportFile;
  $("btn-import").onclick = () => $("import-file").click();
  $("import-file").addEventListener("change", e => { const f = e.target.files && e.target.files[0]; if (f) importFile(f); e.target.value = ""; });

  applyPrefs();
  load();
  render();
})();
