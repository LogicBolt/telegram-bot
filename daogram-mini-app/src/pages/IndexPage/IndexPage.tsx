import { Section, Cell, List } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';

import { Link } from '@/components/Link/Link.tsx';

import './IndexPage.css';

export const IndexPage: FC = () => {
  return (
    <List>
      <Section
        header='DAOgram'
        footer='Seamless decision-making for your DAO'
      >
        <Link to='/ton-connect'>
          <Cell
            subtitle='Connect your TON wallet'
          >
            TON Connect
          </Cell>
        </Link>
        <Link to='/submit-proposal'>
          <Cell
            subtitle='Machin'
          >
            Submit a proposal
          </Cell>
        </Link>
      </Section>
    </List>
  );
};
