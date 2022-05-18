import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import { Button, Tooltip, Drawer, Typography } from "antd";
import Image from "next/image";
import { useGlobalState } from "../context";
import { useRouter } from "next/router";
import TransactionLayout from "../components/TransactionLayout";
import { refreshBalance, handleAirdrop } from "../utils";
import { ArrowRightOutlined, LoadingOutlined } from "@ant-design/icons";
import {
  Dashboard,
  Airdrop,
  Question,
} from "../styles/StyledComponents.styles";
import * as web3 from "@solana/web3.js";
import { programs, Connection } from '@metaplex/js';
const { Metadata } = programs.metadata;
import axios from 'axios';

const { Paragraph } = Typography;

const Wallet: NextPage = () => {
  const { network, account, balance, setBalance } = useGlobalState();
  const [visible, setVisible] = useState<boolean>(false);
  const [airdropLoading, setAirdropLoading] = useState<boolean>(false);
  const [nfts, setNFTs] = useState<any>([]);
  const router = useRouter();

  useEffect(() => {
    const getMetaData = async () => {
      let connection = new web3.Connection(web3.clusterApiUrl("mainnet-beta"));
      const MY_PUBLIC_KEY = "ATGGM8x2z4Jo8zVudirSgEyZumwei3zJEP9gz9bYwXu8";
      const deGodOwnedMetadata = await Metadata.findDataByOwner(
        connection,
        MY_PUBLIC_KEY
      );
      // Get all the collections first
      // let collectionKeys = [];
      // let collections = []

      // deGodOwnedMetadata.forEach((metadata) => {
      //   const collectionKey = metadata.collection.key
      //   if (!collections.includes(collectionKey)) {
      //     await Metadata.fi
      //     collections.push(metadata.data.collection);
      //   }
      // })

      const enhancedDeGodOwnedMetadata = await Promise.all(deGodOwnedMetadata.map(async function(metadata){
        const data = await axios.get(metadata.data.uri)
        return data.data
      }))
      setNFTs(enhancedDeGodOwnedMetadata);
    }
    getMetaData()
  }, [account])

  useEffect(() => {
    if (!account) {
      router.push("/");
      return;
    }
    refreshBalance(network, account)
      .then((updatedBalance) => {
        setBalance(updatedBalance);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [account, router, network]);

  const airdrop = async () => {
    setAirdropLoading(true);
    const updatedBalance = await handleAirdrop(network, account);
    if (typeof updatedBalance === "number") {
      setBalance(updatedBalance);
    }
    setAirdropLoading(false);
    console.log(account?.secretKey.toString())
  };

  const showModal = () => {
    setVisible(true);
  };

  const handleClose = () => {
    setVisible(false);
  };

  const displayAddress = (address: string) =>
    `${address.slice(0, 4)}...${address.slice(-4)}`;

  return (
    <>
      {account && (
        <Dashboard>
          <h1>Dashboard</h1>

          <Paragraph
            copyable={{ text: account.publicKey.toString(), tooltips: `Copy` }}
          >
            {`Account: ${displayAddress(account.publicKey.toString())}`}
          </Paragraph>

          <p>
            Connected to{" "}
            {network &&
              (network === "mainnet-beta"
                ? network.charAt(0).toUpperCase() + network.slice(1, 7)
                : network.charAt(0).toUpperCase() + network.slice(1))}
          </p>
          {airdropLoading ? (
            <h2>
              <LoadingOutlined spin />
            </h2>
          ) : (
            <div className="flex-box">
              <h2>Your Balance</h2>
              <h2>
                {balance} <span>SOL</span>
              </h2>
            </div>
          )}

          <div className="flex-box" style={{flexDirection: 'row', marginBottom: '1rem' }}>
            {network === "devnet" && account && (
              <div className='flex-box' style={{ paddingRight: '.5rem'}}>
                <Airdrop onClick={airdrop}>Airdrop</Airdrop>
                <Tooltip
                  title="Click to receive 1 devnet SOL into your account"
                  placement={"right"}
                >
                  <Question>?</Question>
                </Tooltip>
              </div>
            )}

            <Button type="primary" onClick={showModal}>
              Transfer SOL <ArrowRightOutlined />
            </Button>
          </div>
          {/* Should say your collections and show collections instead*/}
          {/* After you view a collection, you should be able to message all people that own 
          an nft in the collection */}
          <h2>Your NFTs</h2>
          <div className="flex-box" style={{flexWrap: 'wrap', flexDirection: 'row'}}>
            {nfts.map((nft, i) => 
              <div key={i}>
                <Image width={200} height={200} alt="picture of nft" src={nft.image}/>
                <h3>Name: {nft.name}</h3>
              </div>
            )}
          </div>

          <Drawer
            title="Send Funds"
            placement="bottom"
            onClose={handleClose}
            visible={visible}
            height={"55vh"}
          >
            <TransactionLayout />
          </Drawer>
        </Dashboard>
      )}
    </>
  );
};

export default Wallet;
