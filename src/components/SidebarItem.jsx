// Updated SidebarItem component in src/components/SidebarItem.jsx
const SidebarItem = ({ icon, text, active, onClick }) => (
    <li 
      onClick={onClick}
      className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        active 
          ? 'bg-indigo-700 text-white shadow-md' 
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      <span className="text-xl mr-3">{icon}</span>
      <span className="font-medium">{text}</span>
      {active && (
        <span className="ml-auto w-2 h-2 bg-white rounded-full"></span>
      )}
    </li>
  );