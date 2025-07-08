import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import TicketABI from '../contracts/TicketABI.json';

const contractAddress = "0x7Ca1A12e52dabDf36F5e5C2813063Bd352a40165";

function Home() {
  const [wallet, setWallet] = useState(null);
  const [contract, setContract] = useState(null);
  const [ticketPrice, setTicketPrice] = useState(null);
  const [ticketOwned, setTicketOwned] = useState(false);

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, TicketABI, signer);
      setWallet(accounts[0]);
      setContract(contractInstance);
    }
  };

  const fetchDetails = async () => {
    if (contract && wallet) {
      const price = await contract.ticketPrice();
      const count = await contract.ownerTicketPrice(wallet);
      setTicketPrice(ethers.formatEther(price));
      setTicketOwned(count > 0);
    }
  };

  const buyTicket = async () => {
    if (contract) {
      const tx = await contract.buyTicket({ value: ethers.parseEther(ticketPrice) });
      await tx.wait();
      fetchDetails();
    }
  };

  useEffect(() => {
    connectWallet();
  }, []);

  useEffect(() => {
    fetchDetails();
  }, [contract, wallet]);

  return (
    <div className="space-y-4 text-center">
      <p><strong>Wallet:</strong> {wallet || 'Not connected'}</p>
      <p><strong>Ticket Price:</strong> {ticketPrice ? `${ticketPrice} ETH` : 'Loading...'}</p>
      <p><strong>Do you own a ticket?</strong> {ticketOwned ? 'Yes 🎟️' : 'No'}</p>
      <button
        onClick={buyTicket}
        disabled={ticketOwned}
        className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500 disabled:opacity-50"
      >
        Buy Ticket
      </button>
    </div>
  );
}

export default Home;