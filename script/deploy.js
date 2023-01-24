const hre = require('hardhat');

async function main(){

    const PostFactory = await hre.ethers.getContractFactory("SocialMedia")
    const postFactory = await PostFactory.deploy();

    await postFactory.deployed();

    console.log("Factory deployed to : ", postFactory.address);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    })