// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./SaarthiCoin.sol";

contract ProjectRegistry is Ownable {
    SaarthiCoin public token;

    enum Status { Pending, Verified }

    struct Project {
        address farmer;
        string projectType;
        string offChainHash;
        Status status;
    }

    Project[] public projects;
    mapping(address => bool) public isFarmer;
    mapping(address => bool) public isVerifier;

    event FarmerRegistered(address farmer);
    event VerifierAdded(address verifier);
    event ProjectCreated(uint indexed projectId, address farmer);
    event ProjectVerified(uint indexed projectId, address farmer, uint256 amount);

    constructor(address tokenAddress)
        Ownable(msg.sender)   // <<< FIX HERE
    {
        token = SaarthiCoin(tokenAddress);
    }

    function registerFarmer() external {
        require(!isFarmer[msg.sender], "Already registered");
        isFarmer[msg.sender] = true;
        emit FarmerRegistered(msg.sender);
    }

    function addVerifier(address v) external onlyOwner {
        isVerifier[v] = true;
        emit VerifierAdded(v);
    }

    function createProject(string calldata projectType, string calldata offChainHash) external {
        require(isFarmer[msg.sender], "Not farmer");

        projects.push(Project(msg.sender, projectType, offChainHash, Status.Pending));
        emit ProjectCreated(projects.length - 1, msg.sender);
    }

    function verifyAndMint(uint projectId, uint amount) external {
        require(isVerifier[msg.sender], "Not validator");

        Project storage p = projects[projectId];
        require(p.status == Status.Pending, "Already verified");

        p.status = Status.Verified;
        token.mintToFarmer(p.farmer, amount);
        emit ProjectVerified(projectId, p.farmer, amount);
    }

    function getProjectsCount() external view returns(uint) {
        return projects.length;
    }
}
