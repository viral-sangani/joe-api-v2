import retry from "async-retry";
import axios from "axios";

export async function transformAvaxAddress() {
  const [bridgeTokensOld, bridgeTokensNew, bridgeTokenDetails] =
    await Promise.all([
      fetchURL(
        "https://raw.githubusercontent.com/0xngmi/bridge-tokens/main/data/penultimate.json"
      ),

      fetchURL(
        "https://raw.githubusercontent.com/ava-labs/avalanche-bridge-resources/main/avalanche_contract_address.json"
      ).then((r) => Object.entries(r.data)),
      fetchURL(
        "https://raw.githubusercontent.com/ava-labs/avalanche-bridge-resources/main/token_list.json"
      ),
    ]);

  return (addr: string) => {
    if (compareAddresses(addr, "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7")) {
      //WAVAX
      return `avax:${addr}`;
    }
    if (compareAddresses(addr, "0xaf2c034c764d53005cc6cbc092518112cbd652bb")) {
      //qiAVAX
      return `avax:0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7`;
    }
    if (compareAddresses(addr, "0x57319d41F71E81F3c65F2a47CA4e001EbAFd4F33")) {
      //xJOE
      return `avax:0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd`;
    }
    if (compareAddresses(addr, "0x0000000000000000000000000000000000000000")) {
      //AVAX
      return "avax:0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
    }
    const srcToken = bridgeTokensOld.data.find((token: any) =>
      compareAddresses(token["Avalanche Token Address"], addr)
    );
    if (
      srcToken !== undefined &&
      srcToken["Ethereum Token Decimals"] ===
        srcToken["Avalanche Token Decimals"]
    ) {
      return srcToken["Ethereum Token Address"];
    }
    const newBridgeToken = bridgeTokensNew.find((token: any) =>
      compareAddresses(addr, token[1])
    );
    if (newBridgeToken !== undefined) {
      const tokenName = newBridgeToken[0].split(".")[0];
      const tokenData = bridgeTokenDetails.data[tokenName];
      if (tokenData !== undefined) {
        return tokenData.nativeContractAddress;
      }
    }
    return `avax:${addr}`;
  };
}

export async function fetchURL(url: string) {
  return await retry(async (bail) => await axios.get(url), {
    retries: 3,
  });
}

export function compareAddresses(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase();
}
