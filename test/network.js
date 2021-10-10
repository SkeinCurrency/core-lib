/* eslint-disable */

'use strict';

var _ = require('lodash');
var BufferUtil = require('../lib/util/buffer');
var expect = require('chai').expect;
var should = require('chai').should();
var bitcore = require('../index.js');
var Networks = bitcore.Networks;


Networks.remove(Networks.get('testnet'));
Networks.remove(Networks.get('livenet'));

Networks.add({
    name: 'livenet',
    alias: 'mainnet',
    pubkeyhash: 0x4c,
    privatekey: 0xcc,
    scripthash: 0x10,
    xpubkey: 0x488b21e,    // 'xpub' (Bitcoin Default)
    xprivkey: 0x488ade4,   // 'xprv' (Bitcoin Default)
    xpubkey256bit: 0x0eecefc5,    // 'dpmp' (dashpay mainnet public)
    xprivkey256bit: 0x0eecf02e,   // 'dpms' (dashpay mainnet secret)
    networkMagic: 0xbf0c6bbd,
    port: 9999,
    dnsSeeds: [
      'dnsseed.darkcoin.io',
      'dnsseed.dashdot.io',
      'dnsseed.masternode.io',
      'dnsseed.dashpay.io',
    ],
})

Networks.add( {
    name: 'testnet',
    alias: ['regtest', 'devnet', 'evonet', 'local'],
    pubkeyhash: 0x8c,
    privatekey: 0xef,
    scripthash: 0x13,
    xpubkey: 0x43587cf, // 'tpub' (Bitcoin Default)
    xprivkey: 0x04358394, // 'tprv' (Bitcoin Default)
    xpubkey256bit: 0x0eed270b, // 'dptp' (dashpay testnet public)
    xprivkey256bit: 0x0eed2774, // 'dpts' (dashpay testnet secret)
  });

  Networks.livenet = Networks.get('livenet');
  Networks.testnet = Networks.get('testnet');

  Object.assign(Networks.TESTNET,{
    PORT: 19999,
    NETWORK_MAGIC: BufferUtil.integerAsBuffer(0xcee2caff),
    DNS_SEEDS: [
      'testnet-seed.darkcoin.io',
      'testnet-seed.dashdot.io',
      'test.dnsseed.masternode.io',
    ],
  })

  Networks.initTestNet();


  module.exports = Networks