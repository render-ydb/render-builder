import { PluginListOrPresetList } from '../types';
import _ = require('lodash');

const isStringOrArrayWithStringFirstItem = (value: any): boolean => {
  if (_.isArray(value)) {
    return _.isString(value[0]);
  } else if (_.isString(value)) {
    return true;
  }
  return false;
};

const checkPluginsOrPresets = ({
  type,
  list,
}: {
  type: string;
  list: PluginListOrPresetList;
}): void => {
  if (!_.isArray(list) || !list.every(isStringOrArrayWithStringFirstItem)) {
    throw new Error(`${type} did not pass validation`);
  }
};

export = checkPluginsOrPresets;
