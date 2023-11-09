let aggClinicalAttrs = 0;
let aggFiles = 0;
let aggFileSize = 0;
let aggSubject = 0;

function addTotals() {
  $( ".total-count-card").remove();
  $( "#header_bar" ).append(`
    <div class="total-count-card">
      <div class="total-count-card__number">${numberWithCommas(aggSubject)}</div>
      <div class="total-count-card__text">Total Subjects</div>
    </div>
    <div class="total-count-card">
      <div class="total-count-card__number">${numberWithCommas(aggFiles)}</div>
      <div class="total-count-card__text">Total Files</div>
    </div>
    <div class="total-count-card">
      <div class="total-count-card__number">${humanFileSize(aggFileSize)}</div>
      <div class="total-count-card__text">Total File Size</div>
    </div>
  `);
}

function numberWithCommas(str) {
  return str.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function humanFileSize(size) {
    const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    const sizeStr = (size / (1000 ** i)).toFixed(2) * 1;
    const suffix = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'][i];
    return `${sizeStr} ${suffix}`;
}

function getCommonHTML(commonAbbv, title, logoHrefLink, subjectCount, clinicalAttributeCount, indexdFileCount, indexdFileSize) {
  return `
    <div>
      <a href="${logoHrefLink}" target="_blank" class="common-card__logo-wrapper">
        <img src="https://occ-data.github.io/stats/src/img/commons_logos/${commonAbbv}.png" class="card-img-top common-card__logo" alt="${commonAbbv} logo">
      </a>
    </div>
    <div class="card-body">
      <div class="card-text">
        <p class=common-card__title>${title}</p>
        ${subjectCount ? `<p class="common-card__info"><span class="common-card__number col-6 common-card__text--left">${subjectCount}</span><span class="col-6 common-card__text--right"> Subjects</span></p>` : ''}
        <p class="common-card__info"><span class="common-card__number col-6 common-card__text--left">${clinicalAttributeCount.toLocaleString()}</span><span class="col-6 common-card__text--right"> Attributes</span></p>
        <p class="common-card__info"><span class="common-card__number col-6 common-card__text--left">${indexdFileCount.toLocaleString()}</span><span class="col-6 common-card__text--right"> Files</span></p>
        <p class="common-card__info"><span class="col-6 common-card__text--left">Total Size </span><span class="common-card__number col-6 common-card__text--right">${humanFileSize(indexdFileSize)}</span></p>
      </div>
    </div>
  `;
}

function createHTMLByIndexdData(abbv, title, logoHrefLink, indexdData, dictionaryEndpoint) {
  $.getJSON(dictionaryEndpoint, function(dictionaryData) {
    let clinicalAttributeCount = 0;
    const nodes = Object.keys(dictionaryData).filter(attr => !attr.startsWith('_'));
    nodes.forEach((node) => {
      clinicalAttributeCount += Object.keys(dictionaryData[node].properties).length;
    });
    aggClinicalAttrs += clinicalAttributeCount;
    aggFiles += indexdData.fileCount;
    aggFileSize += indexdData.totalFileSize;
    $( "#main" ).find("#"+ abbv).find(".loader").hide();
    $( "#main" ).find("#"+ abbv).append(getCommonHTML(
      abbv,
      title,
      logoHrefLink,
      subjectCounts[abbv],
      clinicalAttributeCount,
      indexdData.fileCount,
      indexdData.totalFileSize,
    ));
    subjectCount = isNaN(parseInt(subjectCounts[abbv])) ? 0 : parseInt(subjectCounts[abbv].split(",").join(""));
    aggSubject = aggSubject + subjectCount ;
    aggFiles = aggFiles + indexdData.fileCount;
    aggFileSize = aggFileSize + indexdData.totalFileSize;

    addTotals();
  });
}

async function addCommons(abbv, logoHrefLink, indexdEndpoint, dictionaryEndpoint, section, title="",) {
  // only fetch from indexd endpoint if there is no local data cache in indexdCounts.js
  // to prevent issue of a slow IndexD in some envs
  const indexdData = indexdCountsCache[abbv];
  if (!indexdData) {
    $.getJSON(indexdEndpoint, function(indexdData) {
      indexdCountsCache[abbv] = indexdData;
      createHTMLByIndexdData(abbv, title, logoHrefLink, indexdData, dictionaryEndpoint, section)
    });
  } else {
    createHTMLByIndexdData(abbv, title, logoHrefLink, indexdCountsCache[abbv], dictionaryEndpoint, section)
  }
}

$(document).ready(function() {
  // (abbreviation, URL, indexd stats endpoint, dictionary endpoint, title (optional))
  addCommons("vpodc", "https://vpodc.data-commons.org", "https://vpodc.data-commons.org/index/_stats", "https://vpodc.data-commons.org/api/v0/submission/_dictionary/_all");
  addCommons("covid19", "https://chicagoland.pandemicresponsecommons.org", "https://chicagoland.pandemicresponsecommons.org/index/_stats", "https://chicagoland.pandemicresponsecommons.org/api/v0/submission/_dictionary/_all");
  addCommons("bloodpac", "https://data.bloodpac.org", "https://data.bloodpac.org/index/_stats", "https://data.bloodpac.org/api/v0/submission/_dictionary/_all");
  addCommons("edc", "https://portal.occ-data.org", "https://portal.occ-data.org/index/_stats", "https://portal.occ-data.org/api/v0/submission/_dictionary/_all");
  addCommons("canine", "https://caninedc.org", "https://caninedc.org/index/_stats", "https://caninedc.org/api/v0/submission/_dictionary/_all");
  addCommons("vadc", "https://va.data-commons.org/", "https://va.data-commons.org/index/_stats", "https://va.data-commons.org/api/v0/submission/_dictionary/_all");
  });
