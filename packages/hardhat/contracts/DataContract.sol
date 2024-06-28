// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MetaTransaction.sol";

contract DataContract is MetaTransaction("DataContract", "1", block.chainid) {
	struct DataEntry {
		uint256 id;
		address user;
		uint256 timestamp;
		string location;
	}

	address public owner;
	DataEntry[] public dataEntries;
	uint256 public nextId;

	mapping(address => bool) public whitelist;
	mapping(address => uint256[]) public userEntries;

	constructor(address _owner) {
		owner = _owner;
		nextId = 1;
	}

	modifier onlyOwner() {
		require(msg.sender == owner, "Not the contract owner");
		_;
	}

	modifier onlyWhitelisted(address user) {
		require(whitelist[user], "Not whitelisted");
		_;
	}

	function updateWhitelist(
		address user,
		bool isWhitelisted
	) public onlyOwner {
		whitelist[user] = isWhitelisted;
	}

	function storeData(
		address user,
		string memory location
	) public onlyWhitelisted(user) {
		DataEntry memory newEntry = DataEntry({
			id: nextId,
			user: user,
			timestamp: block.timestamp,
			location: location
		});

		dataEntries.push(newEntry);
		userEntries[user].push(nextId);
		nextId++;
	}

	function getDataEntries() public view returns (DataEntry[] memory) {
		return dataEntries;
	}

	function getDataEntryByIndex(
		uint256 index
	) public view returns (DataEntry memory) {
		require(index < dataEntries.length, "Index out of bounds");
		return dataEntries[index];
	}

	function getDataEntriesByUser(
		address user
	) public view returns (DataEntry[] memory) {
		uint256[] storage entryIds = userEntries[user];
		DataEntry[] memory entries = new DataEntry[](entryIds.length);

		for (uint256 i = 0; i < entryIds.length; i++) {
			entries[i] = dataEntries[entryIds[i] - 1];
		}

		return entries;
	}
}