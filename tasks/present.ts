import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task } from "hardhat/config";

// import exampleDocument from "../mocks/exampleDocument.json";
import passportDocument from "../mocks/passportCredential.json";
import { StampVcVerifier, StampVcVerifier__factory } from "../src/types";
import { getSerializedSignedVC } from "../utils/sign";

import { prepareCredential } from "../utils/didkitSign";

task("present", "Present a VC that gets verified on-chain", async (_taskArgs, hre) => {
  const domainName = "stamp-vc-verifier-test";
  const chainId = hre.network.config.chainId;
  const signers: SignerWithAddress[] = await hre.ethers.getSigners();
  const signer = signers[0];

  const submitter = signers[1];

  if (!chainId) {
    throw new Error("Missing chain id");
  }

  const stampVcVerifierFactory = <StampVcVerifier__factory>await hre.ethers.getContractFactory("StampVcVerifier");
  const stampVCVerifier = <StampVcVerifier>(
    await stampVcVerifierFactory.connect(signers[0]).deploy(domainName, signer.address)
  );

  await stampVCVerifier.deployed();

  const serializedVC = await getSerializedSignedVC({
    signer,
    chainId,
    domainName,
    // Using the zero address so it's not tied to a single contract and can be verified
    // in multiple ones.
    verifyingContractAddress: hre.ethers.constants.AddressZero,
    document: passportDocument,
  });

  console.log(`Generated serialized VC: `, JSON.stringify(serializedVC, null, 2));

  const { v, r, s } = serializedVC.proof.proofValue;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { proof, ...vcWithoutProof } = serializedVC;

  const gasCost = await stampVCVerifier.connect(submitter).estimateGas.verifyStampVc(vcWithoutProof, v, r, s);
  const result = await stampVCVerifier.connect(submitter).verifyStampVc(vcWithoutProof, v, r, s);

  console.log("Gas cost: ", gasCost.toString());
  console.log("Verification passed on-chain? ", result);
});
