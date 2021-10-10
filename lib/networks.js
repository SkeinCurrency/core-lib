/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

'use strict';
var _ = require('lodash');

var BufferUtil = require('./util/buffer');
var JSUtil = require('./util/js');
var networks = [];
var networkMaps = {};

/**
 * A network is merely a map containing values that correspond to version
 * numbers for each bitcoin network. Currently only supporting "livenet"
 * (a.k.a. "mainnet") and "testnet".
 * @constructor
 */
function Network() {}

Network.prototype.toString = function toString() {
  return this.name;
};

/**
 * @function
 * @member Networks#get
 * Retrieves the network associated with a magic number or string.
 * @param {string|number|Network} arg
 * @param {string|Array} keys - if set, only check if the magic number associated with this name matches
 * @returns {Network}
 */
function get(arg, keys) {
  if (~networks.indexOf(arg)) {
    return arg;
  }
  if (keys) {
    if (!_.isArray(keys)) {
      keys = [keys];
    }
    var containsArg = function (key) {
      return networks[index][key] === arg;
    };
    for (var index in networks) {
      if (_.some(keys, containsArg)) {
        return networks[index];
      }
    }
    return undefined;
  }

  var network = networkMaps[arg];

  if (
    network &&
    network === testnet &&
    (arg === 'local' || arg === 'regtest')
  ) {
    enableRegtest();
  }

  return network;
}

/**
 * @function
 * @member Networks#add
 * Will add a custom Network
 * @param {Object} data
 * @param {string} data.name - The name of the network
 * @param {string|string[]} data.alias - The aliased name of the network
 * @param {Number} data.pubkeyhash - The publickey hash prefix
 * @param {Number} data.privatekey - The privatekey prefix
 * @param {Number} data.scripthash - The scripthash prefix
 * @param {Number} data.xpubkey - The extended public key magic for BIP32
 * @param {Number} data.xprivkey - The extended private key magic for BIP32
 * @param {Number} data.xpubkey256bit - The extended public key magic for DIP14
 * @param {Number} data.xprivkey256bit - The extended private key magic for DIP14
 * @param {Number} data.networkMagic - The network magic number
 * @param {Number} data.port - The network port
 * @param {Array}  data.dnsSeeds - An array of dns seeds
 * @return {Network}
 */
function addNetwork(data) {
  var network = new Network();

  JSUtil.defineImmutable(network, {
    name: data.name,
    alias: data.alias,
    pubkeyhash: data.pubkeyhash,
    privatekey: data.privatekey,
    scripthash: data.scripthash,
    xpubkey: data.xpubkey,
    xprivkey: data.xprivkey,
    xpubkey256bit: data.xpubkey256bit,
    xprivkey256bit: data.xprivkey256bit,
  });

  if (data.networkMagic) {
    JSUtil.defineImmutable(network, {
      networkMagic: BufferUtil.integerAsBuffer(data.networkMagic),
    });
  }

  if (data.port) {
    JSUtil.defineImmutable(network, {
      port: data.port,
    });
  }

  if (data.dnsSeeds) {
    JSUtil.defineImmutable(network, {
      dnsSeeds: data.dnsSeeds,
    });
  }
  _.each(network, function (value) {
    if (!_.isUndefined(value) && !_.isObject(value)) {
      networkMaps[value] = network;
    }

    if (Array.isArray(value)) {
      value.forEach(function (v) {
        networkMaps[v] = network;
      });
    }
  });

  networks.push(network);

  return network;
}

/**
 * @function
 * @member Networks#remove
 * Will remove a custom network
 * @param {Network} network
 */
function removeNetwork(network) {
  for (var i = 0; i < networks.length; i++) {
    if (networks[i] === network) {
      networks.splice(i, 1);
    }
  }
  for (var key in networkMaps) {
    if (networkMaps[key] === network) {
      delete networkMaps[key];
    }
  }
}

addNetwork({
  name: 'livenet',
  alias: 'mainnet',
  pubkeyhash: 0x00,
  privatekey: 0x80,
  scripthash: 0x01,
  xpubkey: 0x488b21e, // 'xpub' (Bitcoin Default)
  xprivkey: 0x488ade4, // 'xprv' (Bitcoin Default)
  networkMagic: 0x58f9e60a,
  port: 34350,
  dnsSeeds: [
    'dnsseed.skeincurrency.com'
  ],
});

/**
 * @instance
 * @member Networks#livenet
 */
var livenet = get('livenet');

addNetwork({
  name: 'testnet',
  alias: ['regtest', 'devnet', 'evonet', 'local'],
  pubkeyhash: 0x3f,
  privatekey: 0xbf,
  scripthash: 0x40,
  xpubkey: 0x43587cf, // 'xpub' (Bitcoin Default)      4 35 87 cf
  xprivkey: 0x4358394, // 'xprv' (Bitcoin Default)     4 35 83 94
});

/**
 * @instance
 * @member Networks#testnet
 */
var testnet = get('testnet');

// Add configurable values for testnet/regtest


var TESTNET = {
  PORT: 44350,
  NETWORK_MAGIC: BufferUtil.integerAsBuffer(0x4e4db231),
  DNS_SEEDS: [
    'testnet-seed.skeincurrency.com',
  ],
};


var REGTEST = {
  PORT: 19994,
  NETWORK_MAGIC: BufferUtil.integerAsBuffer(0xfcc1b7dc),
  DNS_SEEDS: [],
};


function initTestNet() {
  for (var key in TESTNET) {
    if (!_.isObject(TESTNET[key])) {
      networkMaps[TESTNET[key]] = testnet;
    }
  }

  for (var key in REGTEST) {
    if (!_.isObject(REGTEST[key])) {
      networkMaps[REGTEST[key]] = testnet;
    }
  }
  
  Object.defineProperty(testnet, 'port', {
    enumerable: true,
    configurable: false,
    get: function () {
      if (this.regtestEnabled) {
        return REGTEST.PORT;
      } else {
        return TESTNET.PORT;
      }
    },
  });
  
  Object.defineProperty(testnet, 'networkMagic', {
    enumerable: true,
    configurable: false,
    get: function () {
      if (this.regtestEnabled) {
        return REGTEST.NETWORK_MAGIC;
      } else {
        return TESTNET.NETWORK_MAGIC;
      }
    },
  });
  
  Object.defineProperty(testnet, 'dnsSeeds', {
    enumerable: true,
    configurable: false,
    get: function () {
      if (this.regtestEnabled) {
        return REGTEST.DNS_SEEDS;
      } else {
        return TESTNET.DNS_SEEDS;
      }
    },
  });

}

initTestNet();

/**
 * @function
 * @member Networks#enableRegtest
 * Will enable regtest features for testnet
 */
function enableRegtest() {
  testnet.regtestEnabled = true;
}

/**
 * @function
 * @member Networks#disableRegtest
 * Will disable regtest features for testnet
 */
function disableRegtest() {
  testnet.regtestEnabled = false;
}

/**
 * @namespace Networks
 */
module.exports = {
  add: addNetwork,
  remove: removeNetwork,
  get mainnet () { return livenet },
  get defaultNetwork() { return livenet },
  set defaultNetwork (network) { livenet = network},
  get livenet () { return livenet },
  set livenet (network) { livenet = network},
  get testnet () { return testnet },
  set testnet (network) { testnet = network},
  initTestNet: initTestNet,
  TESTNET: TESTNET,
  get: get,
  enableRegtest: enableRegtest,
  disableRegtest: disableRegtest,
};
