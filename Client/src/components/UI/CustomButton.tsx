interface CustomButtonProps {
  title: string;
  bgColor: string;
  textColor: string;
  onClick: () => void;
  style?: string;
  disabled?: boolean;
}

const CustomButton = ({
  title,
  bgColor,
  textColor,
  onClick,
  style,
  disabled = false,
}: CustomButtonProps) => {
  return (
    <button
      className={`${bgColor} ${textColor} ${style} w-full rounded-md px-4 py-2 font-medium transition-colors`}
      onClick={onClick}
      disabled={disabled}
    >
      {title}
    </button>
  );
};

export default CustomButton;
