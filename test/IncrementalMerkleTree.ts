import { ethers } from "hardhat";
import { expect } from "chai";

import * as circom from "circomlibjs"

import { IncrementalMerkleTree, IncrementalMerkleTree__factory } from "../src/types";
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import DIDKitSignedCredential from "../mocks/DIDKitSignedCredential.json";

import { ChildNodes, SparseMerkleTree } from "@zk-kit/sparse-merkle-tree"

import sha256 from "crypto-js/sha256"
import { IncrementalMerkleTree as IncrementalMerkleTreeJS } from "@zk-kit/incremental-merkle-tree"

export async function createTree(depth: number, numberOfNodes = 0, arity = 2, zeroValue = BigInt(0)): Promise<IncrementalMerkleTreeJS> {

  const poseidon = await circom.buildPoseidon()
  const tree = new IncrementalMerkleTreeJS(poseidon, depth, zeroValue, arity)

  // for (let i = 0; i < numberOfNodes; i += 1) {
  //     tree.insert(i + 1)
  // }

  return tree
}

describe("IncrementalMerkleTree", function () {
  let signer: SignerWithAddress;
  let submitter: SignerWithAddress;
  let incrementalMerkleTree: IncrementalMerkleTree;
  beforeEach(async function () {
    const signers = await ethers.getSigners();
    signer = signers[0];
    submitter = signers[1];
  })

  it("should append value to merkle tree", async function () {
    ///////////////
    // Setup Contracts
    /////////////
    const poseidonT3ABI = circom.poseidonContract.generateABI(2)
    const poseidonT3Bytecode = circom.poseidonContract.createCode(2)

    const PoseidonLibT3Factory = new ethers.ContractFactory(poseidonT3ABI, poseidonT3Bytecode, signer)
    const poseidonT3Lib = await PoseidonLibT3Factory.deploy()

    await poseidonT3Lib.deployed()

    console.info(`PoseidonT3 library has been deployed to: ${poseidonT3Lib.address}`)

    const IncrementalBinaryTreeLibFactory = await ethers.getContractFactory("IncrementalBinaryTree", {
      libraries: {
          PoseidonT3: poseidonT3Lib.address
      }
    })
    const incrementalBinaryTreeLib = await IncrementalBinaryTreeLibFactory.deploy()

    await incrementalBinaryTreeLib.deployed()

    const incrementalMerkleTreeFactory = <IncrementalMerkleTree__factory>await ethers.getContractFactory("IncrementalMerkleTree", {
      libraries: {
        IncrementalBinaryTree: incrementalBinaryTreeLib.address
      }
    });
    incrementalMerkleTree = <IncrementalMerkleTree>await incrementalMerkleTreeFactory.connect(signer).deploy();

    await incrementalMerkleTree.deployed();




    ///////////////
    // CRUD Tree
    /////////////
    const treeId = ethers.utils.formatBytes32String("Twitter")
    const depth = 25;
    const createdTree = await incrementalMerkleTree.createTree(treeId, depth)

    console.log({ createTree })
    const tree = await createTree(depth)

    await expect(createdTree).to.emit(incrementalMerkleTree, "TreeCreated").withArgs(treeId, depth)

    const hash0 = "v0.0.0:AjcRjxx7Hp3PKPSNwPeBJjR21pLyA14CVeQ1XijzxUc="
    const hash1 = "v0.0.0:AAAAAAA7Hp3PKPSNwPeBJjR21pLyA14CVeQ1XijzxUc="

    const leaf0 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(hash0))
    const leaf1 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(hash1))

    
    // append leaf0
    const appendLeaf = await incrementalMerkleTree.insertLeaf(treeId, leaf0)
    tree.insert(leaf0)
    const treeRoot = await incrementalMerkleTree.trees(treeId)
    await expect(appendLeaf).to.emit(incrementalMerkleTree, "LeafInserted").withArgs(treeId, leaf0, treeRoot.root)

    // append leaf1
    const appendLeaf1 = await incrementalMerkleTree.insertLeaf(treeId, leaf1)
    tree.insert(leaf1)
    const treeRoot1 = await incrementalMerkleTree.trees(treeId)
    await expect(appendLeaf1).to.emit(incrementalMerkleTree, "LeafInserted").withArgs(treeId, leaf1, treeRoot1.root)

    const hash2 = "v0.0.0:BBBBBBB7Hp3PKPSNwPeBJjR21pLyA14CVeQ1XijzxUc="
    const leaf2 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(hash2))

    // tree.update(leaf0, leaf2)

    const { pathIndices, siblings } = tree.createProof(0)

    console.log({ pathIndices, siblings })

    const updatedLeaf = await incrementalMerkleTree.updateLeaf(
        treeId,
        leaf0,
        leaf2,
        siblings.map((s) => s[0]),
        pathIndices
    )

  });
});