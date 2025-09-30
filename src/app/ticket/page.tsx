import { Suspense } from 'react';
import TicketClient from './TicketClient';

function TicketPage() {
  return (
    <Suspense fallback={<div>Loading ticket...</div>}>
      <TicketClient />
    </Suspense>
  );
}

export default TicketPage;
