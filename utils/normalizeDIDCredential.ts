import { CredentialSubjectStruct, DocumentStruct, ProofStruct } from "../types";

export interface DIDCredential {
  "@context": string[];
  type?: string[] | null;
  credentialSubject: CredentialSubject;
  issuer: string;
  issuanceDate: string;
  proof: Proof;
  expirationDate: string;
}
export interface CredentialSubject {
  id: string;
  provider: string;
  hash: string;
  "@context": {
    hash: string;
    provider: string;
  };
}
export interface Proof {
  "@context": string;
  type: string;
  proofPurpose: string;
  proofValue: string;
  verificationMethod: string;
  created: string;
  eip712Domain: Eip712Domain;
}
export interface Eip712Domain {
  domain: Domain;
  primaryType: string;
  types: Types;
}
export interface Domain {
  name: string;
}
export interface Types {
  CredentialSubject?: CredentialSubjectEntityOrDocumentEntityOrEIP712DomainEntityOrProofEntity[] | null;
  Document?: CredentialSubjectEntityOrDocumentEntityOrEIP712DomainEntityOrProofEntity[] | null;
  EIP712Domain?: CredentialSubjectEntityOrDocumentEntityOrEIP712DomainEntityOrProofEntity[] | null;
  Proof?: CredentialSubjectEntityOrDocumentEntityOrEIP712DomainEntityOrProofEntity[] | null;
}
export interface CredentialSubjectEntityOrDocumentEntityOrEIP712DomainEntityOrProofEntity {
  name: string;
  type: string;
}

export const normalizeDIDCredential = (credential: DIDCredential): DocumentStruct => {
  const transformKeys = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(transformKeys);
    }

    if (typeof obj !== "object" || obj === null) {
      return obj;
    }

    const transformed: any = {};

    for (const [key, value] of Object.entries(obj)) {
      let newKey = key;
      let newValue = value;

      switch (key) {
        case "@context":
          newKey = "_context";
          break;
        case "hash":
          newKey = "_hash";
          break;
        case "type":
          newKey = "_type";
          break;
      }

      transformed[newKey] = transformKeys(newValue);
    }

    return transformed;
  };

  return transformKeys({ ...credential });
};
