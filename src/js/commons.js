let aggClinicalAttrs = 0;
let aggFiles = 0;
let aggFileSize = 0;
let aggSubjectCount = 0;

function displayTotals() {
  $(".total-count-card").remove();
  $("#header_bar").append(`
    <div class="total-count-card">
      <div class="total-count-card__number">${numberWithCommas(aggSubjectCount)}</div>
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
  const sizeStr = (size / (1000 ** i)).toFixed(2);
  const suffix = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'][i];
  return `${sizeStr} ${suffix}`;
}

function accumulateIndexdCounts(total, current) {
  total['fileCount'] += current['fileCount'];
  total['totalFileSize'] += current['totalFileSize'];
  return total;
}

async function addCommons(abbv, logoHrefLink, dictionaryEndpoint, subjectCount, fileCount, totalFileSize, title = "") {
  $.getJSON(dictionaryEndpoint, async function (dictionaryData) {
    let clinicalAttributeCount = 0;
    const nodes = Object.keys(dictionaryData).filter(attr => !attr.startsWith('_'));
    nodes.forEach((node) => {
      clinicalAttributeCount += Object.keys(dictionaryData[node].properties).length;
    });
    const indexdFileCount = (Number.isNaN(fileCount)) ? 0 : fileCount;
    const indexdTotalFileSize = (Number.isNaN(totalFileSize)) ? 0 : totalFileSize;
    aggClinicalAttrs += clinicalAttributeCount;
    aggFiles += indexdFileCount;
    aggFileSize += indexdTotalFileSize;
    if (subjectCount) {
      aggSubjectCount += subjectCount;
    }
    let html = `
    <div>
      <a href="${logoHrefLink}" target="_blank" class="common-card__logo-wrapper">
        <img src="src/img/logos/${abbv}.png" class="card-img-top common-card__logo" alt="${abbv} logo">
      </a>
    </div>
    <div class="card-body">
      <div class="card-text">
        <p class=common-card__title>${title}</p>
        ${subjectCount ? `<p class="common-card__info"><span class="common-card__number col-6 common-card__text--left">${numberWithCommas(subjectCount)}</span><span class="col-6 common-card__text--right"> Subjects</span></p>` : ''}
        <p class="common-card__info"><span class="common-card__number col-6 common-card__text--left">${clinicalAttributeCount.toLocaleString()}</span><span class="col-6 common-card__text--right"> Attributes</span></p>
        <p class="common-card__info"><span class="common-card__number col-6 common-card__text--left">${indexdFileCount.toLocaleString()}</span><span class="col-6 common-card__text--right"> Files</span></p>
        <p class="common-card__info"><span class="common-card__number col-6 common-card__text--left">${humanFileSize(indexdTotalFileSize)}</span><span class="col-6 common-card__text--right">Total Size </span></p>
      </div>
    </div>
  `;
    $("#" + abbv).append(html);
    displayTotals();
  });
}

function addAggCommons(commonAbbv, logoHrefLink, description, repos, title = "") {
  let html = `
  <div class="card common-card text-center">
    <div>
      <a href="${logoHrefLink}" target="_blank" class="common-card__logo-wrapper">
        <img src="src/img/logos/${commonAbbv}.png" class="card-img-top common-card__logo" alt="${commonAbbv} logo">
      </a>
    </div>
    <div class="card-body">
      <div class="card-text">
        <p class=common-card__title>${title}</p>
        <p class=mesh__description>${description}</p>
        <p class=common-card__info>Data Repositories:<span class="common-card__number"> ${repos.toLocaleString()}</span></p>
      </div>
    </div>
  </div>
  `;
  $("#meshes").append(html);
}

document.addEventListener('DOMContentLoaded', async function () {
  // meshes
  addAggCommons("murtha_cancer_center_logo", "http://mc2dp.data-commons.org/", "The vision of Murtha Cancer Center Data Platform (MC2DP) is to integrate federal scientific platforms with public-private innovators revealing the impact of service-related exposures to environmental contaminants and toxin hazards and developing prevention and early detection approaches and advanced treatments of cancers arising from these exposures", 6)

  // commons
  for (let [abbreviation, data] of Object.entries(instances)) {
    addCommons(abbreviation, data["logo_link"], data["dictionary_endpoint"], data["subject_count"], data["file_count"], data["total_file_size"], data["title"]);
  }
});
