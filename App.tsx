import { useEffect, useState } from 'react';

function UserComponent() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`https://api.example.com/user`)
      .then(res => res.json())
      .then(data => {
        setUser(data); 
      });
  }, []); 

  return <div>{user?.name}</div>;
}