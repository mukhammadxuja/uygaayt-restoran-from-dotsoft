import { useState } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { useTodos } from '@/hooks/use-todos';

function MainPage() {
  const { user } = useAuth();
  const { todos, loading, deleteTodo } = useTodos(user?.uid);
  const [open, setOpen] = useState(false);

  return <div className="space-y-2 md:space-y-4 my-4"></div>;
}

export default MainPage;
