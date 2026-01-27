import { useState } from "react";

export function Tabs({ tabs, defaultValue, onTabChange }) {
  const [active, setActive] = useState(defaultValue ?? tabs[0].value);

  const handleChange = (value) => {
    setActive(value);
    onTabChange?.(value);
  };

  return (
    <div>
      <div className="flex bg-stone-100 p-0.5 rounded-lg">
        {tabs.map(({ title, icon: Icon, value }) => (
          <button
            key={value}
            onClick={() => handleChange(value)}
            className={`flex items-center text-sm py-2 px-4 rounded-md transition ${
              active === value ? "bg-red-300 shadow-sm " : ""
            }`}
          >
            {Icon && <Icon className="mr-2 h-4 w-4" />}
            {title}
          </button>
        ))}
      </div>
    </div>
  );
}
