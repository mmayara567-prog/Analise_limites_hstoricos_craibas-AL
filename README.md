# GEOPORTAL DE ANÁLISE DOS LIMITES HISTÓRICOS DE CRAÍBAS - AL

Geoportal analítico, profissional e didático desenvolvido para o **PROJETO CRAÍBAS / PlanUrbi Craíbas**, em parceria com a **Prefeitura Municipal de Craíbas** e a **FEPESA** (Fundação de Estudos e Pesquisas Socioeconômicos).

---

## 📌 Visão Geral e Propósito

O Geoportal reconstitui cartograficamente a evolução histórico-territorial de Craíbas desde o primeiro Recenseamento Geral do Império do Brasil (1872) até a malha oficial vigente do IBGE (2023), contrastando os dados estatísticos federais com a malha estimada a partir da atuação real da Prefeitura de Craíbas e identificando áreas críticas de atendimento público externo.

---

## 🎨 Identidade Visual e Paleta de Cores em Tons Pastéis

Em estrita consonância com a solicitação do projeto e as cores institucionais da bandeira e logotipo de Craíbas (**Verde, Laranja e Branco**), o design adota uma paleta em tons pastéis harmônica, suave e de alta legibilidade:

| Elemento | Cor / Código Hex | Aplicação no Geoportal |
| :--- | :--- | :--- |
| **Verde Pastel Claro** | `#EBF5EE` / `#7BB886` | Fundo suave de cards, acentos, botões primários e contornos |
| **Verde Oficial IBGE** | `#438E52` / `#2E6B39` | Limite Oficial Vigente (2023) e destaques de conformidade |
| **Laranja Pastel Suave**| `#FFF4EC` / `#F7A873` | Limite Estimado da Prefeitura (estilo tracejado) e alertas |
| **Laranja Terracota**  | `#DE7534` / `#B85012` | Réguas de medição e diferenciais de área territorial |
| **Branco Puro & Offwhite**| `#FFFFFF` / `#F9FAF9` | Painéis com efeito de vidro suave, cards e fundo do mapa |
| **Coral Pastel Alerta**| `#FFCDD2` / `#FF8A80` | **Área de Atuação Externa (2,24 km²)** sob gestão da prefeitura |

---

## 📊 Síntese da Série Histórica e Territorial

| Período | Município / Circunscrição | Área Calculada | Perímetro | Contexto Histórico e Didático |
| :--- | :--- | :---: | :---: | :--- |
| **1872** | **Anadia** | 2.419,38 km² | 320,57 km | Primeiro Censo do Império. Todo o território de Craíbas integrava a imensa Comarca de Anadia. |
| **1900** | **Limoeiro de Anadia** | 1.759,30 km² | 261,84 km | Desmembramento republicano de Limoeiro; Craíbas permanece sob este termo municipal. |
| **1911–1920** | **Limoeiro** | 1.237,31 km² | 201,28 km | Reorganização cartográfica da República Velha e expansão da cultura do fumo no Agreste. |
| **1933–1950** | **Arapiraca** | 904,90 km² | 164,24 km | Arapiraca emancipa-se em 1924; Craíbas consolida-se como importante distrito arapiraquense. |
| **1960** | **Arapiraca** | 748,38 km² | 153,46 km | Emancipação de povoados vizinhos (ex.: Girau do Ponciano em 1958) reduz a malha de Arapiraca. |
| **1970–1980** | **Arapiraca** | 646,37 km² | 136,86 km | Emancipação de Lagoa da Canoa (1962). Craíbas atinge forte pujança agrícola e comunitária. |
| **1991** | **Craíbas** | 277,85 km² | 72,70 km | Emancipação política (Lei Estadual nº 4.394/1982). Primeiro Censo do IBGE como cidade autônoma. |
| **2000–2007** | **Craíbas** | 277,08 km² | 74,64 km | Primeira base vetorial digital georreferenciada do IBGE em formato SIG. |
| **2010–2013** | **Craíbas** | 274,58 km² | 75,71 km | Censo 2010 com adoção oficial do referencial geodésico SIRGAS 2000. |
| **2014–2022** | **Craíbas** | 280,65 km² | 79,51 km | Revisão geodésica contínua em parceria com os órgãos estaduais de cartografia (SEPLAN/IMA). |
| **2023–Atual** | **Craíbas (Oficial IBGE)** | **279,38 km²** | **79,15 km** | **Malha oficial vigente do IBGE** utilizada para cadastros federais e FPM. |
| **Prefeitura** | **Craíbas (Estimado)** | **288,66 km²** | **80,61 km** | **Delimitação decorrente da prestação real de serviços públicos municipais (+9,28 km² / +3,3%).** |
| **Faixa Externa** | **Área de Atuação Externa** | **2,24 km²** | **6,53 km** | **Polígono lindeiro na divisa sul atendido continuamente pela Prefeitura de Craíbas (postos de saúde, transporte escolar e estradas vicinais).** |

---

## 🚀 Funcionalidades Interativas

1. **Player da Linha do Tempo**:
   - Controle de reprodução automática (Play/Pause), avançar/retroceder e slider contínuo com 11 marcos cronológicos.
   - Atualização dinâmica em tempo real do mapa, métricas e fichas históricas explicativas.
2. **Comparador de Limites (IBGE vs. Prefeitura)**:
   - Exibição simultânea do traçado oficial verde do IBGE, traçado estimado laranja pontilhado e a faixa crítica de 2,24 km².
   - Botão de foco automático com zoom na faixa de conflito.
3. **Contexto Regional & Malha de Alagoas**:
   - Destaque dos municípios vizinhos (Arapiraca, Girau do Ponciano, Lagoa da Canoa, Jaramataia, Batalha, Igaci) e opção de visualizar todos os 102 municípios de Alagoas.
4. **Árvore de Camadas com Opacidade Individual**:
   - Controle fino de visibilidade e sliders de transparência de 0% a 100% para sobreposições técnicas.
5. **Ferramentas de Medição Cartográfica**:
   - Medição de distâncias lineares (em km e metros).
   - Medição de áreas poligonais (em km² e hectares).
6. **Pesquisa Geográfica**:
   - Busca inteligente de localidades, bairros, povoados e coordenadas decimais (Lat, Lon).
7. **Mapas-Base**:
   - CartoDB Positron (Tons Claros Pastéis)
   - Satélite de Alta Resolução (Esri World Imagery)
   - OpenStreetMap Padrão
   - Relevo Topográfico (OpenTopoMap)
8. **Exportação & Download**:
   - Impressão formatada para A4 paisagem/retrato com legenda e carimbo técnico.
   - Download direto dos arquivos `.geojsonl` individuais ou completos.

---

## 💻 Como Executar

Basta dar um duplo clique no arquivo:
```
ABRIR_GEOPORTAL.bat
```
Ou abrir diretamente o arquivo `index.html` em qualquer navegador web moderno (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari). Não requer instalação de servidores ou dependências externas adicionais.
