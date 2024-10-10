import rc from 'rc';
import defaultConfig from './default.json';

const { ENDPOINT_CACHE_CONFIG, ENDPOINT_SOURCE_URL, KAFKA } = rc('CLEDG', defaultConfig);

export {
  ENDPOINT_SOURCE_URL as ENDPOINT_SOURCE_URL,
  ENDPOINT_CACHE_CONFIG as ENDPOINT_CACHE_CONFIG,
  KAFKA as KAFKA_CONFIG
};
