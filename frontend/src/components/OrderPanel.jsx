// Componente padre (por ejemplo, CartPage.jsx)
import { useState, useEffect } from 'react';
import OrderPanel from './OrderPanel';
import syncStorage from './firebase/storage.js';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Cargar carrito desde Firebase
    syncStorage.getItem('cart').then(items => {
      setCartItems(items || []);
    });

    // Sincronizar en tiempo real
    syncStorage.syncItem('cart', (newCart) => {
      if (newCart !== null) {
        setCartItems(newCart);
      }
    });
  }, []);

  const handleRemoveItem = async (itemId) => {
    const updatedCart = cartItems.filter(item => 
      (item.id !== itemId) && (item._id !== itemId)
    );
    setCartItems(updatedCart);
    
    // Guardar en Firebase
    await syncStorage.setItem('cart', updatedCart);
  };

  return (
    <OrderPanel 
      items={cartItems} 
      onRemove={handleRemoveItem} 
    />
  );
}