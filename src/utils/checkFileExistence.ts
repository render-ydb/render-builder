import fse = require('fs-extra');

const checkFileExistence = (filepath: string) => {
  return fse.existsSync(filepath);
};

export = checkFileExistence;
