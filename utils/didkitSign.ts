import * as DIDKit from "@spruceid/didkit-wasm-node";

const JWK = '{"kty":"EC","crv":"secp256k1","x":"PdB2nS-knyAxc6KPuxBr65vRpW-duAXwpeXlwGJ03eU","y":"MwoGZ08hF5uv-_UEC9BKsYdJVSbJNHcFhR1BZWer5RQ","d":"z9VrSNNZXf9ywUx3v_8cLDhSw8-pvAT9qu_WZmqqfWM"}'
const did = DIDKit.keyToDID("ethr", JWK);

console.log("did", did);
const credentialInput = {
    "type": [
        "VerifiableCredential"
    ],
    "issuer": did,
    "@context":
        "https://www.w3.org/2018/credentials/v1"
    ,
    "issuanceDate": "2022-07-19T10:42:24.883Z",
    "expirationDate": "2022-10-17T10:42:24.883Z",
    "credentialSubject": {
        "id": "did:pkh:eip155:1:0x12FeD9f987bc340c6bE43fD80aD641E8cD740682",
        "hash": "v0.0.0:AjcRjxx7Hp3PKPSNwPeBJjR21pLyA14CVeQ1XijzxUc=",
        "provider": "Twitter"
    }
}


const options = { "type": "EthereumEip712Signature2021" }

export const prepareCredential = DIDKit.prepareIssueCredential(
    JSON.stringify(credentialInput, undefined, 2), JSON.stringify(options, undefined, 2), JWK
).then(function (prepareCredential) {
    console.log("PREPARE ISSUE CREDENTIAL");
    console.log("===============");
    console.log(prepareCredential);
    console.log("===============");
    const credential = DIDKit.issueCredential(
        JSON.stringify(credentialInput, undefined, 2), JSON.stringify(options, undefined, 2), JWK
    ).then(function (credential) {
        console.log("CREDENTIAL");
        console.log("===============");
        console.log(credential);
        console.log("!!!!!!===============");
    }).catch(function (error) {
        console.log("ERROR:", error)
    });
}).catch(function (error) {
    console.log("ERROR:", error)
});

const preparedCredential = {
	"proof": {
		"@context": "https://w3id.org/security/suites/eip712sig-2021/v1",
		"type": "EthereumEip712Signature2021",
		"proofPurpose": "assertionMethod",
		"verificationMethod": "did:ethr:0xd6fc34345bc8c8e5659a35bed9629d5558d48c4e#controller",
		"created": "2022-10-17T15:28:22.404Z"
	},
	"jwsHeader": null,
	"signingInput": {
		"types": {
			"EIP712Domain": [{
				"type": "string",
				"name": "name"
			}],
			"CredentialSubject": [{
				"type": "string",
				"name": "hash"
			}, {
				"type": "string",
				"name": "id"
			}, {
				"type": "string",
				"name": "provider"
			}],
			"Proof": [{
				"type": "string",
				"name": "@context"
			}, {
				"type": "string",
				"name": "created"
			}, {
				"type": "string",
				"name": "proofPurpose"
			}, {
				"type": "string",
				"name": "type"
			}, {
				"type": "string",
				"name": "verificationMethod"
			}],
			"Document": [{
				"type": "string",
				"name": "@context"
			}, {
				"type": "CredentialSubject",
				"name": "credentialSubject"
			}, {
				"type": "string",
				"name": "expirationDate"
			}, {
				"type": "string",
				"name": "issuanceDate"
			}, {
				"type": "string",
				"name": "issuer"
			}, {
				"type": "Proof",
				"name": "proof"
			}, {
				"type": "string[]",
				"name": "type"
			}]
		},
		"primaryType": "Document",
		"domain": {},
		"message": {
			"@context": "https://www.w3.org/2018/credentials/v1",
			"credentialSubject": {
				"hash": "v0.0.0:AjcRjxx7Hp3PKPSNwPeBJjR21pLyA14CVeQ1XijzxUc=",
				"id": "did:pkh:eip155:1:0x12FeD9f987bc340c6bE43fD80aD641E8cD740682",
				"provider": "Twitter"
			},
			"expirationDate": "2022-10-17T10:42:24.883Z",
			"issuanceDate": "2022-07-19T10:42:24.883Z",
			"issuer": "did:ethr:0xd6fc34345bc8c8e5659a35bed9629d5558d48c4e",
			"proof": {
				"@context": "https://w3id.org/security/suites/eip712sig-2021/v1",
				"created": "2022-10-17T15:28:22.404Z",
				"proofPurpose": "assertionMethod",
				"type": "EthereumEip712Signature2021",
				"verificationMethod": "did:ethr:0xd6fc34345bc8c8e5659a35bed9629d5558d48c4e#controller"
			},
			"type": ["VerifiableCredential"]
		}
	}
}

const signedCredential = {
	"@context": "https://www.w3.org/2018/credentials/v1",
	"type": ["VerifiableCredential"],
	"credentialSubject": {
		"id": "did:pkh:eip155:1:0x12FeD9f987bc340c6bE43fD80aD641E8cD740682",
		"provider": "Twitter",
		"hash": "v0.0.0:AjcRjxx7Hp3PKPSNwPeBJjR21pLyA14CVeQ1XijzxUc="
	},
	"issuer": "did:ethr:0xd6fc34345bc8c8e5659a35bed9629d5558d48c4e",
	"issuanceDate": "2022-07-19T10:42:24.883Z",
	"proof": {
		"@context": "https://w3id.org/security/suites/eip712sig-2021/v1",
		"type": "EthereumEip712Signature2021",
		"proofPurpose": "assertionMethod",
		"proofValue": "0x02ec8aff8d9bcc709f919d57845aed08a88f634d272357a5cef6419cc2f22f6a17878341268f10e217ec756ec4ff7278eedbc5e38d7fe673a096ca1eac2cfe8e1c",
		"verificationMethod": "did:ethr:0xd6fc34345bc8c8e5659a35bed9629d5558d48c4e#Eip712Method2021",
		"created": "2022-10-17T15:28:22.404Z"
	},
	"expirationDate": "2022-10-17T10:42:24.883Z"
}

console.log({ preparedCredential, signedCredential })
