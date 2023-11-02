import {useState} from "react";
import {CopyIcon} from "./assets/CopyIcon";
import {DiamondIcon} from "./assets/DiamondIcon";
import {HareIcon} from "./assets/HareIcon";
import {ReceiptPercentIcon, XMarkIcon, CalculatorIcon} from "@heroicons/react/24/outline";
import {useScaffoldContractWrite, useScaffoldContractRead} from "~~/hooks/scaffold-eth";
import {AddressInput, IntegerVariant} from "~~/components/scaffold-eth";
import {UInt8Input} from "~~/components/example-ui/Input/UInt8Input";
import {Address as AddressType} from "abitype/dist/types/abi";
import { useAccount } from "wagmi";

export const ContractInteraction = () => {
  const { address } = useAccount();
  const [visible, setVisible] = useState(true);
  const [newGreeting, setNewGreeting] = useState<AddressType>();

  const [multiplier0, setMultiplier0] = useState<bigint>(BigInt(0));
  const [multiplier1, setMultiplier1] = useState<bigint>(BigInt(0));
  const [multiplier2, setMultiplier2] = useState<bigint>(BigInt(0));
  const [multiplier3, setMultiplier3] = useState<bigint>(BigInt(0));
  const [multiplier4, setMultiplier4] = useState<bigint>(BigInt(0));

  const { writeAsync: writeAsync0, isLoading: isLoading0 } = useScaffoldContractWrite({
    contractName: "YourContract",
    functionName: "setGreeting",
    args: [newGreeting],
    value: "0.01",
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const { writeAsync: writeAirstackMultipliersAsync, isLoading: isAirstackMultipliersLoading } = useScaffoldContractWrite({
    contractName: "YourContract",
    functionName: "setAirstackQueryConfigMultipliers",
    args: [[Number(multiplier0), Number(multiplier1), Number(multiplier2), Number(multiplier3), Number(multiplier4)]],
    value: "0.01",
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    }
  });

  return (
    <div className="flex bg-base-300 relative pb-10">
      <DiamondIcon className="absolute top-24" />
      <CopyIcon className="absolute bottom-0 left-36" />
      <HareIcon className="absolute right-0 bottom-24" />
      <div className="flex flex-col w-full mx-5 sm:mx-8 2xl:mx-20">
        <div className={`mt-10 flex gap-2 ${visible ? "" : "invisible"} max-w-2xl`}>
          <div className="flex gap-5 bg-base-200 bg-opacity-80 z-0 p-7 rounded-2xl shadow-lg">
            <span className="text-3xl">👋🏻</span>
            <div>
              <div>
                In this page you can see how some of our <strong>hooks & components</strong> work, and how you can bring
                them to life with your own design! Have fun and try it out!
              </div>
              <div className="mt-2">
                Check out{" "}
                <code className="italic bg-base-300 text-base font-bold [word-spacing:-0.5rem]">
                  packages / nextjs/pages / example-ui.tsx
                </code>{" "}
                and its underlying components.
              </div>
            </div>
          </div>
          <button
            className="btn btn-circle btn-ghost h-6 w-6 bg-base-200 bg-opacity-80 z-0 min-h-0 drop-shadow-md"
            onClick={() => setVisible(false)}
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col mt-2 px-7 py-4 bg-base-200 opacity-80 rounded-2xl shadow-lg border-2 border-primary">
          <span className="text-4xl sm:text-2xl">Configure Airstack Query Multipliers</span>
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
            <div
                className="space-x-4 flex tooltip tooltip-bottom tooltip-secondary before:content-[attr(data-tip)] before:left-auto before:transform-none"
                data-tip="Requester is Following Target"
            >
            <UInt8Input value={multiplier0 ?? 0} onChange={value => setMultiplier0(BigInt(value))} variant={IntegerVariant.UINT8}/>
            </div>
            <div
                className="space-x-4 flex tooltip tooltip-bottom tooltip-secondary before:content-[attr(data-tip)] before:left-auto before:transform-none"
                data-tip="Request To/From Target TX Count"
            >
            <UInt8Input value={multiplier1 ?? 0} onChange={value => setMultiplier1(BigInt(value))} variant={IntegerVariant.UINT8}/>
            </div>
            <div
                className="space-x-4 flex tooltip tooltip-bottom tooltip-secondary before:content-[attr(data-tip)] before:left-auto before:transform-none"
                data-tip="Target Has Primary ENS Domain"
            >
            <UInt8Input value={multiplier2 ?? 0} onChange={value => setMultiplier2(BigInt(value))} variant={IntegerVariant.UINT8}/>
            </div>
            <div
                className="space-x-4 flex tooltip tooltip-bottom tooltip-secondary before:content-[attr(data-tip)] before:left-auto before:transform-none"
                data-tip="Target Has Lens or Farcaster Accounts"
            >
            <UInt8Input value={multiplier3 ?? 0} onChange={value => setMultiplier3(BigInt(value))} variant={IntegerVariant.UINT8}/>
            </div>
            <div
                className="space-x-4 flex tooltip tooltip-bottom tooltip-secondary before:content-[attr(data-tip)] before:left-auto before:transform-none"
                data-tip="Target Has POAPs From IRL Events"
            >
            <UInt8Input value={multiplier4 ?? 0} onChange={value => setMultiplier4(BigInt(value))} variant={IntegerVariant.UINT8}/>
            </div>
          <button
              className="btn btn-primary btn-sm font-normal normal-case gap-1 cursor-auto"
              onClick={() => writeAirstackMultipliersAsync()}
              disabled={isAirstackMultipliersLoading}>
            {
              !isAirstackMultipliersLoading ? (
                  <CalculatorIcon className="h-6 w-6" />
              ) : (
                  <span className="loading loading-spinner loading-sm"></span>
              )}
            <span>Set</span>
          </button>
          </div>
          <div className="mt-4 flex gap-2 items-start">
            <span className="text-sm leading-tight">Price:</span>
            <div className="badge badge-warning">0.01 ETH + Gas</div>
          </div>
        </div>
        <div className="flex flex-col mt-4 px-7 py-6 bg-base-200 opacity-80 rounded-2xl shadow-lg border-2 border-primary">
          <span className="text-4xl sm:text-2xl">Check an Account's Risk Score</span>

          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
            <AddressInput
                placeholder="Target Address"
                value={newGreeting ?? ""}
                onChange={value => setNewGreeting(value)}
            />
            <div className="flex rounded-full border border-primary p-1 flex-shrink-0">
              <div className="flex rounded-full border-2 border-primary p-1">
                <button
                    className="btn btn-primary btn-sm capitalize font-normal font-white w-32 flex items-center gap-0.5 hover:gap-2 transition-all tracking-widest"
                    onClick={() => writeAsync0()}
                    disabled={isLoading0}>
                  {!isLoading0 ? (
                      <ReceiptPercentIcon className="h-6 w-6" />
                  ) : (
                      <span className="loading loading-spinner loading-sm"></span>
                  )}
                  <span>Request</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2 items-start">
            <span className="text-sm leading-tight">Price:</span>
            <div className="badge badge-warning">0.01 ETH + Gas</div>
          </div>
        </div>
      </div>
    </div>
  );
};
