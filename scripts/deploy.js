// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const fs = require("fs")
const BigNumber = require('ethers');

function to18DecimalString(n) {
  return BigNumber.from(n).mul(BigNumber.from(10).pow(18)).toString();
}

function updateDeplFile(filepath, contract) {
  let text;
  try {
    text = fs.readFileSync(filepath, 'utf8')
  } catch(e) {
    text = '{}'
  }
  data = JSON.parse(text);
  data[contract.deployTransaction.chainId] = contract;
  fs.writeFile(filepath, JSON.stringify(data, undefined, 2), (err) => { if (err) console.error(err) });
}

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const [owner, trader] = await hre.ethers.getSigners();

  // We get the contract to deploy
  const FTSwap = await hre.ethers.getContractFactory("FTSwap");
  const ftSwap = await FTSwap.deploy();
  await ftSwap.deployed();
  updateDeplFile("deployed/FTSwap.json", ftSwap);
  console.log("FTSwap deployed to:", ftSwap.address);

  // We get the contract to deploy
  const FlashMatch = await hre.ethers.getContractFactory("FlashMatch");
  const flashMatch = await FlashMatch.deploy(ftSwap.address);
  await flashMatch.deployed();
  updateDeplFile("deployed/FlashMatch.json", flashMatch);
  console.log("FlashMatch deployed to:", flashMatch.address);

  // We get the contract to deploy
  const FlashSwapAMM = await hre.ethers.getContractFactory("FlashSwapAMM");
  const flashSwapAMM = await FlashSwapAMM.deploy(ftSwap.address);
  await flashSwapAMM.deployed();
  updateDeplFile("deployed/FlashSwapAMM.json", flashSwapAMM);
  console.log("FlashSwapAMM deployed to:", flashSwapAMM.address);

  const T1 = await hre.ethers.getContractFactory("FT");
  const t1 = await T1.deploy("Token 1", "T1", "1000000000000000000000");
  await t1.deployed();
  updateDeplFile("deployed/Token1.json", t1);
  console.log("Token 1 deployed to:", t1.address);

  const T2 = await hre.ethers.getContractFactory("FT");
  const t2 = await T2.deploy("Token 2", "T2", "1000000000000000000000");
  await t2.deployed();
  updateDeplFile("deployed/Token2.json", t2);
  console.log("Token 2 deployed to:", t2.address);

  await (await t1.connect(owner).transfer(trader.address, "500000000000000000000")).wait();
  await (await t2.connect(owner).transfer(trader.address, "500000000000000000000")).wait();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
