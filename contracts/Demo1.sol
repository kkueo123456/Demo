// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.17;

contract Demo1 {
    uint256 public idCount = 0;
    struct infoObj {
        uint256 id;
        address sender;
        address recipient;
        uint256 amount;
        string message;
        uint256 timestamp;
        string keyword;
    }
    infoObj[] public infoArray;
    mapping(address=>infoObj[]) public addressObj;

    function setInfoArray(address _recipient,uint256 _amount,string memory _message,string memory _keyword) public {
        idCount += 1;
        addressObj[msg.sender].push(infoObj(idCount,msg.sender,_recipient,_amount,_message,block.timestamp,_keyword));
    }
    function getInfoMapping() public view returns(infoObj[] memory){
        return addressObj[msg.sender];
    }
}
