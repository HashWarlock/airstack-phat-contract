// *** YOU ARE LIMITED TO THE FOLLOWING IMPORTS TO BUILD YOUR PHAT CONTRACT     ***
// *** ADDING ANY IMPORTS WILL RESULT IN ERRORS & UPLOADING YOUR CODE TO PHALA  ***
// *** NETWORK WILL FAIL. IF YOU WANT TO KNOW MORE, JOIN OUR DISCORD TO SPEAK   ***
// *** WITH THE PHALA TEAM AT https://discord.gg/5HfmWQNX THANK YOU             ***
import "@phala/pink-env";
import { Coders } from "@phala/ethers";

type HexString = `0x${string}`;

// eth abi coder
const uintCoder = new Coders.NumberCoder(32, false, "uint256");
const uint8Coder = new Coders.NumberCoder(1, false, 'uint8');
const bytesCoder = new Coders.BytesCoder("bytes");
const uint8ArrayCoder = new Coders.ArrayCoder(uint8Coder, -1, "uint8[]");
const addressCoder = new Coders.AddressCoder("address");
const stringCoder = new Coders.StringCoder("string");

function encodeReply(reply: [number, string, number, number]): HexString {
    return Coders.encode([uintCoder, addressCoder, uintCoder, uintCoder], reply) as HexString;
}

// Defined in TestLensOracle.sol
const TYPE_RESPONSE = 0;
const TYPE_ERROR = 2;

enum Error {
    BadLensProfileId = "BadLensProfileId",
    FailedToFetchData = "FailedToFetchData",
    FailedToDecode = "FailedToDecode",
    MalformedRequest = "MalformedRequest",
}

function errorToCode(error: Error): number {
    switch (error) {
        case Error.BadLensProfileId:
            return 1;
        case Error.FailedToFetchData:
            return 2;
        case Error.FailedToDecode:
            return 3;
        case Error.MalformedRequest:
            return 4;
        default:
            return 0;
    }
}

function isHexString(str: string): boolean {
    const regex = /^0x[0-9a-f]+$/;
    return regex.test(str.toLowerCase());
}

function stringToHex(str: string): string {
    var hex = "";
    for (var i = 0; i < str.length; i++) {
        hex += str.charCodeAt(i).toString(16);
    }
    return "0x" + hex;
}

function fetchAirstackApiStats(airstackApi: string, target: string, requester: string): any {
    const apiKey = "3a41775a358a4cb99ca9a29c1f6fc486";
    const airstackApiUrl = "https://api.airstack.xyz/gql";
    // const target = "ipeciura.eth";
    // const requester = "betashop.eth"
    // profile_id should be like 0x0001
    let headers = {
        "Content-Type": "application/json",
        "User-Agent": "phat-contract",
        "Authorization": "3a41775a358a4cb99ca9a29c1f6fc486",
    };
    let queryIsFollowingTarget = JSON.stringify({
        query: `
            query isFollowingTarget {
            Wallet(input: {identity: "${requester}", blockchain: ethereum}) {
                socialFollowings(
                    input: {filter: {identity: {_in: ["${target}"]}}}
            ) {
                    Following {
                        dappName
                        dappSlug
                        followingProfileId
                        followerProfileId
                        followerAddress {
                            addresses
                            socials {
                                dappName
                                profileName
                            }
                            domains {
                                name
                            }
                        }
                    }
                }
            }
        }`,
    });
    let body0 = stringToHex(queryIsFollowingTarget);
    let queryTxCountWithTarget = JSON.stringify({
        query: `
            query GetTxCountTarget {
              ethereumTransfers: TokenTransfers(
                input: {
                  filter: {
                    _or: [
                      {
                        from: { _eq: "${requester}" },
                        to: { _eq: "${target}" }
                      },
                      {
                        from: { _eq: "${target}" },
                        to: { _eq: "${requester}" }
                      }
                    ]
                  },
                  blockchain: ethereum
                }
              ) {
                TokenTransfer {
                  transactionHash
                  blockchain
                }
              }
              polygonTransfers: TokenTransfers(
                input: {
                  filter: {
                    _or: [
                      {
                        from: { _eq: "${requester}" },
                        to: { _eq: "${target}" }
                      },
                      {
                        from: { _eq: "${target}" },
                        to: { _eq: "${requester}" }
                      }
                    ]
                  },
                  blockchain: polygon
                }
              ) {
                TokenTransfer {
                  transactionHash
                  blockchain
                }
              }
            }`
    });
    let body1 = stringToHex(queryTxCountWithTarget);
    let queryHasPrimaryEns = JSON.stringify( {
        query: `
            query MyQuery {
                Domains(input: {filter: {owner: {_in: ["${target}"]}, isPrimary: {_eq: true}}, blockchain: ethereum}) {
                    Domain {
                      name
                      owner
                      isPrimary
                    }
                }
            }
        `
    });
    let body2 = stringToHex(queryHasPrimaryEns);
    let queryHasLensAndFarcasterAccounts = JSON.stringify({
        query: `
            query MyQuery {
                Socials(
                    input: {filter: {dappName: {_in: [lens, farcaster]}, identity: {_in: ["${target}"]}}, blockchain: ethereum}
                    ) {
                        Social {
                          profileName
                          profileTokenId
                          profileTokenIdHex
                          followerCount
                          followingCount
                        }
                }
            }
        `
    });
    let body3 = stringToHex(queryHasLensAndFarcasterAccounts);
    let queryPoapsOwnedByTarget = JSON.stringify({
        query: `
            query POAPsOwnedByTarget {
                Poaps(
                    input: {filter: {owner: {_in: ["${target}"]}}, blockchain: ALL}
                    ) {
                    Poap {
                          mintOrder
                          mintHash
                          poapEvent {
                            isVirtualEvent
                          }
                        }
                    }
            }
        `
    });
    let body4 = stringToHex(queryPoapsOwnedByTarget);
    //
    // In Phat Function runtime, we not support async/await, you need use `pink.batchHttpRequest` to
    // send http request. The function will return an array of response.
    //
    // @ts-ignore
    let [response0, response1, response2, response3, response4] = pink.batchHttpRequest(
        [
            {
                url: airstackApiUrl,
                method: "POST",
                headers,
                body: body0,
                returnTextBody: true,
            },
            {
                url: airstackApiUrl,
                method: "POST",
                headers,
                body: body1,
                returnTextBody: true,
            },
            {
                url: airstackApiUrl,
                method: "POST",
                headers,
                body: body2,
                returnTextBody: true,
            },
            {
                url: airstackApiUrl,
                method: "POST",
                headers,
                body: body3,
                returnTextBody: true,
            },
            {
                url: airstackApiUrl,
                method: "POST",
                headers,
                body: body4,
                returnTextBody: true,
            },
        ],
        10000
    );

    helper(response0);
    helper(response1);
    helper(response2);
    helper(response3);
    helper(response4);

    //return JSON.parse();
}

function helper(response: any) {
    if (response.statusCode !== 200) {
        console.log(
            `Fail to read Lens api with status code: ${response.statusCode}, error: ${
                response.error || response.body
            }}`
        );
        throw Error.FailedToFetchData;
    }
    let respBody = response.body;
    if (typeof respBody !== "string") {
        throw Error.FailedToDecode;
    }
    console.log(respBody);

}

function parseProfileId(hexx: string): string {
    var hex = hexx.toString();
    if (!isHexString(hex)) {
        throw Error.BadLensProfileId;
    }
    hex = hex.slice(2);
    var str = "";
    for (var i = 0; i < hex.length; i += 2) {
        const ch = String.fromCharCode(parseInt(hex.substring(i, i + 2), 16));
        str += ch;
    }
    return str;
}

//
// Here is what you need to implemented for Phat Function, you can customize your logic with
// JavaScript here.
//
// The function will be called with two parameters:
//
// - request: The raw payload from the contract call `request` (check the `request` function in TestLensApiConsumerConract.sol).
//            In this example, it's a tuple of two elements: [requestId, profileId]
// - settings: The custom settings you set with the `config_core` function of the Action Offchain Rollup Phat Contract. In
//            this example, it just a simple text of the lens api url prefix.
//
// Your returns value MUST be a hex string, and it will send to your contract directly. Check the `_onMessageReceived` function in
// TestLensApiConsumerContract.sol for more details. We suggest a tuple of three elements: [successOrNotFlag, requestId, data] as
// the return value.
//
export default function main(request: HexString, secrets: string): HexString {
    console.log(`handle req: ${request}`);
    let requestId, encodedAccountId, encodedRequester, encodedAirstackQueryMultipliers;
    try {
        [requestId, encodedAccountId, encodedRequester, encodedAirstackQueryMultipliers] = Coders.decode([uintCoder, addressCoder, addressCoder, uint8ArrayCoder], request);
        console.log(`requestId: ${requestId}`);
        console.log(`encodedTarget: ${encodedAccountId}`);
        console.log(`encodedRequester: ${encodedRequester}`);
        console.log(`encodedAirstackQueryMultipliers: ${encodedAirstackQueryMultipliers}`);
        //[requestId, encodedAccountId] = Coders.decode([uintCoder, bytesCoder, addressCoder, bytesArrayCoder], request);
    } catch (error) {
        console.info("Malformed request received");
        return encodeReply([TYPE_ERROR, encodedRequester, 0, 0]);
    }

    try {
        fetchAirstackApiStats(secrets, encodedAccountId, encodedRequester);
        let stats = 88;
        console.log("response:", [TYPE_RESPONSE, encodedRequester, requestId, stats]);
        return encodeReply([TYPE_RESPONSE, encodedRequester, requestId, stats]);
    } catch (error) {
        if (error === Error.FailedToFetchData) {
            throw error;
        } else {
            // otherwise tell client we cannot process it
            console.log("error:", [TYPE_ERROR, encodedRequester, requestId, error]);
            return encodeReply([TYPE_ERROR, encodedRequester, requestId, 0]);
        }
    }
}
