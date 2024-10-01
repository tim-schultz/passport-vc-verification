// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { VcVerifier } from "./VCVerifier.sol";
import { DIDpkhAdapter } from "./DIDpkhAdapter.sol";
import { AttestationStation } from "./AttestationStation.sol";
import "hardhat/console.sol";

struct CredentialSubjectContext {
    string _hash;
    string provider;
}

struct CredentialSubject {
    CredentialSubjectContext _context;
    string _hash;
    string id;
    string provider;
}

struct Proof {
    // underscored since @ is not valid for struct member
    string _context;
    string created;
    string proofPurpose;
    // underscored since typoe is a reserved keyword
    string _type;
    string verificationMethod;
}

struct Document {
    string[] _context;
    CredentialSubject credentialSubject;
    string expirationDate;
    string issuanceDate;
    string issuer;
    Proof proof;
    string[] _type;
}

contract DIDStampVcVerifier is VcVerifier, DIDpkhAdapter {
    bytes32 private constant PROOF_TYPE_HASH =
        keccak256("Proof(string @context,string created,string proofPurpose,string type,string verificationMethod)");

    bytes32 private constant CONTEXT_TYPEHASH = keccak256("CredentialSubjectContext(string hash,string provider)");

    bytes32 private constant CREDENTIAL_SUBJECT_TYPEHASH =
        keccak256(
            "CredentialSubject(CredentialSubjectContext @context,string hash,string id,string provider)CredentialSubjectContext(string hash,string provider)"
        );

    bytes32 private constant DOCUMENT_TYPEHASH =
        keccak256(
            "Document(string[] @context,CredentialSubject credentialSubject,string expirationDate,string issuanceDate,string issuer,Proof proof,string[] type)Proof(string @context,string created,string proofPurpose,string type,string verificationMethod)CredentialSubjectContext(string hash,string provider)CredentialSubject(CredentialSubjectContext @context,string hash,string id,string provider)"
        );

    address public _verifier;
    address public _attestationStation;

    AttestationStation.AttestationData[] public _attestations;

    event Verified(string indexed id, string iamHash, string provider);

    mapping(string => string) public verifiedStamps;

    constructor(string memory domainName, address verifier, address attestationStation) VcVerifier(domainName) {
        _verifier = verifier;
        _attestationStation = attestationStation;
    }

    function hasCredentialContext(CredentialSubjectContext calldata context) public view returns (bytes32) {
        console.log("Context hash: ", context._hash);
        console.log("Provider hash: ", context.provider);
        // Context(string hash,string provider)
        return
            keccak256(
                abi.encode(CONTEXT_TYPEHASH, keccak256(bytes(context._hash)), keccak256(bytes(context.provider)))
            );
    }

    function hashCredentialSubject(CredentialSubject calldata subject) public view returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    CREDENTIAL_SUBJECT_TYPEHASH,
                    // CredentialSubject(Context @context,string hash,string id,string provider)Context(string hash,string provider)
                    hasCredentialContext(subject._context),
                    keccak256(bytes(subject._hash)),
                    keccak256(bytes(subject.id)),
                    keccak256(bytes(subject.provider))
                )
            );
    }

    function hashCredentialProof(Proof calldata proof) public pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    PROOF_TYPE_HASH,
                    // Proof(string @context,string created,string proofPurpose,string type,string verificationMethod)
                    keccak256(bytes(proof._context)),
                    keccak256(bytes(proof.created)),
                    keccak256(bytes(proof.proofPurpose)),
                    keccak256(bytes(proof._type)),
                    keccak256(bytes(proof.verificationMethod))
                )
            );
    }

    function hashDocument(Document calldata document) public view returns (bytes32) {
        bytes32 credentialSubjectHash = hashCredentialSubject(document.credentialSubject);
        bytes32 proofHash = hashCredentialProof(document.proof);

        return
            keccak256(
                abi.encode(
                    DOCUMENT_TYPEHASH,
                    // "Document(string[] @context,CredentialSubject credentialSubject,string expirationDate,string issuanceDate,string issuer,Proof proof,string[] type)CredentialSubject(Context @context,string _hash,string id,string provider)Context(string hash,string provider)Proof(string @context,string created,string proofPurpose,string type,string verificationMethod)"
                    _hashArray(document._context),
                    credentialSubjectHash,
                    keccak256(bytes(document.expirationDate)),
                    keccak256(bytes(document.issuanceDate)),
                    keccak256(bytes(document.issuer)),
                    proofHash,
                    _hashArray(document._type)
                )
            );
    }

    function verifyStampVc(Document calldata document, uint8 v, bytes32 r, bytes32 s) public returns (bool) {
        bytes32 vcHash = hashDocument(document);
        bytes32 digest = ECDSA.toTypedDataHash(DOMAIN_SEPARATOR, vcHash);

        address issuerAddress = DIDpkhAdapter.pseudoResolveDidIssuer(document.issuer);

        address recoveredAddress = ECDSA.recover(digest, v, r, s);

        console.log("Recovered address: ", recoveredAddress);
        console.log("Issuer address: ", issuerAddress);

        // Here we could check the issuer's address against an on-chain registry.
        // We could provide a verifying contract address when signing the credential which could correspond to this contract
        require(recoveredAddress == issuerAddress, "VC verification failed issuer does not match signature");

        verifiedStamps[document.credentialSubject.id] = document.credentialSubject._hash;

        emit Verified(
            document.credentialSubject.id,
            document.credentialSubject._hash,
            document.credentialSubject.provider
        );

        AttestationStation attestationStation = AttestationStation(_attestationStation);
        AttestationStation.AttestationData memory attestation = AttestationStation.AttestationData(
            msg.sender,
            "Verified",
            "yes"
        );
        _attestations.push(attestation);

        attestationStation.attest(_attestations);
        return true;
    }
}
