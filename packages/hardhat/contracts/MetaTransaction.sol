// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "hardhat/console.sol";

contract MetaTransaction {
	using ECDSA for bytes32;

	mapping(address => uint256) public nonces;

	bytes32 private constant META_TRANSACTION_TYPEHASH =
		keccak256(
			bytes(
				"MetaTransactionStruct(uint256 nonce,address from,bytes functionSignature)"
			)
		);
	bytes32 private constant EIP712_DOMAIN_TYPEHASH =
		keccak256(
			bytes(
				"EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
			)
		);

	bytes32 private domainSeparator;

	event MetaTransactionExecuted(
		address userAddress,
		address relayerAddress,
		bytes functionSignature
	);

	constructor(string memory name, string memory version, uint256 chainId) {
		domainSeparator = keccak256(
			abi.encode(
				EIP712_DOMAIN_TYPEHASH,
				keccak256(bytes(name)),
				keccak256(bytes(version)),
				chainId,
				address(this)
			)
		);
	}

	struct MetaTransactionStruct {
		uint256 nonce;
		address from;
		bytes functionSignature;
	}

	function executeMetaTransaction(
		address userAddress,
		bytes memory functionSignature,
		bytes32 sigR,
		bytes32 sigS,
		uint8 sigV
	) public returns (bytes memory) {
		MetaTransactionStruct memory metaTx = MetaTransactionStruct({
			nonce: nonces[userAddress],
			from: userAddress,
			functionSignature: functionSignature
		});

		require(
			verify(userAddress, metaTx, sigR, sigS, sigV),
			"Signer and signature do not match"
		);

		nonces[userAddress] += 1;

		(bool success, bytes memory returnData) = address(this).call(
			abi.encodePacked(functionSignature, userAddress)
		);
		require(success, "Function call not successful");

		emit MetaTransactionExecuted(
			userAddress,
			msg.sender,
			functionSignature
		);

		return returnData;
	}

	function hashMetaTransaction(
		MetaTransactionStruct memory metaTx
	) internal view returns (bytes32) {
		return
			keccak256(
				abi.encode(
					META_TRANSACTION_TYPEHASH,
					metaTx.nonce,
					metaTx.from,
					keccak256(metaTx.functionSignature)
				)
			);
	}

	function getMessageHash(
		bytes32 metaTxHash
	) internal view returns (bytes32) {
		return
			keccak256(
				abi.encodePacked("\x19\x01", domainSeparator, metaTxHash)
			);
	}

	function verify(
		address user,
		MetaTransactionStruct memory metaTx,
		bytes32 sigR,
		bytes32 sigS,
		uint8 sigV
	) internal view returns (bool) {
		bytes32 metaTxHash = hashMetaTransaction(metaTx);
		bytes32 messageHash = getMessageHash(metaTxHash);
		return user == messageHash.recover(sigV, sigR, sigS);
	}
}
