import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ScratchCard from '../components/ScratchCard';
import LoadingSpinner from '../components/LoadingSpinner';
import API_BASE_URL from '../config/api';

const ScratchCards = () => {

  const { user, updateUser } = useAuth();

  const [cards, setCards] = useState([]);

  const [loading, setLoading] = useState(true);

  const fetchCards = async () => {

    try {

      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please login to use scratch cards');
        setCards([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/scratch-cards`, {

        headers: { 'Authorization': `Bearer ${token}` }

      });

      if (response.status === 401) {

        alert('Please login to use scratch cards');

        setCards([]);
        setLoading(false);
        return;

      }

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to fetch cards';
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            errorMessage = `Server error: ${response.status}`;
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();

      setCards(data || []);

    } catch (error) {

      console.error('Error fetching cards:', error);

      alert('Error fetching cards: ' + error.message);

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
      
      if (!token) {
        alert('Please login to use scratch cards');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/scratch-cards`, {

        method: 'POST',

        headers: { 'Authorization': `Bearer ${token}` }

      });

      if (response.status === 401) {

        alert('Please login to use scratch cards');

        return;

      }

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to create gift box';
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            errorMessage = `Server error: ${response.status}`;
          }
        }
        
        alert(errorMessage);
        return;

      }

      fetchCards();

    } catch (error) {

      alert('Error opening gift box: ' + error.message);
      console.error('Error creating card:', error);

    }

  };

  const scratchCard = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/scratch-cards/${id}/scratch`, {
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