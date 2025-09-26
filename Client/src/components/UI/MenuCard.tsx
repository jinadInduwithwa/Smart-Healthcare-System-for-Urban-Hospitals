import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  mainImage?: string;
  description?: string;
  category?: string; // Category name
  isAvailable?: boolean;
  rating?: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.12,
      type: 'spring',
      stiffness: 120,
      damping: 14,
    },
  }),
  hover: {
    scale: 1.02,
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    transition: { type: 'spring', stiffness: 300 },
  },
};

interface MenuCardProps {
  item: MenuItem;
  index: number;
  restaurantId: string;
}

const MenuCard: React.FC<MenuCardProps> = ({ item, index, restaurantId }) => {
  return (
    <Link to={`/restaurant/${restaurantId}/menu/${item._id}`}>
      <motion.div
        className="bg-white rounded-lg shadow-md flex flex-col sm:flex-row items-start overflow-hidden cursor-pointer"
        custom={index}
        initial="hidden"
        whileInView="visible"
        whileHover="hover"
        viewport={{ once: true, amount: 0.2 }}
        variants={cardVariants}
      >
        <div className="w-full sm:w-40 h-32 sm:h-auto flex-shrink-0 py-6 pl-2">
          <motion.img
            src={item.mainImage || '/placeholder-item.jpg'}
            alt={item.name}
            className="w-full h-full object-cover"
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
          />
        </div>
        <div className="p-4 flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
          {item.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
          )}
          {item.category && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              Category: <span className="font-bold">{item.category}</span>
            </p>
          )}
          <div className="flex flex-row gap-6 pt-2">
            <p className="text-sm text-gray-600 mt-1">Rs. {item.price.toFixed(2)}</p>
            <div onClick={(e) => e.stopPropagation()}>
              <button className="text-sm text-orange-600 pt-1 font-bold py-1 px-3 hover:bg-orange-600 hover:text-white hover:translate-x-2">
                Quick Add
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default MenuCard;