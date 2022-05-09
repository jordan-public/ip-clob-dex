// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const FTSwap = await hre.ethers.getContractFactory("FTSwap");
  const ftSwap = await FTSwap.deploy();
  await ftSwap.deployed();
  console.log("FTSwap deployed to:", ftSwap.address);

  const HouseNFT = await hre.ethers.getContractFactory("NFT");
  const houseNFT = await HouseNFT.deploy("House", "HOUSE", "https://img.icons8.com/color/48/000000/cottage.png");
  await houseNFT.deployed();
  console.log("HouseNFT deployed to:", houseNFT.address);

  const T1 = await hre.ethers.getContractFactory("FT");
  const t1 = await T1.deploy("Token 1", "T1", "1000000000000000000000");
  await t1.deployed();
  console.log("Token 1 deployed to:", t1.address);

  const T2 = await hre.ethers.getContractFactory("FT");
  const t2 = await T2.deploy("Token 1", "T1", "1000000000000000000000");
  await t2.deployed();
  console.log("Token 2 deployed to:", t2.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
