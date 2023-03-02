// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Demo2 is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    struct itemInfo {
        uint256 id;
        uint256 state; // 0 未出售 1 出售中 2 还价中
        uint256 price;
        address owner;
    }
    struct abatePriceItem {
        uint256 id;
        uint256 price;
        address owner;
        address buyer;
        bool isRead;
        uint256 onSalePrice;
    }
    address public feeAccount;
    // eth地址
    address constant ethAddress = address(0);
    // 用户=>用户所持有的物品信息的数组
    mapping(address => itemInfo[]) public userItemListMap;
    // 销售池数组
    itemInfo[] public inSalesArr;
    // 还价池数组(处于还价中的物品)
    abatePriceItem[] public inAbatePriceArr;
    // 保存在合约中的货币=>(用户地址=>保存的数量)
    mapping(address => mapping(address => uint256)) public tokenMap;
    // 保存用户还价历史信息
    mapping(address => abatePriceItem[]) public userInAbatePriceArr;
    event transferItemEv(address to, address from, uint256 id);
    // event abatePriceEv(
    //     uint256 id,
    //     uint256 price,
    //     address owner,
    //     address buyer,
    //     bool isRead,
    //     uint256 onSalePrice
    // );
    // 成功还价
    event acceptAbatePriceEv(
        uint256 id,
        address buyer,
        address saler,
        uint256 price,
        uint256 onSalePrice
    );
    // 拒绝还价
    event refuseBargainEv(
        uint256 id,
        address buyer,
        address saler,
        uint256 price,
        uint256 onSalePrice,
        string message
    );
    modifier buyerCheck(address _buyer, address _saler) {
        require(_buyer != _saler, "transferor cannot be recipient");
        _;
    }
    modifier senderCheck(uint256 _id) {
        require(
            getItemOwner(_id) == msg.sender,
            "Must be operated by msg.sender"
        );
        _;
    }
    modifier balanceCheck(address _address, uint256 _value) {
        require(
            tokenMap[ethAddress][_address] >= _value,
            "ETH balance is not enough"
        );
        _;
    }

    constructor(address _feeAccount) ERC721("csgo nft", "Demo2") {
        // 收取小费的账号
        feeAccount = _feeAccount;
    }

    function mint(
        string memory tokenURI,
        uint256 _price
    ) public returns (uint256) {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        setApprovalForAll(address(this), true);
        _setTokenURI(newItemId, tokenURI);
        setUserListItemMap(newItemId, 0, _price, msg.sender);
        return newItemId;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }

    // 存eth进合约
    function setEthInContract() public payable {
        tokenMap[ethAddress][msg.sender] += msg.value;
    }

    //    查找物品所有者
    function getItemOwner(uint256 id) public view returns (address) {
        require(id != 0);
        return ownerOf(id);
    }

    function setUserListItemMap(
        uint256 _id,
        uint256 _state,
        uint256 _price,
        address _owner
    ) public {
        userItemListMap[_owner].push(
            itemInfo({id: _id, state: _state, price: _price, owner: _owner})
        );
        // emit setUserListItemMapEv(_id, _state, _price, _owner, _buyer);
    }

    // 转移nft
    function transferItem(
        address _to,
        address _from,
        uint256 _id
    ) public payable buyerCheck(_to, _from) {
        Demo2(this).safeTransferFrom(_from, _to, _id);
        uint256 idx = findIndex(_id, userItemListMap[_from]);
        // 存给接收者
        setUserListItemMap(_id, 0, userItemListMap[_from][idx].price, _to);
        // 转移者删除该物品
        deleteUserItem(idx, _from);
        emit transferItemEv(_to, _from, _id);
    }

    function findAbatePriceIndex(
        uint256 _id,
        abatePriceItem[] memory _arr
    ) private pure returns (uint256) {
        uint256 idx = 0;
        for (uint256 i = 0; i < _arr.length; i++) {
            if (_arr[i].id == _id) {
                idx = i;
            }
        }
        return idx;
    }

    function findIndex(
        uint256 _id,
        itemInfo[] memory _arr
    ) private pure returns (uint256) {
        uint256 idx = 0;
        for (uint256 i = 0; i < _arr.length; i++) {
            if (_arr[i].id == _id) {
                idx = i;
            }
        }
        return idx;
    }

    function deleteSaleArrItem(uint256 _index) public {
        // 第一种消耗gas,但顺序不变
        for (uint256 i = _index; i < inSalesArr.length - 1; i++) {
            inSalesArr[i] = inSalesArr[i + 1];
        }
        inSalesArr.pop();
    }

    function deleteAbatePriceItem(uint256 _index) public {
        inAbatePriceArr[_index] = inAbatePriceArr[inAbatePriceArr.length - 1];
        inAbatePriceArr.pop();
    }

    function deleteUserItem(uint256 _index, address _address) public {
        // 第二种不消耗gas，但顺序会变
        userItemListMap[_address][_index] = userItemListMap[_address][
            userItemListMap[_address].length - 1
        ];
        userItemListMap[_address].pop();
    }

    // 购买操作
    function purchaseMethod(
        address _buyer,
        address _saler,
        uint256 _id,
        uint256 _value,
        string memory arrType
    ) public payable buyerCheck(_buyer, _saler) balanceCheck(_buyer, _value) {
        tokenMap[ethAddress][_buyer] = tokenMap[ethAddress][_buyer] - _value;
        tokenMap[ethAddress][_saler] = tokenMap[ethAddress][_saler] + _value;
        transferItem(_buyer, _saler, _id);
        // todo 将该商品从在售列表剔除
        if (keccak256(bytes(arrType)) == keccak256(bytes("inSalesArr"))) {
            uint256 idx = findIndex(_id, inSalesArr);
            deleteSaleArrItem(idx);
        }
    }

    // 上架操作
    function onSaleMethod(uint256 _id, uint256 _price) public senderCheck(_id) {
        uint256 idx = findIndex(_id, userItemListMap[msg.sender]);
        userItemListMap[msg.sender][idx].state = 1;
        inSalesArr.push(itemInfo(_id, 1, _price, msg.sender));
    }

    // 下架操作
    function withdrawalSaleMethod(uint256 _id) public senderCheck(_id) {
        uint256 idx = findIndex(_id, userItemListMap[msg.sender]);
        userItemListMap[msg.sender][idx].state = 0;
        uint256 findSaleIdx = findIndex(_id, inSalesArr);
        deleteSaleArrItem(findSaleIdx);
    }

    // 提现操作
    function withdrawalEth(
        uint256 _value
    ) public balanceCheck(msg.sender, _value) {
        // 收取小费
        uint256 tip = (_value * 2) / 100;
        tokenMap[ethAddress][feeAccount] =
            tokenMap[ethAddress][feeAccount] +
            tip;
        payable(msg.sender).transfer(_value - tip);
        tokenMap[ethAddress][msg.sender] =
            tokenMap[ethAddress][msg.sender] -
            _value;
    }

    // 发起还价操作
    function abatePrice(
        uint256 _id,
        uint256 _price,
        address _owner
    ) public balanceCheck(msg.sender, _price) {
        uint256 idx = findIndex(_id, userItemListMap[_owner]);
        userItemListMap[_owner][idx].state = 2;
        uint256 saleIdx = findIndex(_id, inSalesArr);
        abatePriceItem memory obj = abatePriceItem({
            id: _id,
            price: _price,
            owner: _owner,
            buyer: msg.sender,
            isRead: false,
            onSalePrice: inSalesArr[saleIdx].price
        });
        inAbatePriceArr.push(obj);
        userInAbatePriceArr[msg.sender].push(obj);
        deleteSaleArrItem(saleIdx);
        // 先将买入者金额存入合约
        tokenMap[ethAddress][msg.sender] =
            tokenMap[ethAddress][msg.sender] -
            _price;
        // emit abatePriceEv(
        //     _id,
        //     _price,
        //     _owner,
        //     msg.sender,
        //     false,
        //     inSalesArr[saleIdx].price
        // );
    }

    // 接受还价
    function acceptAbatePrice(
        uint256 _id,
        address _buyer,
        uint256 _price,
        uint256 _onSalePrice
    ) public returns (uint256 buyerNum, uint256 senderNum) {
        // purchaseMethod(_buyer, msg.sender, _id, _price, "inAbatePriceArr");
        tokenMap[ethAddress][msg.sender] =
            tokenMap[ethAddress][msg.sender] +
            _price;
        transferItem(_buyer, msg.sender, _id);
        uint256 idx = findAbatePriceIndex(_id, inAbatePriceArr);
        deleteAbatePriceItem(idx);
        emit acceptAbatePriceEv(_id, _buyer, msg.sender, _price, _onSalePrice);
        return (tokenMap[ethAddress][_buyer], tokenMap[ethAddress][msg.sender]);
    }

    // 拒绝还价
    function refuseBargain(
        uint256 _id,
        address _buyer,
        uint256 _price,
        uint256 _onSalePrice,
        string memory message
    ) public {
        uint256 idx = findAbatePriceIndex(_id, inAbatePriceArr);
        tokenMap[ethAddress][_buyer] =
            tokenMap[ethAddress][_buyer] +
            inAbatePriceArr[idx].price;
        deleteAbatePriceItem(idx);
        // 重新上架
        onSaleMethod(_id, _onSalePrice);
        emit refuseBargainEv(
            _id,
            _buyer,
            msg.sender,
            _price,
            _onSalePrice,
            message
        );
    }

    // // 查询用户购买的nft
    function userItemListMapGetter(
        address _address
    ) public view returns (itemInfo[] memory) {
        return userItemListMap[_address];
    }

    // 查询某用户在合约中存入的ETH
    function ethGetter(address _address) public view returns (uint256) {
        return tokenMap[ethAddress][_address];
    }

    // 查询在售的商品
    function saleListGetter() public view returns (itemInfo[] memory) {
        return inSalesArr;
    }

    // 查询还价池的数组
    function abatePriceGetter() public view returns (abatePriceItem[] memory) {
        return inAbatePriceArr;
    }

    // 查询用户还价历史
    function userInAbatePriceGetter(
        address _address
    ) public view returns (abatePriceItem[] memory) {
        return userInAbatePriceArr[_address];
    }
}
