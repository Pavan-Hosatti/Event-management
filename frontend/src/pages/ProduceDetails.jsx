import { motion } from 'framer-motion';
import { Calendar, User, MessageCircle, CheckCircle, Clock, Target, Truck, Leaf, Award } from 'lucide-react';

const ProduceDetails = () => {
  const produceInfo = [
    { id: 1, title: 'Variety', description: 'Heirloom Red Tomatoes', icon: Leaf },
    { id: 2, title: 'Harvest Date', description: 'Sep 22, 2024', icon: Calendar },
    { id: 3, title: 'Storage Method', description: 'Cool and Dry place', icon: Clock },
    { id: 4, title: 'Shipping', description: 'Next-day delivery available', icon: Truck },
  ];

  const traceability = [
    {
      id: 1,
      date: 'Sep 25, 2024',
      author: 'Farmer Joe',
      type: 'quality-check',
      content: 'Final inspection completed. All produce meets Grade A standards.'
    },
    {
      id: 2,
      date: 'Sep 20, 2024',
      author: 'Certified Organic',
      type: 'certification',
      content: 'Organic certification renewed. Our farm adheres to all standards.'
    },
    {
      id: 3,
      date: 'Sep 10, 2024',
      author: 'Farmer Joe',
      type: 'milestone',
      content: 'Planted the new batch of seeds. Expected harvest in 2-3 months.'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-slate-900 dark:to-slate-800 pt-20 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-green-200/50 text-green-700 dark:bg-green-600/20 dark:text-green-400 px-3 py-1 rounded-full text-sm">Vegetables</span>
            <span className="text-gray-500 dark:text-gray-400">•</span>
            <span className="text-gray-500 dark:text-gray-400">Listed Sep 24, 2024</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Farm Fresh Tomatoes</h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Delicious, sun-ripened tomatoes grown with care on our family farm.</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Produce Overview */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/50 backdrop-blur-xl rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Product Information</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-3">Description</h3>
                  <p className="text-gray-600 dark:text-gray-300">These tomatoes are hand-picked at peak ripeness to ensure maximum flavour. They are perfect for salads, sauces, and sandwiches, offering a rich, robust taste.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-3">Quality & Standards</h3>
                  <p className="text-gray-600 dark:text-gray-300">Grown without synthetic pesticides or herbicides, our tomatoes are nurtured in nutrient-rich soil to produce firm texture and vibrant color.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-3">Origin Story</h3>
                  <p className="text-gray-600 dark:text-gray-300">From our small, sustainable farm nestled in the valley, we've been cultivating high-quality produce for over three generations. Our methods prioritize environmental health and exceptional taste.</p>
                </div>
              </div>
            </motion.div>

            {/* Produce Details */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/50 backdrop-blur-xl rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Produce Details</h2>
              <div className="space-y-6">
                {produceInfo.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-600/20 text-blue-600">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                      <p className="text-gray-500 dark:text-gray-400">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Certifications & Traceability */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/80 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/50 backdrop-blur-xl rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Certifications & Traceability</h2>
              <div className="space-y-6">
                {traceability.map((update) => (
                  <div key={update.id} className="border-l-4 border-blue-500 pl-6 py-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-gray-900 dark:text-white font-semibold">{update.author}</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                        update.type === 'quality-check' 
                          ? 'bg-green-200/50 text-green-700 dark:bg-green-600/20 dark:text-green-400' 
                          : update.type === 'certification' 
                          ? 'bg-purple-200/50 text-purple-700 dark:bg-purple-600/20 dark:text-purple-400' 
                          : 'bg-blue-200/50 text-blue-700 dark:bg-blue-600/20 dark:text-blue-400'
                      }`}>
                        {update.type.replace('-', ' ')}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">{update.date}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{update.content}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Listing Stats */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/50 backdrop-blur-xl rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Listing Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Price</span>
                  <span className="text-gray-900 dark:text-white font-semibold">₹120/kg</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-gray-500 dark:text-gray-400">Available Quantity</span>
                  <span className="text-gray-900 dark:text-white">100 kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Grade</span>
                  <span className="text-gray-900 dark:text-white">Grade A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Status</span>
                  <span className="text-green-600 dark:text-green-400 font-semibold">Active</span>
                </div>
              </div>
            </motion.div>

            {/* Seller Information */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/80 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/50 backdrop-blur-xl rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Seller Information</h3>
              <div className="space-y-4">
                {[
                  { name: 'Farmer Joe', role: 'Main Seller', avatar: 'J' },
                  { name: 'Green Acres Farm', role: 'Farm Name', avatar: 'G' },
                  { name: 'HarvestMark', role: 'Marketplace Verified', avatar: 'H' },
                ].map((member, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                      {member.avatar}
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-semibold">{member.name}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-4"
            >
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:scale-105 transition-transform">
                <MessageCircle className="w-5 h-5" />
                Message Seller
              </button>
              <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProduceDetails;
