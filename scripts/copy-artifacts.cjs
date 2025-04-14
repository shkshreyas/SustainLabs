const fs = require('fs');
const path = require('path');

// Source artifact file
const artifactPath = path.join(__dirname, '../artifacts/src/contracts/EnergyMarketplace.sol/EnergyMarketplace.json');

// Destination directory and file
const destDir = path.join(__dirname, '../src/contracts');
const destFile = path.join(destDir, 'EnergyMarketplace.json');

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

// Read and parse the artifact file
const artifact = require(artifactPath);

// Extract only the ABI and address
const minifiedArtifact = {
    abi: artifact.abi,
    address: process.env.REACT_APP_MARKETPLACE_CONTRACT_ADDRESS || ''
};

// Write the minified artifact to the destination
fs.writeFileSync(
    destFile,
    JSON.stringify(minifiedArtifact, null, 2)
);

console.log('Contract artifacts copied successfully!'); 