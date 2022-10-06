import { ethers } from "hardhat";

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(
    `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  );

  const domainName = "stamp-vc-verifier-test";
  const StampVcVerifier = await ethers.getContractFactory("StampVcVerifier");
  const stampVcVerifier = await StampVcVerifier.deploy(domainName, "0x898d3B3756f04FDb1C9EB5c3fBD66DF8e5332f56");

  await stampVcVerifier.deployed();

  console.log("StampVerifier Contracts have been deployed", stampVcVerifier.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
