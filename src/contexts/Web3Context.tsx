import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { Web3State } from '../contracts/types';
import EnergyMarketplaceABI from '../contracts/EnergyMarketplace.json';
import { createWalletConnectProvider } from '../utils/web3Provider';

const MARKETPLACE_CONTRACT_ADDRESS = import.meta.env.VITE_MARKETPLACE_CONTRACT_ADDRESS;
const INFURA_ID = import.meta.env.VITE_INFURA_PROJECT_ID;

const web3Modal = new Web3Modal({
  network: 'sepolia',
  cacheProvider: true,
  providerOptions: {
    walletconnect: {
      package: createWalletConnectProvider,
      options: {
        infuraId: INFURA_ID,
        rpc: {
          11155111: `https://sepolia.infura.io/v3/${INFURA_ID}`
        }
      }
    }
  }
});

const initialState: Web3State = {
  provider: null,
  signer: null,
  contract: null,
  address: null,
  chainId: null,
  connected: false,
};

const Web3Context = createContext<{
  web3State: Web3State;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}>({
  web3State: initialState,
  connect: async () => {},
  disconnect: async () => {},
  isLoading: false,
  error: null,
});

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [web3State, setWeb3State] = useState<Web3State>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setWeb3State(initialState);
    setError(null);
  };

  const connect = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const instance = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(instance);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      if (network.chainId !== 11155111) {
        const sepoliaChainId = '0xaa36a7';
        try {
          await provider.send('wallet_switchEthereumChain', [{ chainId: sepoliaChainId }]);
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await provider.send('wallet_addEthereumChain', [{
              chainId: sepoliaChainId,
              chainName: 'Sepolia',
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: [`https://sepolia.infura.io/v3/${INFURA_ID}`],
              blockExplorerUrls: ['https://sepolia.etherscan.io']
            }]);
          } else {
            setError('Please switch to Sepolia network');
            return;
          }
        }
      }

      const contract = new ethers.Contract(
        MARKETPLACE_CONTRACT_ADDRESS!,
        EnergyMarketplaceABI.abi,
        signer
      );

      setWeb3State({
        provider,
        signer,
        contract,
        address,
        chainId: network.chainId,
        connected: true,
      });

      // Subscribe to accounts change
      instance.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          connect();
        }
      });

      // Subscribe to chainId change
      instance.on('chainChanged', () => {
        connect();
      });

      // Subscribe to provider disconnection
      instance.on('disconnect', () => {
        disconnect();
      });

    } catch (error) {
      console.error('Error connecting to Web3:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect to wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = async () => {
    try {
      await web3Modal.clearCachedProvider();
      resetState();
    } catch (error) {
      console.error('Error disconnecting from Web3:', error);
      setError(error instanceof Error ? error.message : 'Failed to disconnect wallet');
    }
  };

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connect();
    }
  }, []);

  return (
    <Web3Context.Provider value={{ web3State, connect, disconnect, isLoading, error }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context); 