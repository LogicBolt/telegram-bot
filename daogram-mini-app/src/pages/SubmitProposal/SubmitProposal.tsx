import { ChangeEvent, FC, useState } from 'react';
import {
  List,
  Section,
  Input,
  Button,
} from '@telegram-apps/telegram-ui';
import { useLocation } from "react-router-dom";

import './SubmitProposal.css';

export const SubmitProposal: FC = () => {
  const [amount, setAmount] = useState('0');
  const [description, setDescription] = useState('');
  const [recipient, setRecipient] = useState('');
  const search = useLocation().search.slice(1);
  const chatId = new URLSearchParams(search).get("chat-id");

  const updateAmount = (e: ChangeEvent) => {
    setAmount((e.target as HTMLInputElement).value);
  }

  const updateRecipient = (e: ChangeEvent) => {
    setRecipient((e.target as HTMLInputElement).value);
  }

  const updateDescription = (e: ChangeEvent) => {
    setDescription((e.target as HTMLInputElement).value);
  }

  const submitTransaction = () => {
    const data = JSON.stringify({
      amount,
      destinationAddress: recipient,
      description,
      chatId: parseInt(String(chatId)),
      token: 'TON',
    });
    fetch('https://socket.daogram.0dns.co/', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: data
    }).then(() => {
      // @ts-ignore:next-line
      window.Telegram.WebApp.close();
    }).catch(e => {
      alert(e.message);
    });
  }

  return (
    <List style={{
      background: 'var(--tgui--primary_bg_color)'
    }}>
      <Section header="Submit a new proposal">
        <Input
            header="Amount"
            placeholder="TON amount"
            onChange={updateAmount}
        />
        <Input
          header="Destination address"
          placeholder="TON Address"
          onChange={updateRecipient}
        />
        <Input
          header="Description"
          placeholder="Description"
          onChange={updateDescription}
        />
        <div className="flex-center-row">
          <Button onClick={submitTransaction} mode="filled" size="s">Submit</Button>
        </div>
      </Section>
    </List>
  );
};
