import React, { useState } from 'react';
import { X, Gift, Star } from 'lucide-react';
import { useAppStore } from '../store';
import { ScratchCard } from '../types';

interface ScratchCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: ScratchCard | null;
}

const ScratchCardModal: React.FC<ScratchCardModalProps> = ({
  isOpen,
  onClose,
  card,
}) => {
  const { revealScratchCard } = useAppStore();
  const [isScratching, setIsScratching] = useState(false);

  const handleScratch = () => {
    if (!card || card.isRevealed) return;
    
    setIsScratching(true);
    setTimeout(() => {
      revealScratchCard(card.id);
      setIsScratching(false);
    }, 1500);
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'discount':
        return '🏷️';
      case 'coupon':
        return '☕';
      case 'badge':
        return '🏆';
      case 'charity':
        return '❤️';
      default:
        return '🎁';
    }
  };

  if (!isOpen || !card) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-sm w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <Gift className="w-5 h-5 mr-2 text-yellow-500" />
            Scratch Card Reward
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-center">
          <div className="mb-6">
            <div className="text-4xl mb-2">🎫</div>
            <p className="text-gray-600">
              Congratulations! You've earned a scratch card for reaching 10 points!
            </p>
          </div>

          {!card.isRevealed ? (
            <div className="space-y-4">
              <div
                className={`relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg p-8 cursor-pointer transform transition-transform ${
                  isScratching ? 'scale-105' : 'hover:scale-105'
                }`}
                onClick={handleScratch}
              >
                {isScratching ? (
                  <div className="text-white">
                    <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p>Revealing...</p>
                  </div>
                ) : (
                  <div className="text-white">
                    <Star className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-bold">Tap to Scratch!</p>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Tap the card above to reveal your reward
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-lg p-6 text-white">
                <div className="text-4xl mb-2">
                  {getRewardIcon(card.reward.type)}
                </div>
                <h3 className="text-xl font-bold mb-2">{card.reward.value}</h3>
                <p className="text-sm opacity-90">{card.reward.description}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-800 text-sm font-medium">
                  🎉 Reward claimed successfully!
                </p>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {card.isRevealed ? 'Awesome!' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScratchCardModal;