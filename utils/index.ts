// Import any additional classes and/or functions needed from Solana's web3.js library as you go along:
import { Cluster, clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
import { message } from "antd";

const LAMPORTS_PER_SOL = 1000000000
// *Step 3*: implement a function that gets an account's balance
const refreshBalance = async (network: Cluster | undefined, account: Keypair | null) => {
  // This line ensures the function returns before running if no account has been set
  if (!account) return 0;

  try {
  
    const connection = new Connection(clusterApiUrl(network), "confirmed");
    
    const publicKey = account.publicKey;
    
    const balance = await connection.getBalance(publicKey);

    return balance / LAMPORTS_PER_SOL;
    
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown Error";
    message.error(`Balance refresh failed: ${errorMessage}`);
    return 0;
  }
};

// *Step 4*: implement a function that airdrops SOL into devnet account
const handleAirdrop = async (network: Cluster, account: Keypair | null) => {
  // This line ensures the function returns before running if no account has been set
  if (!account) return;

  try {
    
    const connection = new Connection(clusterApiUrl(network), "confirmed");
    
    const publicKey = account.publicKey;

    const confirmation = await connection.requestAirdrop(
      publicKey,
      LAMPORTS_PER_SOL
    );

    const result = await connection.confirmTransaction(confirmation, "confirmed");

    
    return await refreshBalance(network, account);
    // (f) You can now delete the console.log statement since the function is implemented!
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown Error";
    message.error(`Airdrop failed: ${errorMessage}`);
  }
};

export { refreshBalance, handleAirdrop };
