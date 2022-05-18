// Import any additional classes and/or functions needed from Solana's web3.js library as you go along:
import React, { useState, ReactElement } from "react";
import { message } from "antd";
import { useGlobalState } from "../../context";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";
const converter = require("number-to-words");
import { LoadingOutlined } from "@ant-design/icons";
import { refreshBalance } from "../../utils";
import {
  CheckContainer,
  CheckImage,
  CheckFrom,
  Processed,
  CheckDate,
  RecipientInput,
  AmountInput,
  SignatureInput,
  AmountText,
  RatioText,
} from "../../styles/StyledComponents.styles";

type FormT = {
  from: string;
  to: string;
  amount: number;
  isSigned: boolean;
};

const defaultForm: FormT = {
  from: "",
  to: "",
  amount: 0,
  isSigned: false,
};

const TransactionModal = (): ReactElement => {
  const { network, account, balance, setBalance } = useGlobalState();
  const [form, setForm] = useState<FormT>(defaultForm);
  const [sending, setSending] = useState<boolean>(false);
  const [transactionSig, setTransactionSig] = useState<string>("");

  const onFieldChange = (field: string, value: string) => {
    if (field === "amount" && !!value.match(/\D+/)) {
      console.log(value);
      return;
    }

    setForm({
      ...form,
      [field]: value,
    });
  };

  // *Step 5*: implement a function that transfer funds
  const transfer = async () => {
    // This line ensures the function returns before running if no account has been set
    if (!account) return;

    try {
      
      const connection = new Connection(clusterApiUrl(network), "confirmed");

      setTransactionSig("");
      
      
      const instructions = SystemProgram.transfer({
        fromPubkey: account.publicKey,
        toPubkey: new PublicKey(form.to),
        lamports: form.amount,
      });
  
      const transaction = new Transaction().add(instructions);

      
      const signers = [{
        publicKey: account.publicKey,
        secretKey: account.secretKey,
      }];

      setSending(true);
      
      
      const confirmation = await sendAndConfirmTransaction(
        connection,
        transaction,
        signers
      );
      setTransactionSig(confirmation);
      setSending(false);

      if (network) {
        const updatedBalance = await refreshBalance(network, account);
        setBalance(updatedBalance);
        message.success(`Transaction confirmed`);
      }
      // (g) You can now delete the console.log statement since the function is implemented!
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown Error";
      message.error(
        `Transaction failed, please check your inputs: ${errorMessage}`
      );
      setSending(false);
    }
  };

  return (
    <>
      <CheckContainer>
        <CheckFrom>{`FROM: ${account?.publicKey}`}</CheckFrom>

        {transactionSig && (
          <Processed
            href={`https://explorer.solana.com/tx/${transactionSig}?cluster=devnet`}
            target="_blank"
          >
            Processed - Review on Solana Block Explorer
          </Processed>
        )}

        {/* <CheckDate>
          {new Date().toString().split(" ").slice(1, 4).join(" ")}
        </CheckDate> */}
        <CheckFrom>{`TO:`}</CheckFrom>
        <RecipientInput
          value={form.to}
          onChange={(e) => onFieldChange("to", e.target.value)}
        />
        <CheckFrom>{`Amount (in lamports):`}</CheckFrom>
        <AmountInput
          value={form.amount}
          onChange={(e) => onFieldChange("amount", e.target.value)}
        />
        <RatioText>1 SOL = 1,000,000,000 Lamports</RatioText>

        {sending ? (
          <LoadingOutlined
            style={{
              fontSize: 24,
              position: "absolute",
              top: "69%",
              left: "73%",
            }}
            spin
          />
        ) : (
          <SignatureInput
            onClick={transfer}
            disabled={
              !balance ||
              form.amount / LAMPORTS_PER_SOL > balance ||
              !form.to ||
              form.amount == 0
            }
            type="primary"
          >
            Sign and Send
          </SignatureInput>
        )}
      </CheckContainer>
    </>
  );
};

export default TransactionModal;
