/**
 * GEOPORTAL DE CRAÍBAS - AL | ANÁLISE HISTÓRICA E TERRITORIAL
 * Script Principal da Aplicação
 * Cores Pastéis: Verde Pastel, Laranja Pastel e Branco
 */

document.addEventListener('DOMContentLoaded', () => {
  // Estado Global da Aplicação
  const state = {
    currentTab: 'timeline',
    timelineIndex: 10, // Inicia no Limite Oficial Atual (2023)
    isPlaying: false,
    playInterval: null,
    playSpeed: 2500,
    layers: {},
    activeLayerKeys: new Set(),
    activeBasemap: 'esriGray',
    measureMode: null, // 'distance', 'area' ou null
    measurePoints: [],
    measureLayer: null,
    neighborLayer: null,
    alagoasLayer: null
  };

  // Coordenadas Centrais de Craíbas - AL
  const CRAIBAS_CENTER = [-9.618, -36.768];
  const DEFAULT_ZOOM = 11;

  // 1. INICIALIZAÇÃO DO MAPA LEAFLET
  const map = L.map('map', {
    center: CRAIBAS_CENTER,
    zoom: DEFAULT_ZOOM,
    zoomControl: false
  });

  // Zoom control no canto superior direito com espaçamento adequado
  L.control.zoom({ position: 'topright' }).addTo(map);

  // Escala métrica gráfica no canto inferior esquerdo
  L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

  // 2. MAPAS-BASE (BASEMAPS 100% GRATUITOS E SEM MARCA D'ÁGUA)
  const basemaps = {
    esriGray: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri, HERE, Garmin, &copy; OpenStreetMap contributors',
      maxZoom: 16
    }),
    osm: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }),
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri &mdash; Maxar, Earthstar Geographics',
      maxZoom: 19
    }),
    topo: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri &mdash; National Geographic, USGS',
      maxZoom: 18
    })
  };

  // Adiciona basemap padrão (Esri Gray Canvas - Tons pastéis neutros)
  basemaps.esriGray.addTo(map);

  // Grupo de medições
  state.measureLayer = L.featureGroup().addTo(map);

  // Grupo de camadas históricas
  const craibasLayerGroup = L.featureGroup().addTo(map);

  // 3. CARREGAMENTO DAS CAMADAS HISTÓRICAS DE CRAÍBAS
  if (window.CRAIBAS_LAYERS && window.CRAIBAS_LAYERS.length > 0) {
    window.CRAIBAS_LAYERS.forEach((layerDef, index) => {
      const isOfficial = layerDef.id === 'layer_2023_atual';
      const isPrefeitura = layerDef.id === 'layer_prefeitura_estimado';
      const isAreaExterna = layerDef.id === 'layer_area_externa';

      // Criação da camada GeoJSON Leaflet
      const geoLayer = L.geoJSON(layerDef.geometry, {
        style: () => {
          let dashArray = null;
          let weight = 2.5;
          let fillOpacity = 0.35;
          let color = layerDef.border_color || '#2E7D32';
          let fillColor = layerDef.color || '#81C784';

          if (isPrefeitura) {
            dashArray = '6, 6';
            weight = 3;
            fillOpacity = 0.25;
            color = '#DE7534';
            fillColor = '#F7A873';
          } else if (isAreaExterna) {
            dashArray = '4, 4';
            weight = 3;
            fillOpacity = 0.65;
            color = '#C62828';
            fillColor = '#FF8A80';
          } else if (isOfficial) {
            weight = 3.5;
            fillOpacity = 0.4;
            color = '#2E7D32';
            fillColor = '#7BB886';
          }

          return {
            color: color,
            weight: weight,
            opacity: 0.95,
            fillColor: fillColor,
            fillOpacity: fillOpacity,
            dashArray: dashArray
          };
        },
        onEachFeature: (feature, layer) => {
          // Eventos de destaque ao passar o mouse
          layer.on({
            mouseover: (e) => {
              const l = e.target;
              l.setStyle({
                weight: isAreaExterna ? 4 : 4,
                fillOpacity: isAreaExterna ? 0.8 : 0.6
              });
              l.bringToFront();
            },
            mouseout: (e) => {
              geoLayer.resetStyle(e.target);
            },
            click: (e) => {
              L.DomEvent.stopPropagation(e);
            }
          });

          // Popup Didático e Técnico
          const popupHtml = `
            <div class="popup-container">
              <div class="popup-header" style="background: linear-gradient(135deg, ${layerDef.border_color || '#438E52'}, ${layerDef.color || '#7BB886'});">
                <span class="popup-tag">${layerDef.badge || 'Território Histórico'}</span>
                <h4>${layerDef.title}</h4>
              </div>
              <div class="popup-body">
                <p style="font-size: 11.5px; line-height: 1.45; color: #334155; margin-bottom: 6px;">
                  ${layerDef.summary}
                </p>
                <div class="popup-metric-row">
                  <span>Município / Entidade:</span>
                  <strong>${layerDef.municipality_name}</strong>
                </div>
                <div class="popup-metric-row">
                  <span>Área Territorial:</span>
                  <strong>${layerDef.metrics.area_km2.toLocaleString('pt-BR')} km²</strong>
                </div>
                <div class="popup-metric-row">
                  <span>Perímetro:</span>
                  <strong>${layerDef.metrics.perimeter_km.toLocaleString('pt-BR')} km</strong>
                </div>
                <div class="popup-metric-row">
                  <span>Período Histórico:</span>
                  <strong>${layerDef.period_label}</strong>
                </div>
              </div>
              <div class="popup-footer">
                ${layerDef.era_name} &bull; Georreferenciado SIRGAS 2000
              </div>
            </div>
          `;
          layer.bindPopup(popupHtml, { maxWidth: 320 });
        }
      });

      state.layers[layerDef.id] = {
        def: layerDef,
        geoLayer: geoLayer,
        opacity: 0.4
      };
    });
  }

  // 4. CARREGAMENTO DOS VIZINHOS E ESTADO DE ALAGOAS
  if (window.VIZINHOS_MALHA) {
    state.neighborLayer = L.geoJSON(window.VIZINHOS_MALHA, {
      style: (feat) => {
        const isCraibas = feat.properties.NM_MUN.toLowerCase().includes('cra');
        return {
          color: isCraibas ? '#2E7D32' : '#94A3B8',
          weight: isCraibas ? 2 : 1.2,
          fillColor: isCraibas ? '#7BB886' : '#E2E8F0',
          fillOpacity: isCraibas ? 0.25 : 0.15,
          dashArray: isCraibas ? null : '2, 3'
        };
      },
      onEachFeature: (feat, layer) => {
        const nm = feat.properties.NM_MUN;
        const area = feat.properties.AREA_KM2 ? `${feat.properties.AREA_KM2} km²` : 'Dado IBGE';
        layer.bindTooltip(`<strong>${nm}</strong><br><span style="font-size:10px;">Área: ${area}</span>`, {
          sticky: true,
          direction: 'top'
        });
      }
    });
  }

  if (window.ALAGOAS_MALHA) {
    state.alagoasLayer = L.geoJSON(window.ALAGOAS_MALHA, {
      style: (feat) => {
        const isCraibas = feat.properties.NM_MUN.toLowerCase().includes('cra');
        return {
          color: isCraibas ? '#2E7D32' : '#CBD5E1',
          weight: isCraibas ? 2.5 : 0.8,
          fillColor: isCraibas ? '#7BB886' : '#F1F5F9',
          fillOpacity: isCraibas ? 0.35 : 0.1
        };
      },
      onEachFeature: (feat, layer) => {
        const nm = feat.properties.NM_MUN;
        const reg = feat.properties.NM_RGI || 'Alagoas';
        layer.bindTooltip(`<strong>${nm}</strong><br><span style="font-size:10px;">Região Imediata: ${reg}</span>`, {
          sticky: true
        });
      }
    });
  }

  // 5. ATIVAÇÃO INICIAL DO MODO TIMELINE
  function updateTimelineView(index) {
    state.timelineIndex = index;
    const layerDefs = window.CRAIBAS_LAYERS;
    if (!layerDefs || !layerDefs[index]) return;

    const currentDef = layerDefs[index];

    // Remove todas as camadas históricas ativas
    craibasLayerGroup.clearLayers();

    // Se estiver em modo timeline, exibe a camada selecionada
    const currentGeo = state.layers[currentDef.id].geoLayer;
    craibasLayerGroup.addLayer(currentGeo);

    // Ajusta o Slider
    const slider = document.getElementById('timelineSlider');
    if (slider) slider.value = index;

    // Atualiza as marcas da timeline
    document.querySelectorAll('.timeline-tick').forEach((tick, i) => {
      tick.classList.toggle('active', i === index);
    });

    // Atualiza badges do cabeçalho da timeline
    const epochBadge = document.getElementById('timelineEpochBadge');
    if (epochBadge) {
      epochBadge.innerText = `${currentDef.period_label} — ${currentDef.era_name}`;
    }

    const detailEntity = document.getElementById('timelineDetailEntity');
    const detailArea = document.getElementById('timelineDetailArea');
    const detailPerim = document.getElementById('timelineDetailPerim');
    if (detailEntity) detailEntity.innerText = currentDef.municipality_name;
    if (detailArea) detailArea.innerText = `${currentDef.metrics.area_km2.toLocaleString('pt-BR')} km²`;
    if (detailPerim) detailPerim.innerText = `${currentDef.metrics.perimeter_km.toLocaleString('pt-BR')} km`;

    // Atualiza painel didático na Sidebar
    const panelTitle = document.getElementById('timelinePanelTitle');
    const panelSummary = document.getElementById('timelinePanelSummary');
    const panelContext = document.getElementById('timelinePanelContext');
    const panelArea = document.getElementById('timelinePanelArea');
    const panelPerimeter = document.getElementById('timelinePanelPerimeter');
    const panelEntity = document.getElementById('timelinePanelEntity');
    const panelBadge = document.getElementById('timelinePanelBadge');

    if (panelTitle) panelTitle.innerText = currentDef.title;
    if (panelSummary) panelSummary.innerText = currentDef.summary;
    if (panelContext) panelContext.innerText = currentDef.historical_context;
    if (panelArea) panelArea.innerText = `${currentDef.metrics.area_km2.toLocaleString('pt-BR')} km²`;
    if (panelPerimeter) panelPerimeter.innerText = `${currentDef.metrics.perimeter_km.toLocaleString('pt-BR')} km`;
    if (panelEntity) panelEntity.innerText = currentDef.municipality_name;
    if (panelBadge) panelBadge.innerText = currentDef.badge;

    // Suave ajuste de zoom para enquadrar a geometria
    const b = currentDef.metrics.bbox;
    if (b) {
      map.flyToBounds([[b[1], b[0]], [b[3], b[2]]], { padding: [40, 40], duration: 0.8 });
    }
  }

  // 6. CONTROLE DO PLAYER DE REPRODUÇÃO TEMPORAL
  const btnPlay = document.getElementById('btnTimelinePlay');
  const btnPrev = document.getElementById('btnTimelinePrev');
  const btnNext = document.getElementById('btnTimelineNext');
  const timelineSlider = document.getElementById('timelineSlider');

  function togglePlay() {
    if (state.isPlaying) {
      clearInterval(state.playInterval);
      state.isPlaying = false;
      if (btnPlay) {
        btnPlay.innerHTML = `
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        `;
        btnPlay.title = 'Reproduzir Linha do Tempo';
      }
    } else {
      state.isPlaying = true;
      if (btnPlay) {
        btnPlay.innerHTML = `
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        `;
        btnPlay.title = 'Pausar';
      }
      state.playInterval = setInterval(() => {
        let nextIndex = state.timelineIndex + 1;
        if (nextIndex >= 11) { // Para nos limites de Craíbas
          nextIndex = 0;
        }
        updateTimelineView(nextIndex);
      }, state.playSpeed);
    }
  }

  if (btnPlay) btnPlay.addEventListener('click', togglePlay);

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      const prev = Math.max(0, state.timelineIndex - 1);
      updateTimelineView(prev);
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      const next = Math.min(window.CRAIBAS_LAYERS.length - 1, state.timelineIndex + 1);
      updateTimelineView(next);
    });
  }

  if (timelineSlider) {
    timelineSlider.addEventListener('input', (e) => {
      updateTimelineView(parseInt(e.target.value));
    });
  }

  // Cliques nos marcadores (ticks)
  document.querySelectorAll('.timeline-tick').forEach((tick) => {
    tick.addEventListener('click', () => {
      const idx = parseInt(tick.getAttribute('data-index'));
      updateTimelineView(idx);
    });
  });

  // 7. MODO COMPARADOR (IBGE OFICIAL vs PREFEITURA)
  function setupComparatorMode() {
    craibasLayerGroup.clearLayers();

    // Ativa as 3 camadas simultaneamente: Oficial IBGE 2023, Limite Estimado e Área Externa
    const lOfficial = state.layers['layer_2023_atual']?.geoLayer;
    const lPrefeitura = state.layers['layer_prefeitura_estimado']?.geoLayer;
    const lExterna = state.layers['layer_area_externa']?.geoLayer;

    if (lOfficial) craibasLayerGroup.addLayer(lOfficial);
    if (lPrefeitura) craibasLayerGroup.addLayer(lPrefeitura);
    if (lExterna) craibasLayerGroup.addLayer(lExterna);

    // Ajusta o enquadramento no limite de Craíbas
    map.flyTo(CRAIBAS_CENTER, 12, { duration: 0.8 });
  }

  // Botão Focar na Faixa de Conflito (2,24 km²)
  const btnZoomConflict = document.getElementById('btnZoomConflict');
  if (btnZoomConflict) {
    btnZoomConflict.addEventListener('click', () => {
      const areaDef = window.CRAIBAS_LAYERS.find(l => l.id === 'layer_area_externa');
      if (areaDef && areaDef.metrics.bbox) {
        const b = areaDef.metrics.bbox;
        map.flyToBounds([[b[1], b[0]], [b[3], b[2]]], { maxZoom: 15, padding: [60, 60], duration: 1.2 });
        // Abre o popup
        setTimeout(() => {
          state.layers['layer_area_externa']?.geoLayer.openPopup();
        }, 1200);
      }
    });
  }

  // 8. MODO MALHA REGIONAL E ALAGOAS
  function setupRegionalMode() {
    craibasLayerGroup.clearLayers();

    // Exibe Limite Oficial Vigente de Craíbas
    if (state.layers['layer_2023_atual']) {
      craibasLayerGroup.addLayer(state.layers['layer_2023_atual'].geoLayer);
    }

    // Exibe malha de vizinhos por padrão
    if (state.neighborLayer) {
      craibasLayerGroup.addLayer(state.neighborLayer);
    }

    map.flyTo(CRAIBAS_CENTER, 10, { duration: 0.8 });
  }

  // Toggle para Todos os 102 Municípios de Alagoas
  const toggleAlagoasCheck = document.getElementById('toggleAllAlagoas');
  if (toggleAlagoasCheck) {
    toggleAlagoasCheck.addEventListener('change', (e) => {
      if (e.target.checked) {
        if (state.neighborLayer) craibasLayerGroup.removeLayer(state.neighborLayer);
        if (state.alagoasLayer) craibasLayerGroup.addLayer(state.alagoasLayer);
        map.flyTo([-9.65, -36.6], 8, { duration: 1 });
      } else {
        if (state.alagoasLayer) craibasLayerGroup.removeLayer(state.alagoasLayer);
        if (state.neighborLayer) craibasLayerGroup.addLayer(state.neighborLayer);
        map.flyTo(CRAIBAS_CENTER, 10, { duration: 0.8 });
      }
    });
  }

  // 9. CONTROLE DAS ABAS PRINCIPAIS DA SIDEBAR
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.sidebar-tab-pane');
  const timelinePlayer = document.getElementById('timelinePlayerContainer');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      state.currentTab = targetTab;

      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(`pane-${targetTab}`);
      if (targetPane) targetPane.classList.add('active');

      // Comportamentos específicos para cada aba
      if (targetTab === 'timeline') {
        if (timelinePlayer) timelinePlayer.classList.remove('hidden');
        updateTimelineView(state.timelineIndex);
      } else {
        if (timelinePlayer) timelinePlayer.classList.add('hidden');
        if (state.isPlaying) togglePlay(); // Pausa o player se sair da timeline
      }

      if (targetTab === 'compare') {
        setupComparatorMode();
      } else if (targetTab === 'regional') {
        setupRegionalMode();
      } else if (targetTab === 'layers') {
        // Exibe todas as camadas marcadas no layer tree
        refreshLayerTree();
      }
    });
  });

  // 10. LAYER TREE & CONTROLE DE OPACIDADE
  function buildLayerTreeList() {
    const container = document.getElementById('layerTreeContainer');
    if (!container || !window.CRAIBAS_LAYERS) return;

    container.innerHTML = '';

    window.CRAIBAS_LAYERS.forEach(layerDef => {
      const isOfficial = layerDef.id === 'layer_2023_atual';
      const isPrefeitura = layerDef.id === 'layer_prefeitura_estimado';
      const isAreaExterna = layerDef.id === 'layer_area_externa';

      const item = document.createElement('div');
      item.className = 'layer-item';

      item.innerHTML = `
        <div class="layer-item-top">
          <label class="layer-label-group">
            <input type="checkbox" id="chk_${layerDef.id}" ${isOfficial || isPrefeitura || isAreaExterna ? 'checked' : ''}>
            <span class="layer-color-indicator ${isPrefeitura ? 'dashed' : ''}" style="background-color: ${layerDef.color}; border-color: ${layerDef.border_color};"></span>
            <span class="layer-title">${layerDef.period_label} &bull; ${layerDef.title.split('—')[0]}</span>
          </label>
          <span class="layer-area-tag">${layerDef.metrics.area_km2.toLocaleString('pt-BR')} km²</span>
        </div>
        <div class="layer-opacity-row">
          <span>Opacidade:</span>
          <input type="range" id="opac_${layerDef.id}" min="0.05" max="1" step="0.05" value="${isAreaExterna ? '0.65' : '0.35'}">
          <span id="opac_val_${layerDef.id}">${isAreaExterna ? '65%' : '35%'}</span>
        </div>
      `;

      // Evento checkbox
      const chk = item.querySelector(`#chk_${layerDef.id}`);
      chk.addEventListener('change', (e) => {
        const geo = state.layers[layerDef.id]?.geoLayer;
        if (!geo) return;
        if (e.target.checked) {
          craibasLayerGroup.addLayer(geo);
        } else {
          craibasLayerGroup.removeLayer(geo);
        }
      });

      // Evento slider de opacidade
      const opac = item.querySelector(`#opac_${layerDef.id}`);
      const opacLabel = item.querySelector(`#opac_val_${layerDef.id}`);
      opac.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        opacLabel.innerText = `${Math.round(val * 100)}%`;
        const geo = state.layers[layerDef.id]?.geoLayer;
        if (geo) {
          geo.setStyle({ fillOpacity: val });
        }
      });

      container.appendChild(item);
    });
  }

  function refreshLayerTree() {
    craibasLayerGroup.clearLayers();
    window.CRAIBAS_LAYERS.forEach(layerDef => {
      const chk = document.getElementById(`chk_${layerDef.id}`);
      const geo = state.layers[layerDef.id]?.geoLayer;
      if (chk && chk.checked && geo) {
        craibasLayerGroup.addLayer(geo);
      }
    });
  }

  buildLayerTreeList();

  // 11. BASEMAP SWITCHER
  const basemapBtn = document.getElementById('btnBasemapDropdown');
  const basemapMenu = document.getElementById('basemapMenu');

  if (basemapBtn && basemapMenu) {
    basemapBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      basemapMenu.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      basemapMenu.classList.remove('show');
    });

    document.querySelectorAll('.basemap-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const baseKey = opt.getAttribute('data-basemap');
        if (basemaps[baseKey]) {
          // Remove basemaps atuais
          Object.values(basemaps).forEach(b => map.removeLayer(b));
          // Adiciona o novo
          basemaps[baseKey].addTo(map);
          // Move camadas de dados para frente
          craibasLayerGroup.bringToFront();
          state.measureLayer.bringToFront();

          document.querySelectorAll('.basemap-option').forEach(o => o.classList.remove('active'));
          opt.classList.add('active');
          basemapMenu.classList.remove('show');
        }
      });
    });
  }

  // 12. BARRA DE COORDENADAS E RASTREIO DO MOUSE
  const coordsFooter = document.getElementById('mapCoordsFooter');
  map.on('mousemove', (e) => {
    if (coordsFooter) {
      coordsFooter.innerHTML = `<strong>Lat:</strong> ${e.latlng.lat.toFixed(5)} | <strong>Lon:</strong> ${e.latlng.lng.toFixed(5)} | Zoom: ${map.getZoom()} | SIRGAS 2000`;
    }
  });

  // 13. FERRAMENTA DE MEDIÇÃO INTERATIVA (DISTÂNCIA E ÁREA)
  const btnMeasureDist = document.getElementById('btnMeasureDistance');
  const btnMeasureArea = document.getElementById('btnMeasureArea');
  const btnClearMeasure = document.getElementById('btnClearMeasure');

  function resetMeasurement() {
    state.measureMode = null;
    state.measurePoints = [];
    state.measureLayer.clearLayers();
    if (btnMeasureDist) btnMeasureDist.classList.remove('active');
    if (btnMeasureArea) btnMeasureArea.classList.remove('active');
    map.getContainer().style.cursor = '';
  }

  if (btnClearMeasure) {
    btnClearMeasure.addEventListener('click', resetMeasurement);
  }

  function startMeasure(mode) {
    if (state.measureMode === mode) {
      resetMeasurement();
      return;
    }
    resetMeasurement();
    state.measureMode = mode;
    map.getContainer().style.cursor = 'crosshair';

    if (mode === 'distance' && btnMeasureDist) btnMeasureDist.classList.add('active');
    if (mode === 'area' && btnMeasureArea) btnMeasureArea.classList.add('active');
  }

  if (btnMeasureDist) {
    btnMeasureDist.addEventListener('click', () => startMeasure('distance'));
  }

  if (btnMeasureArea) {
    btnMeasureArea.addEventListener('click', () => startMeasure('area'));
  }

  map.on('click', (e) => {
    if (!state.measureMode) return;

    state.measurePoints.push(e.latlng);
    const pts = state.measurePoints;

    // Marcador no ponto clicado
    L.circleMarker(e.latlng, {
      radius: 5,
      color: '#DE7534',
      fillColor: '#FFFFFF',
      fillOpacity: 1,
      weight: 2
    }).addTo(state.measureLayer);

    if (state.measureMode === 'distance') {
      if (pts.length > 1) {
        // Linha com cálculo de distância acumulada
        const polyline = L.polyline(pts, {
          color: '#DE7534',
          weight: 3,
          dashArray: '5, 5'
        }).addTo(state.measureLayer);

        let totalMeters = 0;
        for (let i = 0; i < pts.length - 1; i++) {
          totalMeters += pts[i].distanceTo(pts[i + 1]);
        }

        const distStr = totalMeters >= 1000 ? `${(totalMeters / 1000).toFixed(2)} km` : `${Math.round(totalMeters)} m`;
        L.popup()
          .setLatLng(e.latlng)
          .setContent(`<div style="font-weight:700; color:#B85012; font-size:12px;">Distância total: ${distStr}</div>`)
          .openOn(map);
      }
    } else if (state.measureMode === 'area') {
      if (pts.length >= 3) {
        state.measureLayer.eachLayer(l => {
          if (l instanceof L.Polygon) state.measureLayer.removeLayer(l);
        });

        const polygon = L.polygon(pts, {
          color: '#438E52',
          fillColor: '#7BB886',
          fillOpacity: 0.35,
          weight: 2
        }).addTo(state.measureLayer);

        // Cálculo aproximado de área
        let areaM2 = 0;
        const rad = Math.PI / 180;
        const r = 6378137;
        for (let i = 0; i < pts.length; i++) {
          const p1 = pts[i];
          const p2 = pts[(i + 1) % pts.length];
          const lat1 = p1.lat * rad;
          const lat2 = p2.lat * rad;
          const dlon = (p2.lng - p1.lng) * rad;
          areaM2 += dlon * (2 + Math.sin(lat1) + Math.sin(lat2));
        }
        areaM2 = Math.abs(areaM2 * r * r / 2.0);

        const km2 = (areaM2 / 1e6).toFixed(3);
        const ha = (areaM2 / 10000).toFixed(1);

        L.popup()
          .setLatLng(e.latlng)
          .setContent(`<div style="font-weight:700; color:#2E6B39; font-size:12px;">Área Medida:<br><strong>${km2} km²</strong> (${ha} hectares)</div>`)
          .openOn(map);
      }
    }
  });

  // 14. BOTÃO RESETAR ZOOM / CENTRALIZAR EM CRAÍBAS
  const btnFitCraibas = document.getElementById('btnFitCraibas');
  if (btnFitCraibas) {
    btnFitCraibas.addEventListener('click', () => {
      map.flyTo(CRAIBAS_CENTER, DEFAULT_ZOOM, { duration: 0.8 });
    });
  }

  // 15. BUSCA DE LOCALIDADES (PESQUISA RÁPIDA)
  const searchInput = document.getElementById('mapSearchInput');
  const searchBtn = document.getElementById('mapSearchBtn');

  function executeSearch() {
    const q = searchInput.value.trim();
    if (!q) return;

    // Se for coordenada (ex: -9.61, -36.76)
    const coordMatch = q.match(/^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[3]);
      map.flyTo([lat, lng], 14, { duration: 1 });
      L.marker([lat, lng]).addTo(map).bindPopup(`Coordenada: ${lat}, ${lng}`).openPopup();
      return;
    }

    // Busca via Nominatim OpenStreetMap
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q + ', Alagoas, Brasil')}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const item = data[0];
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          map.flyTo([lat, lon], 13, { duration: 1 });
          L.popup()
            .setLatLng([lat, lon])
            .setContent(`<div style="font-size:12px; font-weight:700;">${item.display_name}</div>`)
            .openOn(map);
        } else {
          alert(`Nenhum local encontrado para "${q}". Tente buscar por municípios de Alagoas, bairros ou povoados.`);
        }
      })
      .catch(() => {
        alert('Erro ao buscar endereço na base cartográfica online.');
      });
  }

  if (searchBtn) searchBtn.addEventListener('click', executeSearch);
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') executeSearch();
    });
  }

  // 16. RECOLHER/EXPANDIR SIDEBAR
  const btnCollapseSidebar = document.getElementById('sidebarCollapseBtn');
  const sidebar = document.getElementById('geoSidebar');

  if (btnCollapseSidebar && sidebar) {
    btnCollapseSidebar.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      setTimeout(() => map.invalidateSize(), 300);
    });
  }

  // 17. GRÁFICO HISTÓRICO DE EVOLUÇÃO TERRITORIAL (CHART.JS)
  function initCharts() {
    const ctx = document.getElementById('chartEvolucaoArea');
    if (!ctx) return;

    const labels = ['1872', '1900', '1911-20', '1933-50', '1960', '1970-80', '1991', '2000-07', '2010-13', '2014-22', '2023-Atual', 'Prefeitura'];
    const areas = [2419.38, 1759.30, 1237.31, 904.90, 748.38, 646.37, 277.85, 277.08, 274.58, 280.65, 279.38, 288.66];
    const colors = [
      '#D1C4E9', '#BBDEFB', '#B2EBF2', '#B2DFDB', '#C8E6C9', '#F0F4C3',
      '#FFE082', '#FFB74D', '#FFAB91', '#A7F3D0', '#81C784', '#F7A873'
    ];

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Área Territorial (km²)',
          data: areas,
          backgroundColor: colors,
          borderColor: '#475569',
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `Área: ${context.parsed.y.toLocaleString('pt-BR')} km²`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Área (km²)', font: { size: 11, weight: 'bold' } },
            ticks: { font: { size: 10 } }
          },
          x: {
            ticks: { font: { size: 10, weight: 'bold' } }
          }
        }
      }
    });
  }

  initCharts();

  // 18. MODAIS: SOBRE O PROJETO, DOWNLOADS E IMPRESSÃO
  const btnOpenAbout = document.getElementById('btnOpenAbout');
  const modalAbout = document.getElementById('modalAbout');
  const btnCloseAbout = document.getElementById('btnCloseAbout');

  const btnOpenDownload = document.getElementById('btnOpenDownload');
  const modalDownload = document.getElementById('modalDownload');
  const btnCloseDownload = document.getElementById('btnCloseDownload');

  const btnPrint = document.getElementById('btnPrintMap');

  if (btnOpenAbout && modalAbout) {
    btnOpenAbout.addEventListener('click', () => modalAbout.classList.add('show'));
  }
  if (btnCloseAbout && modalAbout) {
    btnCloseAbout.addEventListener('click', () => modalAbout.classList.remove('show'));
  }

  if (btnOpenDownload && modalDownload) {
    btnOpenDownload.addEventListener('click', () => modalDownload.classList.add('show'));
  }
  if (btnCloseDownload && modalDownload) {
    btnCloseDownload.addEventListener('click', () => modalDownload.classList.remove('show'));
  }

  // Fechar modais ao clicar no fundo
  [modalAbout, modalDownload].forEach(m => {
    if (m) {
      m.addEventListener('click', (e) => {
        if (e.target === m) m.classList.remove('show');
      });
    }
  });

  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  // 19. LEGENDA CARTOGRÁFICA FLUTUANTE (CANTO INFERIOR DIREITO)
  const btnToggleLegend = document.getElementById('btnToggleLegend');
  const legendPopover = document.getElementById('legendCardPopover');
  const btnCloseLegend = document.getElementById('btnCloseLegend');

  if (btnToggleLegend && legendPopover) {
    btnToggleLegend.addEventListener('click', (e) => {
      e.stopPropagation();
      legendPopover.classList.toggle('show');
    });

    if (btnCloseLegend) {
      btnCloseLegend.addEventListener('click', (e) => {
        e.stopPropagation();
        legendPopover.classList.remove('show');
      });
    }

    document.addEventListener('click', (e) => {
      if (!legendPopover.contains(e.target) && e.target !== btnToggleLegend) {
        legendPopover.classList.remove('show');
      }
    });
  }

  // Inicializa a timeline na última camada (Oficial 2023)
  updateTimelineView(10);
});
