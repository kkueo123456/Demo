// eslint-disable-next-line no-undef
const Contacts = artifacts.require('Demo1.sol');
// eslint-disable-next-line no-undef
const Demo2Contacts = artifacts.require('Demo2.sol');

module.exports = async function (deployer) {
    deployer.deploy(Contacts)
    deployer.deploy(Demo2Contacts, '0xE72BB307051ea7788033F82d45bF6747afd5d2A6')
    // const res = await Demo2Contacts.deployed()
    // for (let i = 0; i < 5; i++) {
    //     res.mint(`https://ipfs.2read.net/ipfs/QmawXHWzWZxfGwhTrVq39SWd6xQbvrfjGnyqFus7oUcdR3/${i + 1}.json`, i)
    // }
    
}