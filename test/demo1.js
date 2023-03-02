// eslint-disable-next-line no-undef
const Contacts = artifacts.require('Demo1.sol');
module.exports = async function (callback) {
    const res = await Contacts.deployed();
    await res.setInfoArray('0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0',100,'hello','hello1')
    const res2 = await res.getInfoMapping()
    console.warn(res2)
    callback()
}