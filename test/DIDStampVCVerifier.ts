// import { createCredential } from "../utils/didkitSign"
import { ethers } from "hardhat";

import { DIDStampVcVerifier, DIDStampVcVerifier__factory, DocumentStruct } from "../src/types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const domainName = "stamp-vc-verifier-test";

import DIDKitSignedCredential from "../mocks/DIDKitSignedCredential.json";
// import DIDKitPreparedCredential from "../mocks/DIDKitPreparedCredential.json";

import { normalizeDIDCredential } from "../utils/normalizeDIDCredential";

describe.only("StampVCVerifier", function () {
  let signer: SignerWithAddress;
  let submitter: SignerWithAddress;
  // let chainId: number;
  let didStampVCVerifier: DIDStampVcVerifier;

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    signer = signers[0];
    submitter = signers[1];

    // chainId = (await ethers.provider.getNetwork()).chainId;
  })
// export type { DIDStampVcVerifier, DocumentStruct, CredentialSubjectStruct, ProofStruct } from "./DIDStampVCVerifier.sol/DIDStampVcVerifier";
  it("should verify a didkit issued VC using the DIDStampVcVerifier smart contract", async function () {
    const stampVcVerifierFactory = <DIDStampVcVerifier__factory>await ethers.getContractFactory("DIDStampVcVerifier");
    didStampVCVerifier = <DIDStampVcVerifier>await stampVcVerifierFactory.connect(signer).deploy(domainName, signer.address);

    await didStampVCVerifier.deployed();

    const { v, r, s } = ethers.utils.splitSignature(DIDKitSignedCredential.proof.proofValue);

    const normalizedDIDCredential = normalizeDIDCredential(DIDKitSignedCredential) as DocumentStruct;

    console.log({ normalizedDIDCredential })

    await didStampVCVerifier.connect(submitter).verifyStampVc(normalizedDIDCredential, v, r, s);
  });
})
