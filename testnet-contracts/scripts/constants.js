const CONSTANTS = {
  // ropsten
  rospten: {
    tokens: {
      dai: {
        symbol: 'DAI',
        address: '0xad6d458402f60fd3bd25163575031acdce07538d',
      },
      link: {
        symbol: 'LINK',
        address: '0xb4f7332ed719Eb4839f091EDDB2A3bA309739521',
      },
    },
  },

  rinkeby: {
    tokens: {
      dai: {
        symbol: 'DAI',
        address: '0xc7ad46e0b8a400bb3c915120d284aafba8fc4735',
      },
    },
  },

  // mainnet
  mainnet: {
    tokens: {
      dai: {
        symbol: 'DAI',
        address: '0x6b175474e89094c44da98b954eedeac495271d0f',
      },
      link: {
        symbol: 'LINK',
        address: '0x514910771af9ca656af840dff83e8264ecf986ca',
      },
      band: {
        address: '0xba11d00c5f74255f56a5e366f4f77f5a186d7f55',
        symbol: 'BAND',
      },
    },
  },
};

module.exports = { CONSTANTS };
