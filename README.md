# EIP-712 Verifiable Credentials

## Slightly modified version of https://github.com/ra-phael/eip712-vc 🙌

This is a simple example of how Verifiable Credentials can be verified on-chain.

It is based on the [EIP-712 standard for typed structured data hashing and signing ](https://eips.ethereum.org/EIPS/eip-712) and [Ethereum EIP712 Signature 2021](https://w3c-ccg.github.io/ethereum-eip712-signature-2021-spec/).

The VC used is very basic and minimal, more properties such as id could be added. The basis for this example VC ("DaoVc") is defined in `mocks > exampleDocument.json`. The credential subject is simply:

```json
"credentialSubject": {
    id: string;
    iamHash: string;
    provider: string;
  }
```

On chain verification of

### Pre Requisites

Before running any command, you need to create a `.env` file and set a BIP-39 compatible mnemonic or a private key as an environment
variable. Follow the example in `.env.example`. If you don't already have a mnemonic, use this [website](https://iancoleman.io/bip39/) to generate one.

Then, proceed with installing dependencies:

```sh
$ yarn install
```

Then run

```
npx hardhat present
```

First, this will deploy the smart contracts locally and generate a serialized Verifiable Credential, which is signed by the private key provided as environment variable and looks like this:

```
{
  "credentialSubject": {
    "id": "did:pkh:eip155:1:0xe4c81FCb008E04C9bc5AD607f0cb14E4AC07896d",
    "iamHash": "v0.0.0:k4jNBdi0jv09I+gYEtRvd8w9XlJwnN3ivilkun4c81g=",
    "provider": "Google"
  },
  "issuer": "did:pkh:eip155:1:0x7A67063c391F266D31eA6c9eC7C788c1323B7746",
  "issuanceDate": "2022-10-05T03:00:26.063Z",
  "_context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://schema.org",
    "https://w3id.org/security/v2"
  ],
  "_type": [
    "VerifiableCredential"
  ],
  "proof": {
    "created": "2022-10-05T03:00:26.063Z",
    "eip712": {
      "domain": {
        "name": "stamp-vc-verifier-test"
      },
      "primaryType": "StampVc",
      "types": {
        "StampVc": [
          {
            "name": "_context",
            "type": "string[]"
          },
          {
            "name": "_type",
            "type": "string[]"
          },
          {
            "name": "issuer",
            "type": "string"
          },
          {
            "name": "issuanceDate",
            "type": "string"
          },
          {
            "name": "credentialSubject",
            "type": "Stamp"
          }
        ],
        "Stamp": [
          {
            "name": "id",
            "type": "string"
          },
          {
            "name": "iamHash",
            "type": "string"
          },
          {
            "name": "provider",
            "type": "string"
          }
        ]
      }
    },
    "proofPurpose": "assertionMethod",
    "proofValue": {
      "v": 27,
      "r": "0x7e2eb0cc688dc3b1eb7ea04de9fe8cbc2733418d7c8fa7422868b77cccbde0d0",
      "s": "0x03fb27f913557a561c139d903e6945452041067e8d10e869d9b3a227c802e5bd"
    },
    "type": "EthereumEip712Signature2021",
    "verificationMethod": "did:pkh:eip155:1:0x7A67063c391F266D31eA6c9eC7C788c1323B7746#blockchainAccountId"
  }
}
```

### Some remarks

- The proof object is based on [Ethereum EIP712 Signature 2021](https://w3c-ccg.github.io/ethereum-eip712-signature-2021-spec/).
- "@" is not a valid character in a variable name in Solidity, hence why the `@context` and `@type` properties are renamed `_context` and `_type` respectively.
- The `did:pkh` method is used which allows us to turn the Ethereum address of the VC issuer / signer into a valid DID. The inverse of this "process" is done on-chain by the pseudo-resolver in `DIDpkhAdapter.sol`.

<br/>

Then, the content of the whole VC (minus the proof object) and the signature attached to it is verified on-chain against the Ethereum address in `issuer`. This is done by calling `verifyDaoVc()`. If the verification is successful you should see:

```
Verification passed on-chain?  true
Gas cost:  83550
```

As shown above, the verification consumes 83,550 gas.
The following table gives an estimate of the cost in dollars on Ethereum Mainnet, based on different gas prices:

| Gas price (gwei) | Cost ($) |
| ---------------- | -------- |
| 5                | $0.66    |
| 10               | $1.32    |
| 20               | $2.64    |
| 30               | $3.96    |

<br/>

## Next steps

- [ ] Create an example of a VC as voucher that can be redeemed against something such as ERC20 tokens or 721 tokens
- [ ] Generalize the implementation so that an on-chain VC verifier is not tightly coupled to a specific VC schema

<br/>
<br/>

## Generic Repo Usage

### Compile

Compile the smart contracts with Hardhat:

```sh
$ yarn compile
```

### TypeChain

Compile the smart contracts and generate TypeChain artifacts:

```sh
$ yarn typechain
```

### Lint Solidity

Lint the Solidity code:

```sh
$ yarn lint:sol
```

### Lint TypeScript

Lint the TypeScript code:

```sh
$ yarn lint:ts
```

### Test

Run the Mocha tests:

```sh
$ yarn test
```

### Coverage

Generate the code coverage report:

```sh
$ yarn coverage
```

### Report Gas

See the gas usage per unit test and average gas per method call:

```sh
$ REPORT_GAS=true yarn test
```

### Clean

Delete the smart contract artifacts, the coverage reports and the Hardhat cache:

```sh
$ yarn clean
```

## Syntax Highlighting

If you use VSCode, you can get Solidity syntax highlighting via the [vscode-solidity](https://marketplace.visualstudio.com/items?itemName=JuanBlanco.solidity) extension.
