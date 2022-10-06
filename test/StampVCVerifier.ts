import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ContractTransaction } from "ethers";
import { ethers } from "hardhat";

import passportDocument from "../mocks/passportCredential.json";
import { StampVcVerifier, StampVcVerifier__factory } from "../src/types";
import { getSerializedSignedVC } from "../utils/sign";

const domainName = "stamp-vc-verifier-test";

describe("StampVCVerifier", function () {
  let signer: SignerWithAddress;
  let submitter: SignerWithAddress;
  let chainId: number;
  let stampVCVerifier: StampVcVerifier;
  // let successfulVerification: boolean;
  let result: ContractTransaction;

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    signer = signers[0];
    submitter = signers[1];

    chainId = (await ethers.provider.getNetwork()).chainId;
  });
  it("should issue and verify a valid VC", async function () {
    const stampVcVerifierFactory = <StampVcVerifier__factory>await ethers.getContractFactory("StampVcVerifier");
    stampVCVerifier = <StampVcVerifier>await stampVcVerifierFactory.connect(signer).deploy(domainName, signer.address);

    await stampVCVerifier.deployed();

    const serializedVC = await getSerializedSignedVC({
      signer,
      chainId,
      domainName,
      // Using the zero address so it's not tied to a single contract and can be verified
      // in multiple ones.
      verifyingContractAddress: ethers.constants.AddressZero,
      document: passportDocument,
    });

    console.log(`Generated serialized VC: `, JSON.stringify(serializedVC, null, 2));

    const { v, r, s } = serializedVC.proof.proofValue;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { proof, ...vcWithoutProof } = serializedVC;

    console.log({ vcWithoutProof });
    // const gasCost = await stampVCVerifier.connect(submitter).estimateGas.verifyStampVc(vcWithoutProof, v, r, s);
    await expect(stampVCVerifier.connect(submitter).verifyStampVc(vcWithoutProof, v, r, s)).to.emit(
      stampVCVerifier,
      "Verified",
    );
  });
});
