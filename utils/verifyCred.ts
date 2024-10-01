import { ethers } from "ethers";

// Define the domain (from the JSON)
const domain = {
  name: "VerifiableCredential",
};

// Define the message (the actual data that was signed, extracted from your JSON)
const originalDocument = {
  id: 30923140,
  provider: "Linkedin",
  credential: {
    type: ["VerifiableCredential"],
    proof: {
      type: "EthereumEip712Signature2021",
      created: "2024-09-09T19:20:01.906Z",
      "@context": "https://w3id.org/security/suites/eip712sig-2021/v1",
      proofValue:
        "0x457ef46b3afeb80c756f442a94af37ae212f0a377bce847cdad3d1f0df4d01eb421122f559f8bc25e41202d763cd7fdb089e4bdef2e8ce852b4653eff5b65f141c",
      eip712Domain: {
        types: {
          Proof: [
            {
              name: "@context",
              type: "string",
            },
            {
              name: "created",
              type: "string",
            },
            {
              name: "proofPurpose",
              type: "string",
            },
            {
              name: "type",
              type: "string",
            },
            {
              name: "verificationMethod",
              type: "string",
            },
          ],
          "@context": [
            {
              name: "hash",
              type: "string",
            },
            {
              name: "provider",
              type: "string",
            },
          ],
          Document: [
            {
              name: "@context",
              type: "string[]",
            },
            {
              name: "credentialSubject",
              type: "CredentialSubject",
            },
            {
              name: "expirationDate",
              type: "string",
            },
            {
              name: "issuanceDate",
              type: "string",
            },
            {
              name: "issuer",
              type: "string",
            },
            {
              name: "proof",
              type: "Proof",
            },
            {
              name: "type",
              type: "string[]",
            },
          ],
          CredentialSubject: [
            {
              name: "@context",
              type: "@context",
            },
            {
              name: "hash",
              type: "string",
            },
            {
              name: "id",
              type: "string",
            },
            {
              name: "provider",
              type: "string",
            },
          ],
        },
        domain: {
          name: "VerifiableCredential",
        },
        primaryType: "Document",
      },
      proofPurpose: "assertionMethod",
      verificationMethod: "did:ethr:0xd6f8d6ca86aa01e551a311d670a0d1bd8577e5fb#controller",
    },
    issuer: "did:ethr:0xd6f8d6ca86aa01e551a311d670a0d1bd8577e5fb",
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://w3id.org/vc/status-list/2021/v1"],
    issuanceDate: "2024-09-09T19:20:01.906Z",
    expirationDate: "2024-12-08T19:20:01.906Z",
    credentialSubject: {
      id: "did:pkh:eip155:1:0x0636F974D29d947d4946b2091d769ec6D2d415DE",
      hash: "v0.0.0:ymd16bDo5s725oPIBtT4mHgF5W6PJNjasqDJ8r801Jk=",
      "@context": {
        hash: "https://schema.org/Text",
        provider: "https://schema.org/Text",
      },
      provider: "Linkedin",
    },
  },
};

// The signature from the JSON
const signature = originalDocument.credential.proof.proofValue;

const types = originalDocument.credential.proof.eip712Domain.types;
const message = {
  ...originalDocument.credential,
};

// @ts-ignore
delete message.proof.eip712Domain;

// Recover the signer's address
const recoveredAddress = ethers.utils.verifyTypedData(domain, types, message, signature);

const splitSignature = ethers.utils.splitSignature(signature);

console.log("Recovered signer address:", recoveredAddress, { splitSignature });
