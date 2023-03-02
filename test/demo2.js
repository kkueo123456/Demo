// eslint-disable-next-line no-undef
const Contacts = artifacts.require('Demo2.sol');
module.exports = async function (callback) {
    const res = await Contacts.deployed();
    await res.setEthInContract(100000000000000000)

    callback()
}