import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { IconType } from "react-icons";

interface ButtonProps {
  to?: string;
  onClick?: () => void;
  children: React.ReactNode;
  icon?: IconType;
  variant?: "primary" | "secondary";
  className?: string;
}

const Button = ({ to, onClick, children, icon: Icon, variant = "primary", className = "" }: ButtonProps) => {
  const baseStyles = "inline-flex items-center gap-2 px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-300";
  const variants = {
    primary: "bg-orange-600 text-white hover:bg-orange-700 hover:scale-105",
    secondary: "bg-white text-orange-600 hover:bg-gray-100 hover:scale-105"
  };

  const buttonContent = (
    <>
      {Icon && <Icon className="text-xl" />}
      {children}
    </>
  );

  if (to) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link
          to={to}
          className={`${baseStyles} ${variants[variant]} ${className}`}
        >
          {buttonContent}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {buttonContent}
    </motion.button>
  );
};

export default Button;
