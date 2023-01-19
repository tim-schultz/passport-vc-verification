// import { createCredential } from "../utils/didkitSign"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

import DIDKitSignedCredential from "../mocks/DIDKitSignedCredential.json";
import {
  AttestationStation,
  AttestationStation__factory,
  DIDStampVcVerifier,
  DIDStampVcVerifier__factory,
} from "../src/types";
import { DocumentStruct } from "../types";
import { normalizeDIDCredential } from "../utils/normalizeDIDCredential";

const domainName = "Passport";

describe("DIDStampVCVerifier", function () {
  let signer: SignerWithAddress;
  let submitter: SignerWithAddress;
  let didStampVCVerifier: DIDStampVcVerifier;

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    signer = signers[0];
    submitter = signers[1];
  });

  it("should verify a didkit issued VC using the DIDStampVcVerifier smart contract", async function () {
    const atteststationStation = <AttestationStation__factory>await ethers.getContractFactory("AttestationStation");
    const attestationStation = <AttestationStation>await atteststationStation.connect(signer).deploy();

    await attestationStation.deployed();

    const stampVcVerifierFactory = <DIDStampVcVerifier__factory>await ethers.getContractFactory("DIDStampVcVerifier");
    didStampVCVerifier = <DIDStampVcVerifier>(
      await stampVcVerifierFactory.connect(signer).deploy(domainName, signer.address, attestationStation.address)
    );

    await didStampVCVerifier.deployed();

    const { v, r, s } = ethers.utils.splitSignature(DIDKitSignedCredential.proof.proofValue);

    const normalizedDIDCredential = normalizeDIDCredential(DIDKitSignedCredential) as DocumentStruct;

    await expect(await didStampVCVerifier.connect(submitter).verifyStampVc(normalizedDIDCredential, v, r, s)).to.emit(
      didStampVCVerifier,
      "Verified",
    );
  });

  it("should call the make an attestation on the attestation contract if signature is valid", async function () {
    const atteststationStation = <AttestationStation__factory>await ethers.getContractFactory("AttestationStation");
    const attestationStation = <AttestationStation>await atteststationStation.connect(signer).deploy();

    console.log(attestationStation.address, "attestationStation.address");

    await attestationStation.deployed();

    const stampVcVerifierFactory = <DIDStampVcVerifier__factory>await ethers.getContractFactory("DIDStampVcVerifier");
    didStampVCVerifier = <DIDStampVcVerifier>(
      await stampVcVerifierFactory.connect(signer).deploy(domainName, signer.address, attestationStation.address)
    );

    console.log(didStampVCVerifier.address, "didStampVCVerifier.address");

    await didStampVCVerifier.deployed();

    const { v, r, s } = ethers.utils.splitSignature(DIDKitSignedCredential.proof.proofValue);

    const normalizedDIDCredential = normalizeDIDCredential(DIDKitSignedCredential) as DocumentStruct;

    await expect(await didStampVCVerifier.connect(submitter).verifyStampVc(normalizedDIDCredential, v, r, s)).to.emit(
      attestationStation,
      "AttestationCreated",
    );
  });
});
