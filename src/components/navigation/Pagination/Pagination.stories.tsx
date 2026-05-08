import { useState } from 'react';
import { Pagination } from './Pagination';

export default { title: 'Navigation/Pagination', component: Pagination };

export const Default = {
  render: () => {
    function Demo() {
      const [page, setPage] = useState(1);
      return <Pagination page={page} totalPages={10} onPageChange={setPage} />;
    }
    return <Demo />;
  },
};

export const Many = {
  render: () => {
    function Demo() {
      const [page, setPage] = useState(7);
      return <Pagination page={page} totalPages={50} onPageChange={setPage} />;
    }
    return <Demo />;
  },
};
