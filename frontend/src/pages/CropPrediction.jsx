import { useEffect } from 'react';
import useCropPrediction from '../hooks/useCropPrediction';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const CropPrediction = () => {
  const { t } = useTranslation();
  const { predictions, fetchPredictions } = useCropPrediction();

  useEffect(() => {
    fetchPredictions();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-slate-900 dark:to-slate-800 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{t('cropPrediction.header.title')}</h1>
          <p className="text-gray-600 dark:text-gray-300">{t('cropPrediction.header.subtitle')}</p>
        </motion.div>

        {/* Predictions Grid */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid md:grid-cols-3 gap-6">
          {predictions.map((prediction, index) => (
            <CropPredictionCard key={prediction.id} prediction={prediction} />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default CropPrediction;