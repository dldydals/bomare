import { motion } from 'framer-motion';
import './Button.css';


export default function Button({ children, variant = 'primary', className = '', ...props }) {
    const baseStyles = "px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2";

    const variants = {
        primary: "bg-navy text-white hover:bg-navy-light shadow-lg",
        secondary: "bg-gold text-navy hover:bg-gold-dim",
        outline: "border border-navy text-navy hover:bg-navy hover:text-white",
        ghost: "text-navy hover:bg-gray-100"
    };

    // Convert css class names to style objects if we were using CSS modules, 
    // but here we are using Tailwind-like utility classes IF we had Tailwind.
    // Since we are using Vanilla CSS + Global Styles, I should write CSS or use inline styles or standard classes.
    // Wait, I am meant to use Vanilla CSS. I defined global variables.
    // I will use a simple style object or separate CSS file for components.
    // To keep it clean and fast, I will use CSS Modules or just scoped CSS.
    // Let's use inline styles with our variables for now to move fast, or cleaner: CSS Modules.
    // I will create a Button.module.css alongside.

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`btn btn-${variant} ${className}`}
            {...props}
        >
            {children}
        </motion.button>
    );
}
