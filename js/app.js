/* Hyderabad Week-end — tout le contenu vient de data/trip.json. */
(() => {
  'use strict';

  const PHOTOS = 'assets/photos/';
  const app = document.getElementById('app');
  let trip, lieux, evenements, numeros;
  let credits = {};

  /* Langue de l'interface : espagnol par défaut, français au choix (Pratique > Langue). */
  let LANG = 'es';
  try { const l = localStorage.getItem('lang'); if (l === 'fr' || l === 'es') LANG = l; } catch (e) { /* stockage indisponible */ }
  const L = (fr, es) => (LANG === 'es' ? es : fr);
  const LOC = L('fr-FR', 'es-ES');
  document.documentElement.lang = LANG;

  /* ---------- Libellés d'interface (pas des données du voyage) ---------- */

  const TYPES = { trajet: L('Trajet', 'Trayecto'), visite: L('Visite', 'Visita'), repas: L('Repas', 'Comida'), spectacle: L('Spectacle', 'Espectáculo'), pratique: L('Pratique', 'Práctico') };
  const AVIS = { recommande: L('Recommandé', 'Recomendado'), possible: L('Possible', 'Posible'), a_eviter: L('À éviter', 'Evitar'), sans_interet_ici: L('Sans intérêt ici', 'Sin interés aquí') };
  const CATEGORIES = { artisanat: L('Artisanat', 'Artesanía'), monument: L('Monument', 'Monumento'), palais: L('Palais', 'Palacio'), musee: L('Musée', 'Museo'), hotel: L('Hôtel', 'Hotel') };

  const ICONES = {
    trajet: '<path d="M4 16.5V13l2-5a2 2 0 0 1 1.9-1.5h8.2A2 2 0 0 1 18 8l2 5v3.5z"/><path d="M4 13h16M6.5 16.5v2M17.5 16.5v2"/>',
    visite: '<path d="M3.5 20h17M6 20v-8M18 20v-8M6 12a6 6 0 0 1 12 0M12 6V3.5M10 20v-4a2 2 0 0 1 4 0v4"/>',
    repas: '<path d="M6 3v6a2.5 2.5 0 0 0 5 0V3M8.5 3v18M17.5 3c-2 2-3 4.5-3 8.5h3V21"/>',
    spectacle: '<path d="M11 3l1.9 5.6L18.5 10.5l-5.6 1.9L11 18l-1.9-5.6L3.5 10.5l5.6-1.9zM18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
    pratique: '<path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/><path d="M14 6.5v2M14 11v2M14 15.5v2"/>',
    sites: '<path d="M3.5 20h17M6 20V10M10 20V10M14 20V10M18 20V10M4 10l8-6 8 6z"/>',
    itineraire: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    appel: '<path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2z"/>',
    lien: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    retour: '<path d="M14.5 5l-7 7 7 7"/>',
    suite: '<path d="M9.5 5l7 7-7 7"/>'
  };
  const icone = (nom) => `<svg class="icone" viewBox="0 0 24 24" aria-hidden="true">${ICONES[nom] || ICONES.pratique}</svg>`;

  /* ---------- Outils ---------- */

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const enMinutes = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
  const heure = (min) => (LANG === 'es' ? `${Math.floor(min / 60)}:${String(min % 60).padStart(2, '0')}` : `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}`);
  const heureDe = (hhmm) => heure(enMinutes(hhmm));
  const duree = (min) => {
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60), m = min % 60;
    return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`;
  };
  const numeroJour = (iso) => { const [a, m, j] = iso.split('-').map(Number); return Date.UTC(a, m - 1, j) / 864e5; };
  const dateLongue = (iso) => {
    const [a, m, j] = iso.split('-').map(Number);
    return new Intl.DateTimeFormat(LOC, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(a, m - 1, j)));
  };
  const ville = () => trip.meta.ville.split(',')[0];
  const nomCourt = (jour) => jour.libelle.split(' ')[0];
  const tel = (numero) => `tel:${numero.replace(/[^\d+]/g, '')}`;

  /* Liens Google Maps, construits à partir des coordonnées. */
  const coord = (p) => encodeURIComponent(`${p.lat},${p.lng}`);
  const lienItineraire = (p) => `https://www.google.com/maps/dir/?api=1&destination=${coord(p)}`
    + (p.google_place_id ? `&destination_place_id=${encodeURIComponent(p.google_place_id)}` : '');
  const lienPoint = (p) => `https://www.google.com/maps/search/?api=1&query=${coord(p)}`
    + (p.google_place_id ? `&query_place_id=${encodeURIComponent(p.google_place_id)}` : '');

  /* Date et heure dans le fuseau du voyage, quel que soit celui du téléphone.
     Pour tester : ?maintenant=2026-11-28T15:45 (heure locale du voyage). */
  function maintenant() {
    const force = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/.exec(new URLSearchParams(location.search).get('maintenant') || '');
    if (force) return { date: force[1], minutes: Number(force[2]) * 60 + Number(force[3]) };
    const p = {};
    new Intl.DateTimeFormat('en-CA', {
      timeZone: trip.meta.fuseau, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date()).forEach((x) => { p[x.type] = x.value; });
    return { date: `${p.year}-${p.month}-${p.day}`, minutes: (Number(p.hour) % 24) * 60 + Number(p.minute) };
  }

  function phase(m) {
    if (m.date < trip.meta.date_debut) return 'avant';
    if (m.date > trip.meta.date_fin) return 'apres';
    return 'pendant';
  }

  /* Fin d'un événement : son champ `fin`, sinon le début du suivant, sinon une heure plus tard. */
  function finDe(jour, i) {
    const ev = jour.evenements[i];
    if (ev.fin) return enMinutes(ev.fin);
    const suivant = jour.evenements[i + 1];
    return suivant ? enMinutes(suivant.heure) : enMinutes(ev.heure) + 60;
  }

  /* 'passe' | 'en_cours' | 'a_venir' */
  function etat(jour, i, m) {
    if (phase(m) !== 'pendant' || jour.date > m.date) return 'a_venir';
    if (jour.date < m.date) return 'passe';
    if (m.minutes < enMinutes(jour.evenements[i].heure)) return 'a_venir';
    return m.minutes < finDe(jour, i) ? 'en_cours' : 'passe';
  }

  function dureeEvenement(ev) {
    return ev.fin ? duree(enMinutes(ev.fin) - enMinutes(ev.heure)) : '';
  }

  /* ---------- Fragments ---------- */

  function pastilles(ev) {
    const p = [];
    if (ev.optionnel) p.push('<span class="pastille pastille-optionnel">' + L('Optionnel', 'Opcional') + '</span>');
    if (ev.reservation_obligatoire) p.push('<span class="pastille pastille-reservation">' + L('Réservation obligatoire', 'Reserva obligatoria') + '</span>');
    if (ev.a_confirmer) p.push('<span class="pastille pastille-confirmer">' + L('À confirmer', 'Por confirmar') + '</span>');
    return p.length ? `<span class="pastilles">${p.join('')}</span>` : '';
  }

  function frise(jour, m) {
    return `<ol class="frise">${jour.evenements.map((ev, i) => {
      const e = etat(jour, i, m);
      const meta = [TYPES[ev.type] || ev.type, dureeEvenement(ev)].filter(Boolean).join(' · ');
      return `<li class="etape etat-${e}">
        <a href="#/evenement/${esc(ev.id)}">
          <span class="etape-heure">${heureDe(ev.heure)}${ev.fin ? `<small>→ ${heureDe(ev.fin)}</small>` : ''}</span>
          <span class="etape-picto">${icone(ev.type)}</span>
          <span class="etape-corps">
            ${e === 'en_cours' ? `<span class="etiquette">${L('En cours', 'En curso')}</span>` : ''}
            ${e === 'passe' ? `<span class="masque">${L('Étape passée : ', 'Etapa pasada: ')}</span>` : ''}
            <span class="etape-titre">${esc(ev.titre)}</span>
            <span class="etape-meta">${esc(meta)}</span>
            ${pastilles(ev)}
          </span>
          ${icone('suite')}
        </a>
      </li>`;
    }).join('')}</ol>`;
  }

  function carteJour(jour) {
    const evs = jour.evenements;
    const dernier = evs[evs.length - 1];
    return `<a class="carte-jour jour-${esc(jour.id)}" href="#/jour/${esc(jour.id)}">
      <span class="surtitre">${esc(jour.libelle)}</span>
      <span class="carte-jour-titre">${esc(jour.titre)}</span>
      <span class="carte-jour-resume">${esc(jour.resume)}</span>
      <span class="carte-jour-meta">${evs.length} ${L('étapes', 'etapas')} · ${heureDe(evs[0].heure)} → ${heureDe(dernier.fin || dernier.heure)} · ${esc(jour.zone)}</span>
    </a>`;
  }

  function actions(p) {
    if (!p) return '';
    return `<div class="actions">
      <a class="bouton bouton-principal" href="${lienItineraire(p)}" target="_blank" rel="noopener">${icone('itineraire')}${L('Itinéraire', 'Cómo llegar')}</a>
      ${p.telephone ? `<a class="bouton" href="${tel(p.telephone)}">${icone('appel')}${L('Appeler', 'Llamar')}</a>` : ''}
      ${p.site ? `<a class="bouton" href="${esc(p.site)}" target="_blank" rel="noopener">${icone('lien')}${L('Site officiel', 'Sitio oficial')}</a>` : ''}
    </div>`;
  }

  function phare(titre, jour, ev, complement, classe) {
    const lieu = lieux.get(ev.lieu_id);
    return `<section class="phare ${classe}">
      <h2>${titre}</h2>
      <a class="phare-lien" href="#/evenement/${esc(ev.id)}">
        <span class="etape-picto">${icone(ev.type)}</span>
        <span>
          <span class="phare-titre">${esc(ev.titre)}</span>
          <span class="phare-meta">${esc(complement)}</span>
          ${pastilles(ev)}
        </span>
      </a>
      <p>${esc(ev.description)}</p>
      ${lieu ? `<div class="actions"><a class="bouton bouton-principal" href="${lienItineraire(lieu)}" target="_blank" rel="noopener">${icone('itineraire')}${L('Itinéraire', 'Cómo llegar')}</a></div>` : ''}
    </section>`;
  }

  /* ---------- 4.1 Aujourd'hui ---------- */

  function ecranAujourdhui() {
    const m = maintenant();
    const ph = phase(m);
    const apercu = `<div class="pile">${trip.jours.map(carteJour).join('')}</div>`;

    if (ph === 'avant') {
      const premierJour = trip.jours[0];
      const jours = numeroJour(premierJour.date) - numeroJour(m.date);
      return `<p class="surtitre">${esc(trip.meta.ville)}</p>
        <h1>${esc(trip.meta.titre)}</h1>
        <section class="compte">
          <p class="compte-nombre">${L('J-', 'D-')}${jours}</p>
          <p class="compte-texte">${jours === 1 ? L('Départ demain', 'Salida mañana') : L(`Départ dans ${jours} jours`, `Salida dentro de ${jours} días`)}<br>
          ${esc(premierJour.libelle)}, ${heureDe(premierJour.evenements[0].heure)}</p>
        </section>
        <h2>${L('Les deux journées', 'Las dos jornadas')}</h2>${apercu}
        ${trip.a_confirmer?.length ? `<a class="rappel" href="#/pratique">
          <span class="pastille pastille-confirmer">${L('À confirmer', 'Por confirmar')}</span>
          <span>${L(`${trip.a_confirmer.length} points encore ouverts avant le départ`, `${trip.a_confirmer.length} puntos aún abiertos antes de la salida`)}</span>${icone('suite')}</a>` : ''}`;
    }

    if (ph === 'apres') {
      return `<p class="surtitre">${esc(trip.meta.ville)}</p>
        <h1>${esc(trip.meta.titre)}</h1>
        <p class="note">${L('Le week-end est terminé. Les deux journées restent consultables.', 'El fin de semana ha terminado. Las dos jornadas siguen disponibles.')}</p>${apercu}`;
    }

    const iJour = trip.jours.findIndex((j) => j.date === m.date);
    const jour = trip.jours[iJour];
    if (!jour) return `<h1>${esc(trip.meta.titre)}</h1>${apercu}`;

    const etats = jour.evenements.map((_, i) => etat(jour, i, m));
    const iCours = etats.lastIndexOf('en_cours');
    const iSuite = etats.indexOf('a_venir');
    let blocs = '';

    if (iCours >= 0) {
      const ev = jour.evenements[iCours];
      blocs += phare(L('En cours', 'En curso'), jour, ev, ev.fin ? L(`Jusqu'à ${heureDe(ev.fin)}`, `Hasta las ${heureDe(ev.fin)}`) : L(`Depuis ${heureDe(ev.heure)}`, `Desde las ${heureDe(ev.heure)}`), 'phare-cours');
    } else if (iSuite > 0) {
      blocs += `<p class="note">${L('Entre deux étapes.', 'Entre dos etapas.')}</p>`;
    }
    if (iSuite >= 0) {
      const ev = jour.evenements[iSuite];
      blocs += phare(L('Ensuite', 'A continuación'), jour, ev, L(`À ${heureDe(ev.heure)} · dans ${duree(enMinutes(ev.heure) - m.minutes)}`, `A las ${heureDe(ev.heure)} · dentro de ${duree(enMinutes(ev.heure) - m.minutes)}`), 'phare-suite');
    } else {
      const demain = trip.jours[iJour + 1];
      if (iCours < 0) blocs += `<p class="note">${L('Les étapes de la journée sont terminées.', 'Las etapas de la jornada han terminado.')}</p>`;
      if (demain) blocs += phare(L('Demain', 'Mañana'), demain, demain.evenements[0], `${demain.libelle}, ${heureDe(demain.evenements[0].heure)}`, 'phare-suite');
    }

    return `<p class="surtitre">${esc(jour.libelle)} · ${heure(m.minutes)} ${L('à', 'en')} ${esc(ville())}</p>
      <h1>${esc(jour.titre)}</h1>
      ${blocs}
      <h2>${L('Toute la journée', 'Toda la jornada')}</h2>
      ${frise(jour, m)}`;
  }

  /* ---------- 4.2 Journée ---------- */

  function ecranJour(id) {
    const m = maintenant();
    const jour = trip.jours.find((j) => j.id === id) || trip.jours.find((j) => j.date === m.date) || trip.jours[0];
    return `<div class="segments" role="tablist" aria-label="${L('Journées', 'Jornadas')}">
        ${trip.jours.map((j) => `<a role="tab" href="#/jour/${esc(j.id)}" aria-selected="${j === jour}" class="jour-${esc(j.id)}">${esc(nomCourt(j))}</a>`).join('')}
      </div>
      <p class="surtitre">${esc(jour.libelle)}</p>
      <h1>${esc(jour.titre)}</h1>
      <p class="chapeau">${esc(jour.resume)}</p>
      <p class="zone">${icone('itineraire')}${esc(jour.zone)}</p>
      ${frise(jour, m)}`;
  }

  /* ---------- 4.3 Détail ---------- */

  function photo(p) {
    const cat = CATEGORIES[p.categorie] || '';
    const c = credits[p.id];
    const credit = c ? `<figcaption class="credit" hidden>${L('Photo :', 'Foto:')} <a href="${esc(c.page)}" target="_blank" rel="noopener">${esc(c.auteur)}</a> · ${esc(c.licence)} · Wikimedia Commons</figcaption>` : '';
    return `<figure class="figure-photo"><div class="photo">
      <span class="photo-vide">${icone('visite')}${esc(cat)}</span>
      <img src="${PHOTOS}${encodeURIComponent(p.id)}.jpg" alt="${esc(p.nom)}" onerror="this.remove()" onload="var c=this.closest('figure').querySelector('.credit');if(c)c.hidden=false">
    </div>${credit}</figure>`;
  }

  function ficheLieu(p) {
    const lignes = [];
    if (p.horaires) lignes.push([L('Horaires', 'Horario'), p.horaires]);
    if (p.tarif_indicatif_inr != null) lignes.push([L('Tarif indicatif', 'Precio orientativo'), `${p.tarif_indicatif_inr} ${trip.meta.devise} — ${L('à reconfirmer sur place', 'a reconfirmar in situ')}`]);
    if (p.duree_conseillee_min) lignes.push([L('Durée conseillée', 'Duración recomendada'), duree(p.duree_conseillee_min)]);
    if (p.adresse) lignes.push([L('Adresse', 'Dirección'), p.adresse]);
    if (p.telephone) lignes.push([L('Téléphone', 'Teléfono'), p.telephone]);
    return `${p.description ? `<p>${esc(p.description)}</p>` : ''}
      <dl class="fiche">${lignes.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      ${actions(p)}`;
  }

  function ecranEvenement(id) {
    const trouve = evenements.get(id);
    if (!trouve) return introuvable();
    const { ev, jour } = trouve;
    const lieu = lieux.get(ev.lieu_id);
    const d = dureeEvenement(ev);
    return `<a class="retour" href="#/jour/${esc(jour.id)}">${icone('retour')}${esc(nomCourt(jour))}</a>
      ${lieu ? photo(lieu) : ''}
      <p class="surtitre">${icone(ev.type)}${esc(TYPES[ev.type] || ev.type)} · ${esc(jour.libelle)}</p>
      <h1>${esc(ev.titre)}</h1>
      <p class="horaire">${heureDe(ev.heure)}${ev.fin ? ` → ${heureDe(ev.fin)}` : ''}${d ? `<span> · ${d}</span>` : ''}</p>
      ${pastilles(ev)}
      <p>${esc(ev.description)}</p>
      ${ev.conseils?.length ? `<h2>${L('Conseils', 'Consejos')}</h2><ul class="liste">${ev.conseils.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
      ${lieu ? `<h2>${lieu.nom === ev.titre ? L('Le lieu', 'El lugar') : esc(lieu.nom)}</h2>${ficheLieu(lieu)}` : ''}`;
  }

  function ecranLieu(id) {
    const p = lieux.get(id);
    if (!p) return introuvable();
    const programme = [];
    trip.jours.forEach((jour) => jour.evenements.forEach((ev) => {
      if (ev.lieu_id === id) programme.push(`<li><a href="#/evenement/${esc(ev.id)}">
        <span>${esc(nomCourt(jour))} ${heureDe(ev.heure)}</span><span>${esc(ev.titre)}</span>${icone('suite')}</a></li>`);
    }));
    return `<a class="retour" href="#/${origine}">${icone('retour')}${origine === 'sites' ? L('Sites', 'Sitios') : L('Carte', 'Mapa')}</a>
      ${photo(p)}
      <p class="surtitre">${esc(CATEGORIES[p.categorie] || '')}</p>
      <h1>${esc(p.nom)}</h1>
      ${ficheLieu(p)}
      ${programme.length ? `<h2>${L('Au programme', 'En el programa')}</h2><ul class="liens">${programme.join('')}</ul>` : ''}`;
  }

  function introuvable() {
    return `<h1>${L('Page introuvable', 'Página no encontrada')}</h1><p><a href="#/">${L("Revenir à l'accueil", 'Volver al inicio')}</a></p>`;
  }

  /* ---------- 4.4 Carte ---------- */

  function ecranCarte() {
    const LARG = 360, H = 340, marge = 30, rayon = 13;
    const points = [...lieux.values()];
    const lat0 = points.reduce((s, p) => s + p.lat, 0) / points.length;
    const k = Math.cos(lat0 * Math.PI / 180);
    const xs = points.map((p) => p.lng * k), ys = points.map((p) => p.lat);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const echelle = Math.min((LARG - 2 * marge) / (maxX - minX || 1), (H - 2 * marge) / (maxY - minY || 1));
    const dx = (LARG - (maxX - minX) * echelle) / 2, dy = (H - (maxY - minY) * echelle) / 2;
    const pos = new Map(points.map((p, i) => [p.id, { x: dx + (xs[i] - minX) * echelle, y: dy + (maxY - ys[i]) * echelle }]));

    // Écarte les marqueurs qui se chevauchent (sites très proches) ; un trait les relie au point réel.
    const marq = new Map([...pos].map(([id, q]) => [id, { ...q }]));
    const liste = [...marq.values()];
    for (let tour = 0; tour < 40; tour++) {
      for (let a = 0; a < liste.length; a++) for (let b = a + 1; b < liste.length; b++) {
        const A = liste[a], B = liste[b];
        let vx = B.x - A.x, vy = B.y - A.y;
        const d = Math.hypot(vx, vy) || 0.01, mini = rayon * 2 + 4;
        if (d < mini) {
          const pousse = (mini - d) / 2; vx /= d; vy /= d;
          A.x -= vx * pousse; A.y -= vy * pousse; B.x += vx * pousse; B.y += vy * pousse;
        }
      }
      liste.forEach((q) => { q.x = Math.min(LARG - rayon - 2, Math.max(rayon + 2, q.x)); q.y = Math.min(H - rayon - 2, Math.max(rayon + 2, q.y)); });
    }

    const f = (n) => n.toFixed(1);
    const trajets = trip.jours.map((jour) => {
      const ids = ['hotel', ...new Set(jour.evenements.map((e) => e.lieu_id).filter((i) => pos.has(i)))];
      return `<polyline class="trajet jour-${esc(jour.id)}" points="${ids.map((i) => `${f(pos.get(i).x)},${f(pos.get(i).y)}`).join(' ')}"/>`;
    }).join('');
    const reperes = points.map((p) => {
      const q = marq.get(p.id), r = pos.get(p.id), n = numeros.get(p.id);
      const ecart = Math.hypot(q.x - r.x, q.y - r.y) > 2;
      return `<a href="#/lieu/${esc(p.id)}" class="repere jour-${esc(n.jour)}" aria-label="${esc(p.nom)}">
        ${ecart ? `<line x1="${f(r.x)}" y1="${f(r.y)}" x2="${f(q.x)}" y2="${f(q.y)}"/><circle class="ancre" cx="${f(r.x)}" cy="${f(r.y)}" r="2.5"/>` : ''}
        <circle class="zone-tactile" cx="${f(q.x)}" cy="${f(q.y)}" r="22"/>
        <circle class="pion" cx="${f(q.x)}" cy="${f(q.y)}" r="${rayon}"/>
        <text x="${f(q.x)}" y="${f(q.y)}" dy=".35em">${esc(n.signe)}</text>
      </a>`;
    }).join('');

    const legende = points.map((p) => {
      const n = numeros.get(p.id);
      return `<li>
        <a class="legende-lieu" href="#/lieu/${esc(p.id)}">
          <span class="puce jour-${esc(n.jour)}">${esc(n.signe)}</span>
          <span><span class="legende-nom">${esc(p.nom)}</span><span class="legende-jour">${esc(n.libelle)}</span></span>
        </a>
        <a class="legende-maps" href="${lienPoint(p)}" target="_blank" rel="noopener">${icone('lien')}<span>${L('Ouvrir dans Google Maps', 'Abrir en Google Maps')}</span></a>
      </li>`;
    }).join('');

    return `<h1>${L('Carte', 'Mapa')}</h1>
      <p class="chapeau">${L("Schéma des sites, à l'échelle, nord en haut. Touchez un repère pour ouvrir sa fiche.", 'Esquema de los sitios, a escala, norte arriba. Toque un marcador para abrir su ficha.')}</p>
      <div class="cles">${trip.jours.map((j) => `<span><i class="puce jour-${esc(j.id)}"></i>${esc(nomCourt(j))}</span>`).join('')}<span><i class="puce jour-hotel"></i>${L('Hôtel', 'Hotel')}</span></div>
      <svg class="plan" viewBox="0 0 ${LARG} ${H}" role="group" aria-label="${L("Schéma des sites et de l'hôtel", 'Esquema de los sitios y del hotel')}">
        <text class="nord" x="${LARG - 14}" y="20">N ↑</text>
        ${trajets}${reperes}
      </svg>
      <ul class="legende">${legende}</ul>`;
  }

  /* ---------- Sites : descriptifs des lieux visités ---------- */

  function ecranSites() {
    const cartes = [...lieux.values()].filter((p) => p.id !== trip.hotel.id).map((p) => {
      const n = numeros.get(p.id);
      const horaire = p.horaires ? `<p class="site-info"><strong>${L('Horaires', 'Horario')}</strong> ${esc(p.horaires)}</p>` : '';
      const tarif = p.tarif_indicatif_inr != null ? `<p class="site-info"><strong>${L('Tarif indicatif', 'Precio orientativo')}</strong> ${p.tarif_indicatif_inr} ${esc(trip.meta.devise)}</p>` : '';
      return `<article class="site jour-${esc(n.jour)}">
        ${photo(p)}
        <p class="surtitre">${esc(CATEGORIES[p.categorie] || '')} · ${esc(n.libelle)}</p>
        <h2>${esc(p.nom)}</h2>
        <p>${esc(p.description)}</p>
        ${horaire}${tarif}
        <div class="actions">
          <a class="bouton bouton-principal" href="#/lieu/${esc(p.id)}">${L('Voir la fiche', 'Ver la ficha')}</a>
          <a class="bouton" href="${lienItineraire(p)}" target="_blank" rel="noopener">${icone('itineraire')}${L('Itinéraire', 'Cómo llegar')}</a>
        </div>
      </article>`;
    }).join('');
    return `<h1>${L('Sites visités', 'Sitios visitados')}</h1>
      <p class="chapeau">${L('Les sept lieux du week-end, dans l\'ordre du programme.', 'Los siete lugares del fin de semana, en el orden del programa.')}</p>
      <div class="pile pile-sites">${cartes}</div>`;
  }

  /* ---------- 4.5 Pratique ---------- */

  function boutonsAppel() {
    const h = trip.hotel, u = trip.urgences;
    return `<div class="actions actions-pile">
      ${h?.telephone ? `<a class="bouton bouton-principal" href="${tel(h.telephone)}">${icone('appel')}<span>${L("Appeler l'hôtel", 'Llamar al hotel')}<small>${esc(h.telephone)}</small></span></a>` : ''}
      ${u?.numero ? `<a class="bouton bouton-urgence" href="${tel(u.numero)}">${icone('appel')}<span>${L('Urgences', 'Emergencias')}: ${esc(u.numero)}<small>${esc(u.libelle || '')}</small></span></a>` : ''}
    </div>`;
  }

  function ecranPratique() {
    const t = trip.transport, h = trip.hotel;
    const liste = (items) => `<ul class="liste">${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
    let theme = 'auto';
    try { theme = localStorage.getItem('theme') || 'auto'; } catch (e) { /* stockage indisponible */ }
    return `<h1>${L('Pratique', 'Práctico')}</h1>
      ${boutonsAppel()}

      <h2>${L('Hôtel', 'Hotel')}</h2>
      <p><strong>${esc(h.nom)}</strong><br>${esc(h.adresse)}</p>
      <div class="actions"><a class="bouton" href="${lienItineraire(h)}" target="_blank" rel="noopener">${icone('itineraire')}${L("Itinéraire vers l'hôtel", 'Cómo llegar al hotel')}</a></div>

      <h2>${L('Transport', 'Transporte')}</h2>
      <p class="encadre">${esc(t.recommandation)}</p>
      <ul class="options">${t.options.map((o) => `<li>
        <span class="option-tete"><strong>${esc(o.mode)}</strong><span class="avis avis-${esc(o.avis)}">${esc(AVIS[o.avis] || o.avis)}</span></span>
        <span>${esc(o.detail)}</span></li>`).join('')}</ul>

      <h3>${L('Temps de trajet', 'Tiempos de trayecto')}</h3>
      <ul class="trajets">${t.temps_de_trajet.map((x) => `<li><span>${esc(x.de)} → ${esc(x.a)}</span><strong>${esc(x.duree)}</strong></li>`).join('')}</ul>

      <h2>${L('Sécurité', 'Seguridad')}</h2>${liste(trip.securite)}
      <h2>${L('Conseils pratiques', 'Consejos prácticos')}</h2>${liste(trip.pratique)}
      <h2>${L('À confirmer', 'Por confirmar')}</h2><ul class="liste liste-confirmer">${trip.a_confirmer.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>

      <h2>Sources</h2>
      <p class="note">${L('Données vérifiées le', 'Datos verificados el')} ${dateLongue(trip.meta.donnees_verifiees_le)}. ${esc(trip.meta.remarque)}</p>
      <ul class="liens">${trip.sources.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener"><span>${esc(s.titre)}</span>${icone('lien')}</a></li>`).join('')}</ul>

      <h2>${L('Affichage', 'Pantalla')}</h2>
      <div class="segments" role="group" aria-label="${L('Thème', 'Tema')}">
        ${[['auto', L('Automatique', 'Automático')], ['clair', L('Clair', 'Claro')], ['sombre', L('Sombre', 'Oscuro')]].map(([v, l]) => `<button type="button" data-theme-choix="${v}" aria-pressed="${theme === v}">${l}</button>`).join('')}
      </div>
      <h2>${L('Mise à jour', 'Actualización')}</h2>
      <p class="note">${L("Recharge le planning, les photos et l'appli depuis internet.", 'Vuelve a descargar el programa, las fotos y la aplicación desde internet.')}</p>
      <div class="actions"><button type="button" class="bouton bouton-principal" id="forcer-maj">${L('Forcer la mise à jour', 'Forzar la actualización')}</button></div>
      <p class="note" id="etat-maj" role="status"></p>
      <h3>${L('Langue', 'Idioma')}</h3>
      <div class="segments" role="group" aria-label="${L('Langue', 'Idioma')}">
        ${[['fr', 'Français'], ['es', 'Español']].map(([v, l]) => `<button type="button" data-lang-choix="${v}" aria-pressed="${LANG === v}">${l}</button>`).join('')}
      </div>`;
  }

  /* ---------- Routeur ---------- */

  const TITRES = { aujourdhui: L("Aujourd'hui", 'Hoy'), jour: L('Journées', 'Jornadas'), sites: L('Sites', 'Sitios'), carte: L('Carte', 'Mapa'), pratique: L('Pratique', 'Práctico') };
  let origine = 'carte';
  let routeAffichee = null;

  function route() {
    const [, ecran = '', id = ''] = location.hash.replace(/^#/, '').split('/');
    return { ecran, id: decodeURIComponent(id) };
  }

  function afficher() {
    const { ecran, id } = route();
    if (ecran === 'sites' || ecran === 'carte') origine = ecran;
    let html, onglet;
    if (ecran === 'jour') { html = ecranJour(id); onglet = 'jour'; }
    else if (ecran === 'evenement') { html = ecranEvenement(id); onglet = 'jour'; }
    else if (ecran === 'sites') { html = ecranSites(); onglet = 'sites'; }
    else if (ecran === 'lieu') { html = ecranLieu(id); onglet = origine; }
    else if (ecran === 'carte') { html = ecranCarte(); onglet = 'carte'; }
    else if (ecran === 'pratique') { html = ecranPratique(); onglet = 'pratique'; }
    else { html = ecranAujourdhui(); onglet = 'aujourdhui'; }

    app.innerHTML = html;
    document.getElementById('entete-titre').textContent = TITRES[onglet];
    document.querySelectorAll('.onglets a').forEach((a) => {
      if (a.dataset.onglet === onglet) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    if (routeAffichee !== location.hash) {
      routeAffichee = location.hash;
      window.scrollTo(0, 0);
    }
  }

  /* ---------- Démarrage ---------- */

  function preparer() {
    lieux = new Map([[trip.hotel.id, { ...trip.hotel, categorie: 'hotel' }], ...trip.lieux.map((p) => [p.id, p])]);
    evenements = new Map();
    numeros = new Map([[trip.hotel.id, { signe: 'H', jour: 'hotel', libelle: L('Hôtel', 'Hotel') }]]);
    let n = 0;
    trip.jours.forEach((jour) => jour.evenements.forEach((ev) => {
      evenements.set(ev.id, { ev, jour });
      if (lieux.has(ev.lieu_id) && !numeros.has(ev.lieu_id)) numeros.set(ev.lieu_id, { signe: String(++n), jour: jour.id, libelle: jour.libelle });
    }));
    trip.lieux.forEach((p) => { if (!numeros.has(p.id)) numeros.set(p.id, { signe: String(++n), jour: 'hotel', libelle: L('Hors planning', 'Fuera del programa') }); });

    document.title = trip.meta.titre;
    traduireInterface();
    document.getElementById('appels-contenu').innerHTML = boutonsAppel();
  }

  /* Textes fixes de index.html. */
  function traduireInterface() {
    const noms = { aujourdhui: L("Aujourd'hui", 'Hoy'), jour: L('Journées', 'Jornadas'), sites: L('Sites', 'Sitios'), carte: L('Carte', 'Mapa'), pratique: L('Pratique', 'Práctico') };
    Object.entries(noms).forEach(([k, v]) => { document.querySelector(`.onglets [data-onglet="${k}"] span`).textContent = v; });
    document.querySelector('.onglets').setAttribute('aria-label', L('Navigation principale', 'Navegación principal'));
    document.querySelector('#ouvrir-appels span').textContent = L('Appels utiles', 'Llamadas útiles');
    document.querySelector('#bandeau-maj span').textContent = L('Le planning a été mis à jour.', 'El programa se ha actualizado.');
    document.getElementById('recharger').textContent = L('Recharger', 'Recargar');
    document.getElementById('appels-titre').textContent = L('Appels utiles', 'Llamadas útiles');
    document.querySelector('#appels form button').textContent = L('Fermer', 'Cerrar');
  }

  /* Vérifie d'abord que le réseau répond, pour ne jamais vider le cache hors ligne. */
  async function forcerMiseAJour(bouton) {
    const etat = document.getElementById('etat-maj');
    const dire = (txt) => { if (etat) etat.textContent = txt; };
    bouton.disabled = true;
    dire(L('Vérification du réseau…', 'Comprobando la conexión…'));
    try {
      const r = await fetch(`${L('data/trip.json', 'data/trip.es.json')}?maj=${Date.now()}`, { cache: 'no-store' });
      if (!r.ok) throw new Error(r.status);
    } catch (e) {
      dire(L("Pas de réseau : rien n'a été modifié, l'appli reste utilisable hors ligne.", 'Sin conexión: no se ha modificado nada, la aplicación sigue disponible sin conexión.'));
      bouton.disabled = false;
      return;
    }
    dire(L('Mise à jour en cours…', 'Actualizando…'));
    try {
      if ('serviceWorker' in navigator) (await navigator.serviceWorker.getRegistrations()).forEach((reg) => reg.unregister());
      if ('caches' in window) await Promise.all((await caches.keys()).map((k) => caches.delete(k)));
    } catch (e) { /* on recharge quand même */ }
    location.reload();
  }

  function appliquerTheme(choix) {
    try { if (choix === 'auto') localStorage.removeItem('theme'); else localStorage.setItem('theme', choix); } catch (e) { /* stockage indisponible */ }
    if (choix === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = choix;
  }

  async function demarrer() {
    try {
      trip = await (await fetch(L('data/trip.json', 'data/trip.es.json'))).json();
    } catch (e) {
      app.innerHTML = `<h1>${L('Planning indisponible', 'Programa no disponible')}</h1><p>${L("Le planning n'a pas pu être chargé. Ouvrez l'appli une première fois avec du réseau.", 'No se pudo cargar el programa. Abra la aplicación una primera vez con conexión.')}</p>`;
      return;
    }
    try { credits = await (await fetch(PHOTOS + 'credits.json')).json(); } catch (e) { /* photos facultatives */ }
    preparer();
    afficher();

    window.addEventListener('hashchange', afficher);
    // L'étape en cours change avec l'heure : on rafraîchit les écrans qui en dépendent.
    const rafraichir = () => { if (['', 'jour'].includes(route().ecran) && !document.hidden) afficher(); };
    setInterval(rafraichir, 30000);
    document.addEventListener('visibilitychange', rafraichir);

    app.addEventListener('click', (e) => {
      const b = e.target.closest('[data-theme-choix]');
      if (b) { appliquerTheme(b.dataset.themeChoix); afficher(); }
      const maj = e.target.closest('#forcer-maj');
      if (maj) forcerMiseAJour(maj);
      const l = e.target.closest('[data-lang-choix]');
      if (l) { try { localStorage.setItem('lang', l.dataset.langChoix); } catch (err) { /* stockage indisponible */ } location.reload(); }
    });
    document.getElementById('ouvrir-appels').addEventListener('click', () => document.getElementById('appels').showModal());
    document.getElementById('recharger').addEventListener('click', () => location.reload());

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (e) => {
        if (e.data?.type === 'planning-mis-a-jour') document.getElementById('bandeau-maj').hidden = false;
      });
      try {
        await navigator.serviceWorker.register('sw.js');
        await navigator.serviceWorker.ready;
        // Met en cache les photos présentes, pour qu'elles s'affichent aussi hors ligne.
        lieux.forEach((p) => fetch(`${PHOTOS}${encodeURIComponent(p.id)}.jpg`).catch(() => {}));
      } catch (e) { /* hors ligne sans service worker : l'appli reste utilisable en ligne */ }
    }
  }

  demarrer();
})();
