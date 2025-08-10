type Props = {
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
  href?: string;
};

export default function SocialButton({ icon, text, onClick, href }: Props) {
  if (href) {
    return (
      <a
        href={href}
        className="flex w-full items-center gap-2 border border-gray-300 rounded px-4 py-2 hover:bg-gray-100 justify-center"
      >
        {icon}
        <span className="flex-1 text-center">{text}</span>
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 border border-gray-300 rounded px-4 py-2 hover:bg-gray-100 justify-center"
    >
      {icon}
      <span className="flex-1 text-center">{text}</span>
    </button>
  );
}
