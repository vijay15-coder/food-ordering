import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ScratchCard from '../components/ScratchCard';

const ScratchCards = () => {

  const { user, updateUser } = useAuth();

  const [cards, setCards] = useState([]);

  const [loading, setLoading] = useState(true);

  const fetchCards = async () => {

    try {

      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/scratch-cards', {

        headers: { 'Authorization': `Bearer ${token}` }

      });

      if (response.status === 401) {

        alert('Please login to use scratch cards');

        setCards([]);

        return;

      }

      if (!response.ok) throw new Error('Failed to fetch cards');

      const data = await response.json();

      setCards(data);

    } catch (error) {

      console.error('Error fetching cards:', error);

      setCards([]);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchCards();

  }, []);

  const createCard = async () => {

    try {

      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/scratch-cards', {

        method: 'POST',

        headers: { 'Authorization': `Bearer ${token}` }

      });

      if (response.status === 401) {

        alert('Please login to use scratch cards');

        return;

      }

      if (!response.ok) {

        const error = await response.json();

        alert(error.message);

        return;

      }

      fetchCards();

    } catch (error) {

      alert('Error opening gift box');

    }

  };

  const scratchCard = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/scratch-cards/${id}/scratch`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.status === 401) {
        alert('Please login to use scratch cards');
        return;
      }
      if (response.ok) {
        alert(`You won ₹${data.prize} discount!`);
        // Optimistically update the UI
        setCards(prevCards =>
          prevCards.map(card =>
            card._id === id ? { ...card, scratched: true, prize: data.prize } : card
          )
        );
        updateUser({ ...user, discount: (user?.discount || 0) + data.prize });
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Error scratching card');
      console.error('Scratch card error:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (

    <div className="min-h-screen bg-gray-50 py-8">

      <div className="container mx-auto px-4 max-w-4xl">

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Gift Box</h1>

        <button onClick={createCard} className="bg-blue-500 text-white px-4 py-2 rounded mb-4">Open Gift Box</button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {cards.map(card => (

            <div key={card._id} className="bg-white p-4 rounded shadow flex flex-col items-center">

              <p className="mb-2">Created: {new Date(card.createdAt).toLocaleString()}</p>

              {card.scratched ? (

                <div className="text-center">

                  <p className="text-lg font-bold text-green-600">Prize: ₹{card.prize} discount</p>

                </div>

              ) : (

                <ScratchCard

                  width={200}

                  height={100}

                  image="https://hips.hearstapps.com/hmg-prod/images/2024-lamborghini-revuelto-127-641a1d518802b.jpg?crop=0.813xw:0.721xh;0.0994xw,0.128xh&resize=1200:*" // Placeholder image, you can replace with actual coupon image

                  brushSize={20}

                  onScratch={() => scratchCard(card._id)}

                />

              )}

            </div>

          ))}

        </div>

      </div>

    </div>

  );

};

export default ScratchCards;