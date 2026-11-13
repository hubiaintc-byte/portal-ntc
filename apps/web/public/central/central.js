/* Central de Acesso NTC · v1.3 — renderização a partir de central.config.json
   Sem dependências externas. Modo de revisão: ?revisao=1 · Simular data: ?data=AAAA-MM-DD */
(function () {
  'use strict';
  var params = new URLSearchParams(location.search);
  var REVIEW = params.get('revisao') === '1' || location.hash === '#revisao';
  var ON_DOMAIN = /(^|\.)institutontc\.com\.br$/.test(location.hostname);
  var cfg, base, auditLog = [];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function resolve(u) {
    if (!u) return '';
    if (/^(https?:|mailto:|tel:)/.test(u)) return u;
    return ON_DOMAIN ? u : base.replace(/\/$/, '') + u;
  }
  function usable(o) { return o && o.status === 'verificado' && !!o.url; }
  function record(secao, texto, o) {
    auditLog.push({ secao: secao, texto: texto, url: o && o.url ? resolve(o.url) : '', status: o ? o.status : '—', pendencia: o && o.pendencia || '' });
  }
  /* Atributos de link: destino real, rastreamento e estado pendente */
  function attrs(secao, texto, o) {
    record(secao, texto, o);
    var t = ' data-track="' + esc(secao) + '" data-item="' + esc(texto) + '"';
    if (usable(o)) return 'href="' + esc(resolve(o.url)) + '"' + t;
    return 'aria-disabled="true" class-pending="1"' + t;
  }
  function a(cls, secao, texto, o, inner) {
    var at = attrs(secao, texto, o);
    if (at.indexOf('class-pending') > -1) {
      if (!REVIEW) return '';
      return '<span class="' + cls + ' is-pending" ' + at.replace(' class-pending="1"', '') + '>' + inner + '</span>';
    }
    return '<a class="' + cls + '" ' + at + '>' + inner + '</a>';
  }
  function pendBadge(o) { return (!usable(o) && REVIEW) ? '<span class="badge-pend">Destino pendente</span>' : ''; }

  /* ---------- 1 · Cabeçalho ---------- */
  function renderHero() {
    var h = cfg.cabecalho;
    var sc = (h.atalhos || []).filter(function (s) {
      return (cfg.secoes || []).some(function (x) { return x.id === s.ancora && x.ativo; });
    }).map(function (s) {
      return '<li><a href="#' + esc(s.ancora) + '" data-track="atalho" data-item="' + esc(s.texto) + '">' + esc(s.texto) + '</a></li>';
    });
    document.getElementById('hero-body').innerHTML =
      '<p class="hero__label">' + esc(h.rotulo) + '</p>' +
      '<h1>' + esc(h.titulo) + '</h1>' +
      '<p class="hero__slogan">' + esc(h.slogan) + '</p>' +
      '<p class="hero__lead">' + esc(h.apoio) + '</p>' +
      (sc.length ? '<nav aria-label="Atalhos da Central"><ul class="shortcuts" style="grid-template-columns:repeat(' + sc.length + ',minmax(0,1fr))">' + sc.join('') + '</ul></nav>' : '');
  }

  /* ---------- Seções ---------- */
  function head(s) {
    return '<p class="eyebrow"><span class="n">' + esc(s.numero) + '</span><span aria-hidden="true">·</span><span>' + esc(s.rotulo) + '</span></p>' +
      '<h2 class="h2" id="' + esc(s.id) + '-titulo">' + esc(s.titulo) + '</h2>' + (s.apoio ? '<p class="lead">' + esc(s.apoio) + '</p>' : '');
  }
  function rows(s) {
    var n = 0;
    var li = (s.itens || []).map(function (it) {
      var ok = usable(it);
      if (!ok && !REVIEW) { record(s.id, it.titulo, it); return ''; }
      n++;
      var inner = '<span class="row__n" aria-hidden="true">' + String(n).padStart(2, '0') + '</span>' +
        '<span><span class="row__t">' + esc(it.titulo) + pendBadge(it) + '</span>' + (it.descricao ? '<span class="row__d">' + esc(it.descricao) + '</span>' : '') + '</span>' +
        '<span class="row__a" aria-hidden="true">→</span>';
      return '<li>' + a('row', s.id, it.titulo, it, inner) + '</li>';
    }).join('');
    return '<ul class="rows">' + li + '</ul>';
  }
  var R = {
    lista: function (s) {
      var c = s.chamada;
      var cta = c ? '<div class="section__cta">' + a('btn btn--primary', s.id, c.texto, c, esc(c.texto) + ' <span class="arr" aria-hidden="true">→</span>') + '</div>' : '';
      return '<div class="wrap split"><div>' + head(s) + cta + '</div>' + rows(s) + '</div>';
    },
    verticais: function (s) {
      var v = s.verticais.map(function (x) {
        var inner = '<span class="vcard__name">' + esc(x.nome) + '</span><span class="vcard__line">' + esc(x.linha) + '</span>' +
          '<span class="vcard__desc">' + esc(x.descricao) + '</span><span class="vcard__go">Conheça a área <span aria-hidden="true">→</span></span>';
        var h = a('vcard', s.id, x.nome, x, inner);
        return h.replace('class="vcard', 'data-vert="' + esc(x.vertical) + '" class="vcard');
      }).join('');
      var m = (s.modelos || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
      var c = s.chamada, cta = '';
      if (c) {
        cta = '<div class="cta-panel"><p class="cta-panel__t">' + esc(c.titulo) + '</p><p class="cta-panel__p">' + esc(c.texto) + '</p><div class="cta-panel__row">' +
          a('btn btn--light', s.id, c.botao, c, esc(c.botao) + ' <span class="arr" aria-hidden="true">→</span>') +
          (c.link_secundario ? a('tlink', s.id, c.link_secundario.texto, c.link_secundario, esc(c.link_secundario.texto) + ' <span aria-hidden="true">→</span>') : '') +
          '</div></div>';
      }
      return '<div class="wrap">' + head(s) + '<div class="verts">' + v + '</div>' +
        (m ? '<ul class="models" aria-label="Modelos de contratação">' + m + '</ul>' : '') + cta + '</div>';
    },
    plataforma: function (s) {
      return '<div class="wrap">' + head(s) + '<div class="panel-dark__actions">' +
        a('btn btn--light', s.id, s.botao.texto, s.botao, esc(s.botao.texto) + ' <span class="arr" aria-hidden="true">→</span>') +
        (s.link_secundario ? a('btn btn--ghost-dark', s.id, s.link_secundario.texto, s.link_secundario, esc(s.link_secundario.texto)) : '') +
        '</div></div>';
    },
    institucional: function (s) {
      var st = (s.indicadores || []).map(function (x) {
        return '<div class="stat"><span class="stat__l1">' + (x.rotulo === 'Desde' ? 'Desde' : '&nbsp;') + '</span>' +
          '<span class="stat__v">' + esc(x.valor) + (x.sufixo ? '<sup>' + esc(x.sufixo) + '</sup>' : '') + '</span>' +
          (x.rotulo !== 'Desde' ? '<span class="stat__l2">' + esc(x.rotulo) + '</span>' : '<span class="stat__l2">Brasília – DF</span>') + '</div>';
      }).join('');
      var l = (s.itens || []).map(function (it) {
        return a('tlink', s.id, it.titulo, it, esc(it.titulo) + pendBadge(it) + ' <span aria-hidden="true">→</span>');
      }).join('');
      return '<div class="wrap">' + head(s) + '<div class="stats" role="list">' + st.replace(/<div class="stat">/g, '<div class="stat" role="listitem">') + '</div>' +
        (s.fonte ? '<p class="source">' + esc(s.fonte) + '</p>' : '') + '<div class="links-inline">' + l + '</div></div>';
    },
    contato: function (s) {
      var li = (s.canais || []).map(function (c) {
        var inner = '<span class="channel__l">' + esc(c.rotulo) + '</span><span class="channel__v">' + esc(c.valor) + pendBadge(c) + '</span><span class="channel__a" aria-hidden="true">→</span>';
        var h = a('channel', s.id, c.rotulo + ' ' + c.valor, c, inner);
        return h ? '<li>' + h + '</li>' : '';
      }).join('');
      return '<div class="wrap split"><div>' + head(s) + '</div><ul class="channels">' + li + '</ul></div>';
    }
  };
  function renderSections() {
    var out = (cfg.secoes || []).filter(function (s) { return s.ativo; }).map(function (s) {
      var cls = 'section' + (s.tipo === 'plataforma' ? ' panel-dark' : '') + (s.tipo === 'verticais' ? ' section--tint' : '');
      return '<section class="' + cls + '" id="' + esc(s.id) + '" aria-labelledby="' + esc(s.id) + '-titulo">' + (R[s.tipo] ? R[s.tipo](s) : '') + '</section>';
    }).join('');
    document.getElementById('secoes').innerHTML = out;
  }

  /* ---------- Rodapé ---------- */
  function renderFooter() {
    var r = cfg.rodape;
    var links = [r.site].concat(r.links || []).map(function (l) { return a('', 'rodape', l.texto, l, esc(l.texto)); }).join('');
    document.getElementById('rodape-conteudo').innerHTML =
      '<p class="footer__sig">' + esc(r.assinatura) + '</p>' +
      (r.slogan ? '<p class="footer__slogan">' + esc(r.slogan) + '</p>' : '') +
      '<p class="footer__data"><strong>' + esc(r.razao_social) + '</strong><br>' + esc(r.cnpj) + '<br>' + esc(r.endereco) + '</p>' +
      '<nav aria-label="Links institucionais" class="footer__links">' + links + '</nav>';
  }

  /* ---------- Rastreamento (sem dependência externa) ---------- */
  function track(name, data) {
    try { if (typeof window.va === 'function') window.va('event', { name: name, data: data }); } catch (e) {}
    try { if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: name, central: data }); } catch (e) {}
    try { document.dispatchEvent(new CustomEvent('ntc:central', { detail: { name: name, data: data } })); } catch (e) {}
    if (REVIEW && window.console) console.info('[Central NTC]', name, data);
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-track]');
    if (!el) return;
    if (el.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
    track('central_clique', { secao: el.getAttribute('data-track'), item: el.getAttribute('data-item'), destino: el.getAttribute('href') || '' });
  });

  /* ---------- Painel de revisão ---------- */
  function renderReview() {
    if (!REVIEW) return;
    var rowsH = auditLog.map(function (x) {
      return '<tr><td>' + esc(x.secao) + '</td><td>' + esc(x.texto) + '</td><td class="' + (x.status === 'verificado' ? 'ok' : 'pend') + '">' + esc(x.status) + '</td><td>' +
        (x.url ? '<a href="' + esc(x.url) + '">' + esc(x.url) + '</a>' : esc(x.pendencia || '—')) + '</td></tr>';
    }).join('');
    var nPend = auditLog.filter(function (x) { return x.status !== 'verificado'; }).length;
    var el = document.createElement('section');
    el.className = 'review'; el.setAttribute('aria-label', 'Painel de revisão');
    el.innerHTML = '<div class="wrap"><h2>Painel de revisão · Central de Acesso v' + esc(cfg.versao) + '</h2>' +
      '<p>' + auditLog.length + ' destinos configurados · <strong>' + nPend + ' pendente(s)</strong>, ocultos fora do modo de revisão.</p>' +
      '<table><thead><tr><th>Seção</th><th>Item</th><th>Status</th><th>Destino / pendência</th></tr></thead><tbody>' + rowsH + '</tbody></table></div>';
    var old = document.querySelector('.review'); if (old) old.remove();
    document.body.appendChild(el);
  }

  function renderAll() {
    auditLog = [];
    renderHero();
    renderSections();
    renderFooter();
    renderReview();
  }
  function boot(c) {
    cfg = c; base = c.base_url || '';
    renderAll();
    window.addEventListener('hashchange', function () {
      var r = location.hash === '#revisao';
      if (r !== REVIEW) { REVIEW = r; renderAll(); if (!r) { var o = document.querySelector('.review'); if (o) o.remove(); } }
    });
    document.documentElement.classList.add('is-ready');
    if (location.hash && location.hash !== '#revisao') { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
  }
  var inline = document.getElementById('central-config');
  if (inline && inline.textContent.trim()) { boot(JSON.parse(inline.textContent)); }
  else {
    fetch(window.CENTRAL_CONFIG_URL || 'central.config.json').then(function (r) { return r.json(); }).then(boot)
      .catch(function () { var n = document.getElementById('fallback'); if (n) n.hidden = false; });
  }
})();
