import { ConnectButton } from "thirdweb/react";
import { client, monad } from "../config";

export default function WalletPanel() {
  return <ConnectButton client={client} chain={monad} />;
}
