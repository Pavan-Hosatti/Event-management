import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function useCropPrediction() {
  const [predictions, setPredictions] = useState([]);

  const fetchPredictions = async () => {
    try {
      const res = await fetch(`${API_BASE}/predict/examples`);
      if (!res.ok) throw new Error('Failed to fetch predictions');
      const json = await res.json();
      setPredictions(json.examples || []);
    } catch (err) {
      console.error('useCropPrediction error', err);
      setPredictions([]);
    }
  };

  return { predictions, fetchPredictions };
}
