// import { createCredential } from "../utils/didkitSign"
import { ethers } from "hardhat";
import { expect } from "chai";
import { DocumentStruct } from "../types"
import { DIDStampVcVerifier, DIDStampVcVerifier__factory } from "../src/types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { ChildNodes, SparseMerkleTree } from "@zk-kit/sparse-merkle-tree"
import sha256 from "crypto-js/sha256"

const domainName = "Passport";

import DIDKitSignedCredential from "../mocks/DIDKitSignedCredential.json";

import { normalizeDIDCredential } from "../utils/normalizeDIDCredential";

const hash = (childNodes: ChildNodes) => sha256(childNodes.join("")).toString()
const tree = new SparseMerkleTree(hash)

describe("DIDStampVCVerifier", function () {
  let signer: SignerWithAddress;
  let submitter: SignerWithAddress;
  let didStampVCVerifier: DIDStampVcVerifier;

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    signer = signers[0];
    submitter = signers[1];
  })

  it("should verify a didkit issued VC using the DIDStampVcVerifier smart contract", async function () {
    const stampVcVerifierFactory = <DIDStampVcVerifier__factory>await ethers.getContractFactory("DIDStampVcVerifier");
    didStampVCVerifier = <DIDStampVcVerifier>await stampVcVerifierFactory.connect(signer).deploy(domainName, signer.address);

    await didStampVCVerifier.deployed();

    const { v, r, s } = ethers.utils.splitSignature(DIDKitSignedCredential.proof.proofValue);

    const normalizedDIDCredential = normalizeDIDCredential(DIDKitSignedCredential) as DocumentStruct;

    const { id, _hash, provider } = normalizedDIDCredential.credentialSubject;

    await expect(await didStampVCVerifier.connect(submitter).verifyStampVc(normalizedDIDCredential, v, r, s)).to.emit(
      didStampVCVerifier,
      "Verified",
    ).withArgs(id, _hash, provider);
  });
})
