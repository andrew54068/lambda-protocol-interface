import {
  EAS,
  SchemaEncoder,
  AttestationShareablePackageObject,
  SignedOffchainAttestation,
  PartialTypedDataConfig,
  Offchain,
} from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
import axios from "axios";
import type { SchemaItem } from "@ethereum-attestation-service/eas-sdk";
require("dotenv").config();

export interface SchemaElement {
  name: string;
  type: string;
}

// export const EASContractAddress = "0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587"; // Ethereum mainnet
export const EASContractAddress = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"; // Ethereum Sepolia

// Initialize the sdk with the address of the EAS Schema contract address
const eas = new EAS(EASContractAddress);

// Gets a default provider (in production use something else like infura/alchemy)
// const provider = ethers.InfuraProvider( // .providers.getDefaultProvider(
//     "mainnet"
// );

const infuraApiKeys = {
  projectId: "9040b2afbb0c4b2f8fe7d57f67d036ad",
  projectSecret: "3a4317a8b42f485cbd988212b2676f9d",
};

// const provider = new ethers.providers.InfuraProvider("mainnet", infuraApiKeys)
const provider = new ethers.InfuraProvider("sepolia", infuraApiKeys.projectId, infuraApiKeys.projectSecret);

// const provider =

// Your private key
const privateKey = process.env.PRIVATEKEY;
if (!privateKey) process.exit();

// Signer is an ethers.js Signer instance
// const privateKey = process.env.PRIVATEKEY || ''
console.log(privateKey);
const signer = new ethers.Wallet(privateKey, provider);

eas.connect(signer);

const generateTopicEncodeData = (schema: SchemaElement[], lambda: Lambda): SchemaItem[] => {
  return schema.map((value) => {
    return {
      value: lambda[value.name],
      ...value,
    };
  });
};

export interface Lambda {
  name: string;
  runtime_type: string;
  ipfs_cid: string;
}

export type StoreAttestationRequest = { filename: string; textJson: string };

const baseURL = "https://sepolia.easscan.org/";

export type StoreIPFSActionReturn = {
  error: null | string;
  ipfsHash: string | null;
  offchainAttestationId: string | null;
};

export async function submitSignedAttestation(pkg: AttestationShareablePackageObject) {
  const textJson = JSON.stringify(pkg, (key, value) => {
    return typeof value === "bigint" ? value.toString() : value;
  });

  const data: StoreAttestationRequest = {
    filename: `eas.txt`,
    textJson,
  };

  return await axios.post<StoreIPFSActionReturn>(`${baseURL}/offchain/store`, data);
}

const OFFCHAIN_ATTESTATION_VERSION = 1;

export const generateEAS = async (lambda: Lambda) => {
  const offchain = await eas.getOffchain();
  console.log(`offchain success`);

  // Initialize SchemaEncoder with the schema string
  const topicSchema = [
    {
      name: "name",
      type: "string",
    },
    {
      name: "runtime_type",
      type: "string",
    },
    {
      name: "ipfs_cid",
      type: "string",
    },
  ];
  const topicEncoderString = topicSchema.map((value) => `${value.type} ${value.name}`).join(", ");
  // const schemaEncoder = new SchemaEncoder("uint256 eventId, uint8 voteIndex");
  const schemaEncoder = new SchemaEncoder(topicEncoderString);

  const topicEncodeData = generateTopicEncodeData(topicSchema, tempLambda);
  console.log(`💥 topicEncodeData: ${JSON.stringify(topicEncodeData, null, "  ")}`);

  const encodedData = schemaEncoder.encodeData(topicEncodeData);

  const TOPIC_SCHEMA_UID = "0xb94aefaa29555aa00779de767e5e0101c319487bb2ebc44cd62e89771ef58c23";

  const date = new Date();
  const timestamp = Math.floor(date.getTime() / 1000);

  const offchainAttestation: SignedOffchainAttestation = await offchain.signOffchainAttestation(
    {
      recipient: "0x85fD692D2a075908079261F5E351e7fE0267dB02",
      // Unix timestamp of when attestation expires. (0 for no expiration)
      // @ts-expect-error
      expirationTime: 0,
      // Unix timestamp of current time
      // @ts-expect-error
      time: timestamp,
      revocable: true, // Be aware that if your schema is not revocable, this MUST be false
      version: OFFCHAIN_ATTESTATION_VERSION,
      // nonce: 0,
      schema: TOPIC_SCHEMA_UID,
      refUID: "0x0000000000000000000000000000000000000000000000000000000000000000",
      data: encodedData,
    },
    signer
  );
  console.log(offchainAttestation);

  const pkg: AttestationShareablePackageObject = {
    signer: signer.address,
    sig: offchainAttestation,
  };

  const result = await submitSignedAttestation(pkg);
  console.log(`💥 result.data: ${JSON.stringify(result.data, null, "  ")}`);
  return offchainAttestation;
};

const tempLambda: Lambda = {
  name: "batch_mint_v4_js",
  runtime_type: "v8",
  ipfs_cid: "QmZwEuebF3SMoXPSRhDWABhvMueq6gF4HP8nkxv1Yh9h7v",
};

export const verifyEAS = async (offchainAttestation: SignedOffchainAttestation) => {
  const EAS_CONFIG: PartialTypedDataConfig = {
    address: offchainAttestation.domain.verifyingContract,
    version: offchainAttestation.domain.version,
    chainId: offchainAttestation.domain.chainId,
  };
  const offchain = new Offchain(EAS_CONFIG, OFFCHAIN_ATTESTATION_VERSION);
  const isValidAttestation = offchain.verifyOffchainAttestationSignature(signer.address, offchainAttestation);
  return isValidAttestation;
};

(async () => {
  const offchainAttestation = await generateEAS(tempLambda);

  const result = verifyEAS(offchainAttestation);
  console.log(`💥 result: ${JSON.stringify(result, null, "  ")}`);
})();
