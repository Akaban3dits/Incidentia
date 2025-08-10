type Option = {
  value: string;
  label: string;
};

type Options = {
  placeholder: string;
  items?: Option[];
};

type Props = {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Options;
  required?: boolean;
};

export default function SelectField({ 
  label, 
  value, 
  onChange, 
  options, 
  required = false 
}: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        required={required}
        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
      >
        <option value="">{options.placeholder}</option>
        {options.items?.map((item, index) => (
          <option key={index} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}