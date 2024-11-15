const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'ALMACEN_IONIC',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

