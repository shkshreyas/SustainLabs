const hre = require("hardhat");

async function main() {
  console.log("Deploying EnergyMarketplace contract...");

  const EnergyMarketplace = await hre.ethers.getContractFactory("EnergyMarketplace");
  const marketplace = await EnergyMarketplace.deploy();

  await marketplace.deployed();

  console.log("EnergyMarketplace deployed to:", marketplace.address);

  // Add some initial packages for testing
  const price = hre.ethers.utils.parseEther("0.1");
  const energyAmount = 1000;
  const validityPeriod = 7 * 24 * 60 * 60; // 7 days in seconds

  await marketplace.listPackage(
    price,
    energyAmount,
    true,
    validityPeriod,
    "AI-Powered Load Balancing"
  );

  console.log("Added initial package");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 