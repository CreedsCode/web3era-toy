# This is build on 🏗 Scaffold-ETH 2
⚙️ Built using NextJS, RainbowKit, Hardhat, Wagmi, Viem, and Typescript.
> 🧪 An open-source, up-to-date toolkit for building decentralized applications (dapps) on the Ethereum blockchain. It's designed to make it easier for developers to create and deploy smart contracts and build user interfaces that interact with those contracts.
Check it out if you want to learn how to get this project running localy!
<h4 align="center">
  <a href="https://docs.scaffoldeth.io">Documentation</a> |
  <a href="https://scaffoldeth.io">Website</a>
</h4>

# Web3Era TOY: A Beginner's Guide to Meta-Transactions

Hey there, friend! Let me give you a quick rundown of the technical magic happening behind the scenes in Web3Era TOY. Don't worry; I'll keep it simple and easy to understand.

## Meta-Transactions: The Secret Sauce

At the heart of Web3Era TOY lies the concept of meta-transactions. It's like having a super-powered friend who takes care of all the complicated blockchain stuff for you.

When you select a mood in the app, it's like sending a secret message to your friend (the relayer service). This message contains your mood data and a special signature that proves it's really you.

Your friend (the relayer) then takes this message and pays the gas fees to execute the transaction on the Ethereum blockchain. It's like they're saying, "I got you, buddy! I'll handle the technical mumbo-jumbo, and you just focus on sharing your mood with the world."

## Account Abstraction: Your Secret Identity

In Web3Era TOY, we use something called account abstraction. It's like having a secret identity that's separate from your wallet.

When you log in to the app, we generate a unique private key for you and store it safely in your browser's local storage. This private key becomes your secret identity, and it's used to sign transactions on your behalf.

It's like having a superhero alter ego that takes care of all the blockchain interactions while keeping your real identity hidden. Pretty cool, right?

## Whitelisting: The Bouncer at the Door

To make sure only authorized users can join the mood-sharing party, we have a whitelisting process in place. It's like having a friendly bouncer at the door who checks your name on the guest list.

When you choose a username, your public key is sent to the backend for whitelisting. The app waits for the whitelisting transaction to be confirmed on the blockchain before giving you the green light to store your mood.

It's like the bouncer saying, "Alright, you're on the list. Come on in and share your mood with the crew!"

## Smart Contract: The Mood Vault

Under the hood, Web3Era TOY interacts with a smart contract deployed on the Ethereum blockchain. This smart contract is like a super-secure vault that stores and manages everyone's moods.

When you confirm your mood selection, the app prepares a special message (the meta-transaction) with your mood data and signature. This message is sent to your friend (the relayer service), who verifies your signature and executes the `storeData` function on the smart contract.

The smart contract acts as the gatekeeper, making sure only authorized users can store their moods. Once your mood is stored on-chain, it's like it's forever engraved in the blockchain's digital history.

## Putting It All Together

So, there you have it, my friend! That's the technical magic happening behind the scenes in Web3Era TOY. Meta-transactions, account abstraction, whitelisting, and smart contracts all work together to create a seamless and user-friendly experience.

We've got some exciting plans for the future, like preemptive caching to make things even faster and integration with other cool web3 protocols. But for now, sit back, relax, and enjoy sharing your moods with the world!

If you want to dive deeper into the technical details or contribute to the project, just check out the repository. We've got you covered with all the documentation and setup guides you need.

Stay up to date by following me on Twitter.

https://x.com/spanish_vanish