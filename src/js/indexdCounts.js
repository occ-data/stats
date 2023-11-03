/*
  Local cache of IndexD stats data for some envs
  To avoid the issue of slowness
  Values put in here will take precedence and prevent the main page from call the IndexD endpoint of that env
*/


const indexdCountsCache = {
    "edc": { fileCount: 33441289, totalFileSize: 99197838516274 },
    "bloodpac": { fileCount: 35569, totalFileSize: 34663094742719 },
    "covid19": { fileCount: 285849, totalFileSize: 117637133283369 },
    "vpodc": { fileCount: 352786, totalFileSize: 2184859714735 },
    "canine": { fileCount: 3820, totalFileSize: 1884253865578 },
    "vadc": { fileCount: 7640, totalFileSize: 4101940731150 },

  };
