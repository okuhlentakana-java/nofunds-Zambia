import { Link } from "react-router-dom";

export default function Navbar({ onMenuClick, title = "Home" }) {
  return (
    <div className="flex items-center justify-between px-4 py-2 
    bg-white shadow-sm sticky top-0 z-30 border-b border-gray-100">

      {/* Left */}
      <div className="flex items-center gap-3">
        <div
          className="text-2xl cursor-pointer"
          onClick={onMenuClick}
        >
          ☰
        </div>

        <div className="font-semibold text-lg text-black">
          {title}
        </div>
      </div>

      {/* Right (Bigger Logo) */}
      <Link to="/">
        <img
          src="/MTN_New Logo-yellow.svg"
          alt="MTN Logo"
          className="h-12 w-auto object-contain transition-transform duration-200 hover:scale-110"
        />
      </Link>
    </div>
  );
}