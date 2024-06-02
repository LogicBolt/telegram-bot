import { ChangeEvent, FC, useState } from 'react';
import {
  List,
  Section,
  Input,
  Select, Button
} from '@telegram-apps/telegram-ui';

import './SubmitProposal.css';

export const SubmitProposal: FC = () => {
  const [amount, setAmount] = useState('0');
  // const [currency, setCurrency] = useState('USDT');
  const [recipient, setRecipient] = useState('');

  const updateAmount = (e: ChangeEvent) => {
    setAmount((e.target as HTMLInputElement).value);
  }

  const updateRecipient = (e: ChangeEvent) => {
    setRecipient((e.target as HTMLInputElement).value);
  }

  const submitTransaction = () => {
    const data = JSON.stringify({
      amount,
      destinationAddress: recipient,
      token: 'TON',
    });
    fetch('https://socket.daogram.0dns.co/', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: data
    }).then(() => {
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
            placeholder="0.000"
            onChange={updateAmount}
        />
        <Input
          header="Destination address"
          placeholder="Xxx"
          onChange={updateRecipient}
        />
        <div className="flex-center-row">
          <Button onClick={submitTransaction} mode="filled" size="s">Submit</Button>
        </div>
      </Section>
    </List>
  );
};
